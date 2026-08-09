import * as THREE from "three";
import { PARTICLE_CONFIG, PARTICLE_TIMELINE } from "./particle-config";
import {
  clamp,
  createSeededRandom,
  easeInOutQuint,
  fisherYates,
  type RandomSource,
} from "./particle-math";
import { sampleParticleWords } from "./shape-samplers";
import type { ParticleShape, SampledWord, SampledWords } from "./particle-types";

type EngineOptions = {
  onUnavailable: () => void;
};

function createPointTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  context.fillStyle = "#fff";
  context.beginPath();
  context.arc(16, 16, 13, 0, Math.PI * 2);
  context.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class ParticleEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly onUnavailable: () => void;
  private readonly random: RandomSource;
  private reducedMotion: boolean;
  private readonly finePointer: boolean;
  private readonly particleCount: number;
  private readonly motionQuery: MediaQueryList;
  private readonly wordMappings = new WeakMap<SampledWord, Uint32Array>();

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private geometry?: THREE.BufferGeometry;
  private material?: THREE.PointsMaterial;
  private pointTexture?: THREE.CanvasTexture;
  private points?: THREE.Points;
  private positionAttribute?: THREE.BufferAttribute;
  private samples?: SampledWords;
  private resizeObserver?: ResizeObserver;
  private viewportObserver?: IntersectionObserver;

  private readonly position: Float32Array;
  private readonly base: Float32Array;
  private readonly source: Float32Array;
  private readonly target: Float32Array;
  private readonly scatter: Float32Array;
  private readonly theodore: Float32Array;
  private readonly ouyang: Float32Array;
  private readonly delay: Float32Array;
  private readonly colors: Float32Array;
  private readonly repX: Float32Array;
  private readonly repY: Float32Array;
  private readonly repVX: Float32Array;
  private readonly repVY: Float32Array;

  private phaseIndex = 0;
  private phaseElapsed = 0;
  private animationFrame = 0;
  private resizeFrame = 0;
  private previousTime = 0;
  private running = false;
  private disposed = false;
  private visibleWidth = 1;
  private visibleHeight = 1;
  private pointerActive = false;
  private pointerPresent = false;
  private pointerWorld = new THREE.Vector3();
  private pointerNdc = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private cameraTargetX = 0;
  private cameraTargetY = 0;
  private unavailable = false;
  private viewportVisible = true;
  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(canvas: HTMLCanvasElement, { onUnavailable }: EngineOptions) {
    this.canvas = canvas;
    this.onUnavailable = onUnavailable;
    this.random = createSeededRandom();
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionQuery.matches;
    this.finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    this.particleCount =
      window.innerWidth <= PARTICLE_CONFIG.mobileBreakpoint
        ? PARTICLE_CONFIG.mobileParticles
        : PARTICLE_CONFIG.desktopParticles;

    const vectorSize = this.particleCount * 3;
    this.position = new Float32Array(vectorSize);
    this.base = new Float32Array(vectorSize);
    this.source = new Float32Array(vectorSize);
    this.target = new Float32Array(vectorSize);
    this.scatter = new Float32Array(vectorSize);
    this.theodore = new Float32Array(vectorSize);
    this.ouyang = new Float32Array(vectorSize);
    this.delay = new Float32Array(this.particleCount);
    this.colors = new Float32Array(vectorSize);
    this.repX = new Float32Array(this.particleCount);
    this.repY = new Float32Array(this.particleCount);
    this.repVX = new Float32Array(this.particleCount);
    this.repVY = new Float32Array(this.particleCount);
  }

  async initialize() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      PARTICLE_CONFIG.camera.fov,
      1,
      PARTICLE_CONFIG.camera.near,
      PARTICLE_CONFIG.camera.far,
    );
    this.camera.position.z = PARTICLE_CONFIG.camera.z;
    this.samples = sampleParticleWords();
    if (this.disposed) return false;

    this.resize(false);
    this.buildScatter();
    this.resetToInitialShape();
    this.buildColors();

    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.position, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setDrawRange(
      0,
      this.reducedMotion
        ? Math.min(PARTICLE_CONFIG.reducedMotionParticles, this.particleCount)
        : this.particleCount,
    );

    this.pointTexture = createPointTexture();
    this.material = new THREE.PointsMaterial({
      alphaMap: this.pointTexture,
      alphaTest: 0.08,
      color: 0xffffff,
      depthWrite: false,
      opacity: PARTICLE_CONFIG.points.wordOpacity,
      size: PARTICLE_CONFIG.points.size,
      sizeAttenuation: false,
      transparent: true,
      vertexColors: true,
    });
    this.material.toneMapped = false;
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.renderCurrentFrame();
    if (this.unavailable) return false;

    window.addEventListener("resize", this.handleResize, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.motionQuery.addEventListener("change", this.handleMotionPreferenceChange);
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(this.handleElementResize);
      this.resizeObserver.observe(this.canvas);
    }
    if ("IntersectionObserver" in window) {
      this.viewportObserver = new IntersectionObserver(this.handleViewportIntersection, {
        rootMargin: "120px 0px",
      });
      this.viewportObserver.observe(this.canvas);
    }
    if (this.finePointer) {
      window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
      window.addEventListener("pointerout", this.handlePointerOut, { passive: true });
    }

    this.syncAnimationState();
    return true;
  }

  private buildColors() {
    const range = PARTICLE_CONFIG.points.maximumGray - PARTICLE_CONFIG.points.minimumGray;
    for (let index = 0; index < this.particleCount; index += 1) {
      const gray = PARTICLE_CONFIG.points.minimumGray + this.random() * range;
      const offset = index * 3;
      this.colors[offset] = Math.min(
        1,
        Math.max(0, gray + PARTICLE_CONFIG.points.redOffset),
      );
      this.colors[offset + 1] = gray;
      this.colors[offset + 2] = Math.min(
        1,
        Math.max(0, gray + PARTICLE_CONFIG.points.blueOffset),
      );
    }
  }

  private buildScatter() {
    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3;
      const centerBias = this.random() < 0.42 ? 0.68 : 1;
      this.scatter[offset] = (this.random() - 0.5) * this.visibleWidth * 0.94 * centerBias;
      this.scatter[offset + 1] =
        (this.random() - 0.5) * this.visibleHeight * 0.86 * centerBias;
      this.scatter[offset + 2] = (this.random() - 0.5) * 42;
    }
  }

  private buildWordTarget(sample: SampledWord, output: Float32Array) {
    if (!this.samples) return;
    const scale = Math.min(
      (this.visibleWidth * PARTICLE_CONFIG.morph.targetWidthRatio) / this.samples.maxWidth,
      (this.visibleHeight * PARTICLE_CONFIG.morph.targetHeightRatio) / this.samples.maxHeight,
    );
    const pointCount = sample.points.length / 3;
    let indices = this.wordMappings.get(sample);
    if (!indices) {
      const shuffled = fisherYates(
        Array.from({ length: pointCount }, (_, index) => index),
        this.random,
      );
      indices = Uint32Array.from(
        { length: this.particleCount },
        (_, index) => shuffled[index % pointCount],
      );
      this.wordMappings.set(sample, indices);
    }
    const jitter = scale * PARTICLE_CONFIG.morph.targetJitterRatio;

    for (let index = 0; index < this.particleCount; index += 1) {
      const targetIndex = indices[index] * 3;
      const offset = index * 3;
      output[offset] = sample.points[targetIndex] * scale + (this.random() - 0.5) * jitter;
      output[offset + 1] =
        sample.points[targetIndex + 1] * scale + (this.random() - 0.5) * jitter;
      output[offset + 2] = (this.random() - 0.5) * 0.7;
    }
  }

  private shape(shape: ParticleShape) {
    if (shape === "theodore") return this.theodore;
    if (shape === "ouyang") return this.ouyang;
    return this.scatter;
  }

  private preparePhase() {
    const phase = PARTICLE_TIMELINE[this.phaseIndex];
    if (phase.kind !== "morph") return;
    this.source.set(this.base);
    this.target.set(this.shape(phase.to));
    for (let index = 0; index < this.particleCount; index += 1) {
      this.delay[index] = this.random() * PARTICLE_CONFIG.morph.maximumDelay;
    }
  }

  private updateTimeline(delta: number, elapsedTime: number) {
    this.phaseElapsed += delta;
    let phase = PARTICLE_TIMELINE[this.phaseIndex];
    while (this.phaseElapsed >= phase.duration) {
      if (phase.kind === "morph") this.base.set(this.target);
      this.phaseElapsed -= phase.duration;
      this.phaseIndex = (this.phaseIndex + 1) % PARTICLE_TIMELINE.length;
      this.preparePhase();
      phase = PARTICLE_TIMELINE[this.phaseIndex];
    }

    if (phase.kind === "morph") {
      const globalProgress = this.phaseElapsed / phase.duration;
      for (let index = 0; index < this.particleCount; index += 1) {
        const particleProgress = clamp(
          (globalProgress - this.delay[index]) / (1 - this.delay[index]),
          0,
          1,
        );
        const eased = easeInOutQuint(particleProgress);
        const offset = index * 3;
        this.base[offset] = this.source[offset] + (this.target[offset] - this.source[offset]) * eased;
        this.base[offset + 1] =
          this.source[offset + 1] + (this.target[offset + 1] - this.source[offset + 1]) * eased;
        this.base[offset + 2] =
          this.source[offset + 2] + (this.target[offset + 2] - this.source[offset + 2]) * eased;
      }
    }

    if (!this.points || !this.material) return;
    const isQuietWord = phase.kind === "hold" && phase.shape !== "scatter";
    const wordAmount =
      phase.kind === "hold"
        ? phase.shape === "scatter"
          ? 0
          : 1
        : phase.to === "scatter"
          ? 1 - this.phaseElapsed / phase.duration
          : this.phaseElapsed / phase.duration;
    this.points.scale.setScalar(isQuietWord ? 1 + Math.sin(elapsedTime * 0.55) * 0.0015 : 1);
    this.material.opacity =
      PARTICLE_CONFIG.points.scatterOpacity +
      (PARTICLE_CONFIG.points.wordOpacity - PARTICLE_CONFIG.points.scatterOpacity) *
        easeInOutQuint(wordAmount) +
      (isQuietWord ? Math.sin(elapsedTime * 0.55) * 0.012 : 0);
  }

  private updatePointer(delta: number, elapsedTime: number) {
    const { radius, force, spring, damping, maximumOffset } = PARTICLE_CONFIG.pointer;
    const radiusSquared = radius * radius;
    const phase = PARTICLE_TIMELINE[this.phaseIndex];
    const scatterHolding = phase.kind === "hold" && phase.shape === "scatter";
    const driftFadeDuration = Math.min(0.8, phase.duration / 2);
    const driftStrength = scatterHolding
      ? clamp(
          Math.min(
            this.phaseElapsed / driftFadeDuration,
            (phase.duration - this.phaseElapsed) / driftFadeDuration,
          ),
          0,
          1,
        )
      : 0;

    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3;
      let forceX = 0;
      let forceY = 0;
      if (this.pointerActive) {
        const dx = this.base[offset] + this.repX[index] - this.pointerWorld.x;
        const dy = this.base[offset + 1] + this.repY[index] - this.pointerWorld.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > 0.0001 && distanceSquared < radiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1 - distance / radius;
          const magnitude = falloff * falloff * force;
          forceX = (dx / distance) * magnitude;
          forceY = (dy / distance) * magnitude;
        }
      }

      this.repVX[index] +=
        (forceX - spring * this.repX[index] - damping * this.repVX[index]) * delta;
      this.repVY[index] +=
        (forceY - spring * this.repY[index] - damping * this.repVY[index]) * delta;
      this.repX[index] = clamp(
        this.repX[index] + this.repVX[index] * delta,
        -maximumOffset,
        maximumOffset,
      );
      this.repY[index] = clamp(
        this.repY[index] + this.repVY[index] * delta,
        -maximumOffset,
        maximumOffset,
      );

      const driftX = scatterHolding
        ? Math.sin(elapsedTime * 0.22 + index * 0.618) * 0.42 * driftStrength
        : 0;
      const driftY = scatterHolding
        ? Math.cos(elapsedTime * 0.18 + index * 0.413) * 0.32 * driftStrength
        : 0;
      this.position[offset] = this.base[offset] + this.repX[index] + driftX;
      this.position[offset + 1] = this.base[offset + 1] + this.repY[index] + driftY;
      this.position[offset + 2] = this.base[offset + 2];
    }
    if (this.positionAttribute) this.positionAttribute.needsUpdate = true;
  }

  private updateCamera(delta: number) {
    if (!this.camera) return;
    const response = Math.min(1, delta * 3.2);
    this.camera.position.x += (this.cameraTargetX - this.camera.position.x) * response;
    this.camera.position.y += (this.cameraTargetY - this.camera.position.y) * response;
    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
  }

  private updatePointerProjection() {
    if (!this.camera || !this.pointerPresent) {
      this.pointerActive = false;
      return;
    }
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    this.pointerActive = Boolean(
      this.raycaster.ray.intersectPlane(this.pointerPlane, this.pointerWorld),
    );
  }

  private start() {
    if (
      this.running ||
      this.disposed ||
      this.unavailable ||
      this.reducedMotion ||
      document.hidden ||
      !this.viewportVisible
    ) {
      return;
    }
    this.running = true;
    this.previousTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
  }

  private renderCurrentFrame() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  private syncAnimationState() {
    if (this.reducedMotion || document.hidden || !this.viewportVisible) this.stop();
    else this.start();
  }

  private animate = (time: number) => {
    if (!this.running || !this.renderer || !this.scene || !this.camera) return;
    const delta = Math.min((time - this.previousTime) / 1_000, 0.05);
    const elapsedTime = time / 1_000;
    this.previousTime = time;
    this.updateTimeline(delta, elapsedTime);
    this.updateCamera(delta);
    this.updatePointerProjection();
    this.updatePointer(delta, elapsedTime);
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private resize(scaleExisting = true) {
    if (this.disposed || this.unavailable || !this.renderer || !this.camera) return;
    const bounds = this.canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const geometryChanged =
      Math.abs(width - this.viewportWidth) > 0.5 ||
      Math.abs(height - this.viewportHeight) > 0.5;
    const previousWidth = this.visibleWidth;
    const previousHeight = this.visibleHeight;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, PARTICLE_CONFIG.maxPixelRatio),
    );
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(PARTICLE_CONFIG.camera.fov / 2)) * PARTICLE_CONFIG.camera.z;
    const visibleWidth = visibleHeight * this.camera.aspect;

    if (scaleExisting && geometryChanged && previousWidth > 1 && previousHeight > 1) {
      const scaleX = visibleWidth / previousWidth;
      const scaleY = visibleHeight / previousHeight;
      for (let index = 0; index < this.particleCount; index += 1) {
        const offset = index * 3;
        this.scatter[offset] *= scaleX;
        this.scatter[offset + 1] *= scaleY;
      }
    }

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.visibleWidth = visibleWidth;
    this.visibleHeight = visibleHeight;
    if (this.samples) {
      this.buildWordTarget(this.samples.theodore, this.theodore);
      this.buildWordTarget(this.samples.ouyang, this.ouyang);
    }
    if (scaleExisting && geometryChanged) this.resetToInitialShape();
    if (this.positionAttribute) this.positionAttribute.needsUpdate = true;
    if (this.reducedMotion && this.scene) this.renderCurrentFrame();
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.camera || this.reducedMotion) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    this.pointerPresent = true;
    this.pointerNdc.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    this.updatePointerProjection();
    this.cameraTargetX = this.pointerNdc.x * PARTICLE_CONFIG.camera.parallaxX;
    this.cameraTargetY = this.pointerNdc.y * PARTICLE_CONFIG.camera.parallaxY;
  };

  private handlePointerOut = (event: PointerEvent) => {
    if (event.relatedTarget) return;
    this.pointerPresent = false;
    this.pointerActive = false;
    this.cameraTargetX = 0;
    this.cameraTargetY = 0;
  };

  private handleResize = () => {
    if (this.disposed || this.unavailable) return;
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => this.resize());
  };

  private handleElementResize: ResizeObserverCallback = () => {
    this.handleResize();
  };

  private handleVisibilityChange = () => {
    this.syncAnimationState();
  };

  private handleViewportIntersection: IntersectionObserverCallback = (entries) => {
    const entry = entries[0];
    if (!entry) return;
    this.viewportVisible = entry.isIntersecting;
    this.syncAnimationState();
  };

  private resetToInitialShape() {
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    const initialShape = this.shape(PARTICLE_CONFIG.initialShape);
    this.base.set(initialShape);
    this.position.set(initialShape);
    this.source.set(initialShape);
    this.target.set(initialShape);
    this.repX.fill(0);
    this.repY.fill(0);
    this.repVX.fill(0);
    this.repVY.fill(0);
    if (this.positionAttribute) this.positionAttribute.needsUpdate = true;
    this.geometry?.setDrawRange(
      0,
      this.reducedMotion
        ? Math.min(PARTICLE_CONFIG.reducedMotionParticles, this.particleCount)
        : this.particleCount,
    );
    this.points?.scale.setScalar(1);
    if (this.material) this.material.opacity = PARTICLE_CONFIG.points.wordOpacity;
    if (this.camera) {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.lookAt(0, 0, 0);
    }
  }

  private handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.pointerPresent = false;
    this.pointerActive = false;
    this.cameraTargetX = 0;
    this.cameraTargetY = 0;
    this.resetToInitialShape();
    if (this.reducedMotion) {
      this.stop();
      this.renderCurrentFrame();
    } else this.syncAnimationState();
  };

  private handleContextLost = () => {
    if (this.unavailable || this.disposed) return;
    this.unavailable = true;
    this.stop();
    this.canvas.hidden = true;
    this.detachRuntimeListeners();
    this.onUnavailable();
  };

  private detachRuntimeListeners() {
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = 0;
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.motionQuery.removeEventListener("change", this.handleMotionPreferenceChange);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.viewportObserver?.disconnect();
    this.viewportObserver = undefined;
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerout", this.handlePointerOut);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.detachRuntimeListeners();
    this.geometry?.dispose();
    this.material?.dispose();
    this.pointTexture?.dispose();
    this.renderer?.dispose();
  }
}
