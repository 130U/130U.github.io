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
import {
  advanceCriticalSpring,
  advanceCriticalSpringTo,
  createSpatialPose,
  mapDragAngle,
  phaseInteractionGain,
  resetSpatialPose,
  type SpatialAxis,
} from "./spatial-motion";
import type {
  ParticleMode,
  ParticleShape,
  SampledWord,
  SampledWords,
} from "./particle-types";

type EngineOptions = {
  initialMode: ParticleMode;
  onUnavailable: () => void;
};

type ModeTransition = "toAmbient" | "toHero";
type HeroReturnKind = "resume" | "canonical";

const STAR_VERTEX_SHADER = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aAlpha;
  attribute float aSize;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = clamp(130.0 / max(48.0, -viewPosition.z), 0.72, 1.35);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = max(1.25, aSize * uPixelRatio * depthScale);
    vAlpha = aAlpha;
    vColor = color;
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (distanceFromCenter > 1.0) discard;

    float core = 1.0 - smoothstep(0.12, 0.72, distanceFromCenter);
    float halo = (1.0 - smoothstep(0.3, 0.98, distanceFromCenter)) * 0.42;
    float light = max(core, halo);
    gl_FragColor = vec4(vColor, vAlpha * light);
  }
`;

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
  private spatialGroup?: THREE.Group;
  private geometry?: THREE.BufferGeometry;
  private material?: THREE.ShaderMaterial;
  private points?: THREE.Points;
  private positionAttribute?: THREE.BufferAttribute;
  private alphaAttribute?: THREE.BufferAttribute;
  private samples?: SampledWords;
  private resizeObserver?: ResizeObserver;
  private viewportObserver?: IntersectionObserver;

  private readonly position: Float32Array;
  private readonly base: Float32Array;
  private readonly baseVelocity: Float32Array;
  private readonly previousBase: Float32Array;
  private readonly source: Float32Array;
  private readonly target: Float32Array;
  private readonly modeTarget: Float32Array;
  private readonly scatter: Float32Array;
  private readonly theodore: Float32Array;
  private readonly ouyang: Float32Array;
  private readonly delay: Float32Array;
  private readonly colors: Float32Array;
  private readonly sizes: Float32Array;
  private readonly alphas: Float32Array;
  private readonly ambientAlphas: Float32Array;
  private readonly scatterAlphas: Float32Array;
  private readonly wordAlphas: Float32Array;
  private readonly depthFactors: Float32Array;
  private readonly wordDepth: Float32Array;
  private readonly ambientAnchor: Uint8Array;
  private readonly brightStar: Uint8Array;
  private readonly twinklePhase: Float32Array;
  private readonly twinkleSpeed: Float32Array;
  private readonly twinkleAmount: Float32Array;
  private readonly driftPhaseX: Float32Array;
  private readonly driftPhaseY: Float32Array;
  private readonly driftSpeed: Float32Array;
  private readonly repX: Float32Array;
  private readonly repY: Float32Array;
  private readonly repVX: Float32Array;
  private readonly repVY: Float32Array;

  private readonly heroReturnBase: Float32Array;
  private readonly heroReturnSource: Float32Array;
  private readonly heroReturnTarget: Float32Array;
  private readonly heroReturnDelay: Float32Array;
  private heroReturnKind?: HeroReturnKind;
  private heroReturnPhaseIndex = 0;
  private heroReturnPhaseElapsed = 0;
  private heroReturnWordAmount = 1;

  private desiredMode: ParticleMode;
  private modeTransition?: ModeTransition;
  private transitionElapsed = 0;
  private readonly ambientBlend: SpatialAxis;
  private readonly semanticSuppression: SpatialAxis;
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
  private readonly pointerLocal = new THREE.Vector3();
  private readonly pointerNdc = new THREE.Vector2();
  private readonly raycaster = new THREE.Raycaster();
  private readonly localRay = new THREE.Ray();
  private readonly localPointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly inverseSpatialMatrix = new THREE.Matrix4();
  private cameraTargetX = 0;
  private cameraTargetY = 0;
  private wordAmount = 1;
  private readonly spatialPose = createSpatialPose();
  private dragPointerId: number | undefined;
  private dragStarted = false;
  private dragOriginX = 0;
  private dragOriginY = 0;
  private dragOriginYaw = 0;
  private dragOriginPitch = 0;
  private dragPreviousTime = 0;
  private unavailable = false;
  private viewportVisible = true;
  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(canvas: HTMLCanvasElement, { initialMode, onUnavailable }: EngineOptions) {
    this.canvas = canvas;
    this.onUnavailable = onUnavailable;
    this.desiredMode = initialMode;
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
    this.baseVelocity = new Float32Array(vectorSize);
    this.previousBase = new Float32Array(vectorSize);
    this.source = new Float32Array(vectorSize);
    this.target = new Float32Array(vectorSize);
    this.modeTarget = new Float32Array(vectorSize);
    this.scatter = new Float32Array(vectorSize);
    this.theodore = new Float32Array(vectorSize);
    this.ouyang = new Float32Array(vectorSize);
    this.delay = new Float32Array(this.particleCount);
    this.colors = new Float32Array(vectorSize);
    this.sizes = new Float32Array(this.particleCount);
    this.alphas = new Float32Array(this.particleCount);
    this.ambientAlphas = new Float32Array(this.particleCount);
    this.scatterAlphas = new Float32Array(this.particleCount);
    this.wordAlphas = new Float32Array(this.particleCount);
    this.depthFactors = new Float32Array(this.particleCount);
    this.wordDepth = new Float32Array(this.particleCount);
    this.ambientAnchor = new Uint8Array(this.particleCount);
    this.brightStar = new Uint8Array(this.particleCount);
    this.twinklePhase = new Float32Array(this.particleCount);
    this.twinkleSpeed = new Float32Array(this.particleCount);
    this.twinkleAmount = new Float32Array(this.particleCount);
    this.driftPhaseX = new Float32Array(this.particleCount);
    this.driftPhaseY = new Float32Array(this.particleCount);
    this.driftSpeed = new Float32Array(this.particleCount);
    this.repX = new Float32Array(this.particleCount);
    this.repY = new Float32Array(this.particleCount);
    this.repVX = new Float32Array(this.particleCount);
    this.repVY = new Float32Array(this.particleCount);
    this.heroReturnBase = new Float32Array(vectorSize);
    this.heroReturnSource = new Float32Array(vectorSize);
    this.heroReturnTarget = new Float32Array(vectorSize);
    this.heroReturnDelay = new Float32Array(this.particleCount);
    this.ambientBlend = {
      value: initialMode === "ambient" ? 1 : 0,
      velocity: 0,
    };
    this.semanticSuppression = {
      value: initialMode === "ambient" ? 1 : 0,
      velocity: 0,
    };
    this.buildWordDepth();
    this.buildStarIdentity();
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
    this.buildWordTargets();
    this.buildColors();
    this.resetForMode(this.desiredMode);

    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.position, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.alphaAttribute = new THREE.BufferAttribute(this.alphas, 1);
    this.alphaAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute("aAlpha", this.alphaAttribute);
    this.geometry.setDrawRange(
      0,
      this.reducedMotion
        ? Math.min(PARTICLE_CONFIG.reducedMotionParticles, this.particleCount)
        : this.particleCount,
    );

    this.material = new THREE.ShaderMaterial({
      blending: THREE.NormalBlending,
      depthTest: true,
      depthWrite: false,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uPixelRatio: {
          value: Math.min(window.devicePixelRatio || 1, PARTICLE_CONFIG.maxPixelRatio),
        },
      },
      vertexColors: true,
      vertexShader: STAR_VERTEX_SHADER,
    });
    this.material.toneMapped = false;
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.spatialGroup = new THREE.Group();
    this.spatialGroup.add(this.points);
    this.scene.add(this.spatialGroup);

    this.updateParticles(0, performance.now() / 1_000);
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
      window.addEventListener("pointerdown", this.handlePointerDown);
      window.addEventListener("pointerup", this.handlePointerUp);
      window.addEventListener("pointercancel", this.handlePointerUp);
    }

    this.syncAnimationState();
    return true;
  }

  setMode(mode: ParticleMode) {
    if (this.disposed || this.unavailable || mode === this.desiredMode) return;

    const previousMode = this.desiredMode;
    if (mode === "ambient" && previousMode === "hero" && !this.modeTransition) {
      this.captureHeroReturn();
    }

    this.desiredMode = mode;
    this.transitionElapsed = 0;
    this.resetSpatialInteraction();

    if (this.reducedMotion) {
      this.resetForMode(mode);
      this.renderCurrentFrame();
      return;
    }

    if (mode === "ambient") {
      this.modeTarget.set(this.scatter);
      this.modeTransition = "toAmbient";
    } else {
      if (this.modeTransition === "toAmbient" && this.heroReturnKind) {
        this.modeTarget.set(this.heroReturnBase);
      } else {
        this.prepareCanonicalHeroReturn();
        this.modeTarget.set(this.heroReturnBase);
      }
      this.modeTransition = "toHero";
    }
    this.syncAnimationState();
  }

  private buildWordDepth() {
    const halfDepth = PARTICLE_CONFIG.spatial.wordDepth / 2;
    for (let index = 0; index < this.particleCount; index += 1) {
      const direction = this.random() < 0.5 ? -1 : 1;
      const magnitude =
        Math.pow(this.random(), PARTICLE_CONFIG.spatial.depthCurve) * halfDepth;
      this.wordDepth[index] = direction * magnitude;
    }
  }

  private buildStarIdentity() {
    const points = PARTICLE_CONFIG.points;
    const ambient = PARTICLE_CONFIG.ambient;
    for (let index = 0; index < this.particleCount; index += 1) {
      const depth = Math.pow(this.random(), 1.65);
      const bright = this.random() < points.brightStarRatio;
      const anchor = this.random() < points.ambientAnchorRatio;
      const sizeVariation = 0.88 + this.random() * 0.24;
      const regularSize =
        points.sizeMinimum +
        (points.sizeMaximum - points.sizeMinimum) * Math.pow(depth, 1.8);
      const ambientOpacity =
        points.ambientOpacityMinimum +
        (points.ambientOpacityMaximum - points.ambientOpacityMinimum) *
          Math.pow(this.random(), 2.45);

      this.depthFactors[index] = depth;
      this.brightStar[index] = bright ? 1 : 0;
      this.ambientAnchor[index] = anchor ? 1 : 0;
      this.sizes[index] =
        (bright ? points.brightSize * (0.9 + this.random() * 0.2) : regularSize) *
        sizeVariation;
      this.ambientAlphas[index] = clamp(
        ambientOpacity + (anchor ? points.ambientAnchorBoost : 0) + (bright ? 0.34 : 0),
        0,
        0.72,
      );
      this.scatterAlphas[index] = clamp(0.28 + depth * 0.3 + (bright ? 0.18 : 0), 0, 0.76);
      this.wordAlphas[index] = clamp(0.78 + depth * 0.2 + (bright ? 0.04 : 0), 0, 1);
      this.twinklePhase[index] = this.random() * Math.PI * 2;
      this.twinkleSpeed[index] = 0.24 + this.random() * 0.42;
      this.twinkleAmount[index] =
        ambient.twinkleMinimum +
        (ambient.twinkleMaximum - ambient.twinkleMinimum) * this.random();
      this.driftPhaseX[index] = this.random() * Math.PI * 2;
      this.driftPhaseY[index] = this.random() * Math.PI * 2;
      this.driftSpeed[index] =
        ambient.driftSpeedMinimum +
        (ambient.driftSpeedMaximum - ambient.driftSpeedMinimum) * this.random();
    }
  }

  private buildColors() {
    const { palette } = PARTICLE_CONFIG.points;
    const far = new THREE.Color(palette.far);
    const middle = new THREE.Color(palette.middle);
    const near = new THREE.Color(palette.near);
    const ice = new THREE.Color(palette.ice);
    const warm = new THREE.Color(palette.warm);
    const lavender = new THREE.Color(palette.lavender);
    const color = new THREE.Color();

    for (let index = 0; index < this.particleCount; index += 1) {
      const depth = this.depthFactors[index];
      const accent = this.random();
      let accentBoost = 0;
      if (this.brightStar[index] && accent < 0.5) {
        color.copy(ice);
        accentBoost = 0.12;
      } else if (accent < palette.lavenderRatio) {
        color.copy(lavender);
        accentBoost = 0.09;
      } else if (accent < palette.lavenderRatio + palette.warmRatio) {
        color.copy(warm);
        accentBoost = 0.1;
      } else if (
        accent < palette.lavenderRatio + palette.warmRatio + palette.iceRatio
      ) {
        color.copy(ice);
        accentBoost = 0.05;
      } else if (depth < 0.5) color.copy(far).lerp(middle, depth * 2);
      else color.copy(middle).lerp(near, (depth - 0.5) * 2);

      if (accentBoost > 0) {
        this.ambientAlphas[index] = clamp(
          this.ambientAlphas[index] + accentBoost,
          0,
          0.78,
        );
        this.scatterAlphas[index] = clamp(
          this.scatterAlphas[index] + accentBoost * 0.72,
          0,
          0.82,
        );
        this.wordAlphas[index] = clamp(
          this.wordAlphas[index] + accentBoost * 0.45,
          0,
          1,
        );
        this.sizes[index] *= 1 + accentBoost * 0.7;
      }

      const variation = (this.random() - 0.5) * palette.tonalVariation;
      const offset = index * 3;
      this.colors[offset] = clamp(color.r + variation, 0, 1);
      this.colors[offset + 1] = clamp(color.g + variation, 0, 1);
      this.colors[offset + 2] = clamp(color.b + variation, 0, 1);
    }
  }

  private buildScatter() {
    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3;
      const centerBias = this.random() < 0.42 ? 0.68 : 1;
      this.scatter[offset] = (this.random() - 0.5) * this.visibleWidth * 0.94 * centerBias;
      this.scatter[offset + 1] =
        (this.random() - 0.5) * this.visibleHeight * 0.86 * centerBias;
      this.scatter[offset + 2] =
        (this.depthFactors[index] - 0.5) * 42 + (this.random() - 0.5) * 5;
    }
  }

  private buildWordTargets() {
    if (!this.samples) return;
    this.buildWordTarget(this.samples.theodore, this.theodore);
    this.buildWordTarget(this.samples.ouyang, this.ouyang);
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
      const offset = index * 3;
      if (this.ambientAnchor[index]) {
        output[offset] = this.scatter[offset];
        output[offset + 1] = this.scatter[offset + 1];
        output[offset + 2] = this.scatter[offset + 2];
        continue;
      }

      const targetIndex = indices[index] * 3;
      const depth = this.wordDepth[index];
      const projectionCompensation =
        (PARTICLE_CONFIG.camera.z - depth) / PARTICLE_CONFIG.camera.z;
      output[offset] =
        (sample.points[targetIndex] * scale + (this.random() - 0.5) * jitter) *
        projectionCompensation;
      output[offset + 1] =
        (sample.points[targetIndex + 1] * scale + (this.random() - 0.5) * jitter) *
        projectionCompensation;
      output[offset + 2] = depth;
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
    if (this.desiredMode !== "hero" || this.modeTransition) return;

    this.previousBase.set(this.base);
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

    const inverseDelta = delta > 0 ? 1 / delta : 0;
    for (let index = 0; index < this.base.length; index += 1) {
      this.baseVelocity[index] = (this.base[index] - this.previousBase[index]) * inverseDelta;
    }

    const isQuietWord = phase.kind === "hold" && phase.shape !== "scatter";
    this.wordAmount =
      phase.kind === "hold"
        ? phase.shape === "scatter"
          ? 0
          : 1
        : phase.to === "scatter"
          ? 1 - this.phaseElapsed / phase.duration
          : this.phaseElapsed / phase.duration;
    this.points?.scale.setScalar(isQuietWord ? 1 + Math.sin(elapsedTime * 0.55) * 0.0015 : 1);
  }

  private captureHeroReturn() {
    this.heroReturnBase.set(this.base);
    this.heroReturnSource.set(this.source);
    this.heroReturnTarget.set(this.target);
    this.heroReturnDelay.set(this.delay);
    this.heroReturnPhaseIndex = this.phaseIndex;
    this.heroReturnPhaseElapsed = this.phaseElapsed;
    this.heroReturnWordAmount = this.wordAmount;
    this.heroReturnKind = "resume";
  }

  private prepareCanonicalHeroReturn() {
    this.heroReturnBase.set(this.theodore);
    this.heroReturnSource.set(this.theodore);
    this.heroReturnTarget.set(this.theodore);
    this.heroReturnDelay.fill(0);
    this.heroReturnPhaseIndex = 0;
    this.heroReturnPhaseElapsed = 0;
    this.heroReturnWordAmount = 1;
    this.heroReturnKind = "canonical";
  }

  private updateModeTransition(delta: number) {
    const ambientTarget = this.desiredMode === "ambient" ? 1 : 0;
    const response =
      this.desiredMode === "ambient"
        ? PARTICLE_CONFIG.ambient.transitionResponse
        : PARTICLE_CONFIG.ambient.heroReturnResponse;
    advanceCriticalSpringTo(this.ambientBlend, ambientTarget, delta, response);
    advanceCriticalSpringTo(
      this.semanticSuppression,
      ambientTarget,
      delta,
      PARTICLE_CONFIG.ambient.semanticResponse,
    );

    if (!this.modeTransition) return;
    this.transitionElapsed += delta;
    const angularFrequency = 4.6 / response;
    const decay = Math.exp(-angularFrequency * delta);

    for (let index = 0; index < this.base.length; index += 1) {
      const displacement = this.base[index] - this.modeTarget[index];
      const coupling = this.baseVelocity[index] + angularFrequency * displacement;
      this.base[index] =
        this.modeTarget[index] + (displacement + coupling * delta) * decay;
      this.baseVelocity[index] =
        (this.baseVelocity[index] - angularFrequency * coupling * delta) * decay;
    }

    if (this.transitionElapsed < response * 1.12) return;
    this.base.set(this.modeTarget);
    this.baseVelocity.fill(0);
    this.ambientBlend.value = ambientTarget;
    this.ambientBlend.velocity = 0;
    this.semanticSuppression.value = ambientTarget;
    this.semanticSuppression.velocity = 0;

    if (this.modeTransition === "toAmbient") {
      this.wordAmount = 0;
      this.heroReturnKind = undefined;
    } else if (this.heroReturnKind === "resume") {
      this.source.set(this.heroReturnSource);
      this.target.set(this.heroReturnTarget);
      this.delay.set(this.heroReturnDelay);
      this.phaseIndex = this.heroReturnPhaseIndex;
      this.phaseElapsed = this.heroReturnPhaseElapsed;
      this.wordAmount = this.heroReturnWordAmount;
      this.heroReturnKind = undefined;
    } else {
      this.phaseIndex = 0;
      this.phaseElapsed = 0;
      this.wordAmount = 1;
      this.source.set(this.theodore);
      this.target.set(this.theodore);
      this.delay.fill(0);
      this.heroReturnKind = undefined;
    }
    this.modeTransition = undefined;
    this.transitionElapsed = 0;
  }

  private updateParticles(delta: number, elapsedTime: number) {
    const { radius, force, spring, damping, maximumOffset } = PARTICLE_CONFIG.pointer;
    const radiusSquared = radius * radius;
    const phase = PARTICLE_TIMELINE[this.phaseIndex];
    const scatterHolding =
      this.desiredMode === "hero" &&
      !this.modeTransition &&
      phase.kind === "hold" &&
      phase.shape === "scatter";
    const ambientAmount = this.ambientBlend.value;
    const effectiveWordAmount =
      this.wordAmount * (1 - this.semanticSuppression.value);
    const repulsionGain =
      phaseInteractionGain(
        effectiveWordAmount,
        PARTICLE_CONFIG.spatial.scatterRepulsionGain,
      ) *
      (1 - ambientAmount) *
      (this.dragStarted ? PARTICLE_CONFIG.spatial.draggingRepulsionGain : 1);
    const driftFadeDuration = Math.min(0.8, phase.duration / 2);
    const heroDriftStrength = scatterHolding
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
      if (this.pointerActive && repulsionGain > 0.001) {
        const dx = this.base[offset] + this.repX[index] - this.pointerLocal.x;
        const dy = this.base[offset + 1] + this.repY[index] - this.pointerLocal.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > 0.0001 && distanceSquared < radiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1 - distance / radius;
          const magnitude = falloff * falloff * force * repulsionGain;
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

      const depthGain = 0.42 + this.depthFactors[index] * 0.58;
      const heroDriftX =
        Math.sin(elapsedTime * 0.22 + this.driftPhaseX[index]) *
        0.42 *
        heroDriftStrength;
      const heroDriftY =
        Math.cos(elapsedTime * 0.18 + this.driftPhaseY[index]) *
        0.32 *
        heroDriftStrength;
      const ambientDriftX =
        Math.sin(elapsedTime * this.driftSpeed[index] + this.driftPhaseX[index]) *
        PARTICLE_CONFIG.ambient.driftX *
        depthGain *
        ambientAmount;
      const ambientDriftY =
        Math.cos(
          elapsedTime * this.driftSpeed[index] * 0.83 + this.driftPhaseY[index],
        ) *
        PARTICLE_CONFIG.ambient.driftY *
        depthGain *
        ambientAmount;
      this.position[offset] =
        this.base[offset] + this.repX[index] + heroDriftX + ambientDriftX;
      this.position[offset + 1] =
        this.base[offset + 1] + this.repY[index] + heroDriftY + ambientDriftY;
      this.position[offset + 2] = this.base[offset + 2];

      const heroAlpha = this.ambientAnchor[index]
        ? this.ambientAlphas[index] * 0.86
        : this.scatterAlphas[index] +
          (this.wordAlphas[index] - this.scatterAlphas[index]) *
            easeInOutQuint(effectiveWordAmount);
      const modeAlpha =
        heroAlpha + (this.ambientAlphas[index] - heroAlpha) * ambientAmount;
      const twinkle =
        1 +
        Math.sin(elapsedTime * this.twinkleSpeed[index] + this.twinklePhase[index]) *
          this.twinkleAmount[index] *
          ambientAmount;
      this.alphas[index] = clamp(modeAlpha * twinkle, 0, 1);
    }
    if (this.positionAttribute) this.positionAttribute.needsUpdate = true;
    if (this.alphaAttribute) this.alphaAttribute.needsUpdate = true;
  }

  private updateCamera(delta: number) {
    if (!this.camera) return;
    const ambientAmount = this.ambientBlend.value;
    const parallaxX =
      PARTICLE_CONFIG.camera.parallaxX +
      (PARTICLE_CONFIG.ambient.parallaxX - PARTICLE_CONFIG.camera.parallaxX) *
        ambientAmount;
    const parallaxY =
      PARTICLE_CONFIG.camera.parallaxY +
      (PARTICLE_CONFIG.ambient.parallaxY - PARTICLE_CONFIG.camera.parallaxY) *
        ambientAmount;
    this.cameraTargetX = this.pointerPresent ? this.pointerNdc.x * parallaxX : 0;
    this.cameraTargetY = this.pointerPresent ? this.pointerNdc.y * parallaxY : 0;
    const response = Math.min(1, delta * 3.2);
    this.camera.position.x += (this.cameraTargetX - this.camera.position.x) * response;
    this.camera.position.y += (this.cameraTargetY - this.camera.position.y) * response;
    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
  }

  private updateSpatialPose(delta: number) {
    if (!this.spatialGroup) return;

    if (!this.dragStarted) {
      advanceCriticalSpring(
        this.spatialPose.yaw,
        delta,
        PARTICLE_CONFIG.spatial.releaseResponse,
      );
      advanceCriticalSpring(
        this.spatialPose.pitch,
        delta,
        PARTICLE_CONFIG.spatial.releaseResponse,
      );
    }

    const heroGain = phaseInteractionGain(
      this.wordAmount * (1 - this.semanticSuppression.value),
      PARTICLE_CONFIG.spatial.scatterPoseGain,
    );
    const gain =
      heroGain * (1 - this.ambientBlend.value) +
      PARTICLE_CONFIG.spatial.ambientPoseGain * this.ambientBlend.value;
    this.spatialGroup.rotation.y = this.spatialPose.yaw.value * gain;
    this.spatialGroup.rotation.x = this.spatialPose.pitch.value * gain;
    this.spatialGroup.updateMatrixWorld(true);
  }

  private updatePointerProjection() {
    if (
      !this.camera ||
      !this.spatialGroup ||
      !this.pointerPresent ||
      this.desiredMode !== "hero"
    ) {
      this.pointerActive = false;
      return;
    }
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    this.inverseSpatialMatrix.copy(this.spatialGroup.matrixWorld).invert();
    this.localRay.copy(this.raycaster.ray).applyMatrix4(this.inverseSpatialMatrix);
    this.pointerActive = Boolean(
      this.localRay.intersectPlane(this.localPointerPlane, this.pointerLocal),
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
    this.updateModeTransition(delta);
    this.updateTimeline(delta, elapsedTime);
    this.updateCamera(delta);
    this.updateSpatialPose(delta);
    this.updatePointerProjection();
    this.updateParticles(delta, elapsedTime);
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private scaleVectorField(field: Float32Array, scaleX: number, scaleY: number) {
    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3;
      field[offset] *= scaleX;
      field[offset + 1] *= scaleY;
    }
  }

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
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      PARTICLE_CONFIG.maxPixelRatio,
    );

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    if (this.material) this.material.uniforms.uPixelRatio.value = pixelRatio;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const visibleHeight =
      2 *
      Math.tan(THREE.MathUtils.degToRad(PARTICLE_CONFIG.camera.fov / 2)) *
      PARTICLE_CONFIG.camera.z;
    const visibleWidth = visibleHeight * this.camera.aspect;

    if (scaleExisting && geometryChanged && previousWidth > 1 && previousHeight > 1) {
      const scaleX = visibleWidth / previousWidth;
      const scaleY = visibleHeight / previousHeight;
      for (const field of [
        this.scatter,
        this.base,
        this.position,
        this.source,
        this.target,
        this.modeTarget,
        this.heroReturnBase,
        this.heroReturnSource,
        this.heroReturnTarget,
      ]) {
        this.scaleVectorField(field, scaleX, scaleY);
      }
    }

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.visibleWidth = visibleWidth;
    this.visibleHeight = visibleHeight;
    this.buildWordTargets();

    if (scaleExisting && geometryChanged) {
      if (!this.modeTransition) {
        if (this.desiredMode === "hero") this.resetToInitialShape();
        else this.resetForMode("ambient");
      }
      else if (this.desiredMode === "ambient") this.modeTarget.set(this.scatter);
      else this.modeTarget.set(this.heroReturnBase);
    }
    if (this.positionAttribute) this.positionAttribute.needsUpdate = true;
    if (this.reducedMotion && this.scene) this.renderCurrentFrame();
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.camera || this.reducedMotion) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    this.pointerPresent = true;
    this.pointerNdc.set(
      clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
      clamp(-((event.clientY - bounds.top) / bounds.height) * 2 + 1, -1, 1),
    );
    if (this.desiredMode === "hero") this.updateSpatialDrag(event);
    this.updatePointerProjection();
  };

  private handlePointerDown = (event: PointerEvent) => {
    const bounds = this.canvas.getBoundingClientRect();
    const target = event.target instanceof Element ? event.target : undefined;
    if (
      this.desiredMode !== "hero" ||
      this.modeTransition ||
      event.button !== 0 ||
      !event.isPrimary ||
      this.reducedMotion ||
      this.dragPointerId !== undefined ||
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom ||
      target?.closest("a, button, input, textarea, select, [role='button']")
    ) {
      return;
    }

    event.preventDefault();
    this.dragPointerId = event.pointerId;
    this.dragStarted = false;
    this.dragOriginX = event.clientX;
    this.dragOriginY = event.clientY;
    this.dragOriginYaw = this.spatialPose.yaw.value;
    this.dragOriginPitch = this.spatialPose.pitch.value;
    this.dragPreviousTime = event.timeStamp;
  };

  private updateSpatialDrag(event: PointerEvent) {
    if (event.pointerId !== this.dragPointerId) return;

    const deltaX = event.clientX - this.dragOriginX;
    const deltaY = event.clientY - this.dragOriginY;
    const eventDelta = clamp(
      (event.timeStamp - this.dragPreviousTime) / 1_000,
      1 / 240,
      0.05,
    );
    this.dragPreviousTime = event.timeStamp;

    if (
      !this.dragStarted &&
      Math.hypot(deltaX, deltaY) < PARTICLE_CONFIG.spatial.dragThreshold
    ) {
      return;
    }

    this.dragStarted = true;
    const degreesToRadians = THREE.MathUtils.degToRad;
    const nextYaw = mapDragAngle(
      this.dragOriginYaw,
      deltaX,
      PARTICLE_CONFIG.spatial.dragTravelX,
      degreesToRadians(PARTICLE_CONFIG.spatial.yawSoftLimit),
      degreesToRadians(PARTICLE_CONFIG.spatial.yawHardLimit),
    );
    const nextPitch = mapDragAngle(
      this.dragOriginPitch,
      -deltaY,
      PARTICLE_CONFIG.spatial.dragTravelY,
      degreesToRadians(PARTICLE_CONFIG.spatial.pitchSoftLimit),
      degreesToRadians(PARTICLE_CONFIG.spatial.pitchHardLimit),
    );
    const velocityBlend = 0.65;
    this.spatialPose.yaw.velocity =
      this.spatialPose.yaw.velocity * (1 - velocityBlend) +
      ((nextYaw - this.spatialPose.yaw.value) / eventDelta) * velocityBlend;
    this.spatialPose.pitch.velocity =
      this.spatialPose.pitch.velocity * (1 - velocityBlend) +
      ((nextPitch - this.spatialPose.pitch.value) / eventDelta) * velocityBlend;
    this.spatialPose.yaw.value = nextYaw;
    this.spatialPose.pitch.value = nextPitch;
  }

  private handlePointerUp = (event: PointerEvent) => {
    this.finishSpatialDrag(event.pointerId);
  };

  private finishSpatialDrag(pointerId: number) {
    if (pointerId !== this.dragPointerId) return;

    const wasDragging = this.dragStarted;
    this.dragPointerId = undefined;
    this.dragStarted = false;

    if (!wasDragging) return;
    const maximumVelocity = THREE.MathUtils.degToRad(
      PARTICLE_CONFIG.spatial.maximumReleaseVelocity,
    );
    this.spatialPose.yaw.velocity = clamp(
      this.spatialPose.yaw.velocity * PARTICLE_CONFIG.spatial.releaseVelocityRetention,
      -maximumVelocity,
      maximumVelocity,
    );
    this.spatialPose.pitch.velocity = clamp(
      this.spatialPose.pitch.velocity * PARTICLE_CONFIG.spatial.releaseVelocityRetention,
      -maximumVelocity,
      maximumVelocity,
    );
  }

  private handlePointerOut = (event: PointerEvent) => {
    if (event.relatedTarget) return;
    if (this.dragPointerId !== undefined) this.finishSpatialDrag(this.dragPointerId);
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

  private resetSpatialInteraction() {
    this.dragPointerId = undefined;
    this.dragStarted = false;
    resetSpatialPose(this.spatialPose);
    this.spatialGroup?.rotation.set(0, 0, 0);
    this.spatialGroup?.updateMatrixWorld(true);
  }

  private resetToInitialShape() {
    this.resetForMode("hero");
  }

  private resetForMode(mode: ParticleMode) {
    this.desiredMode = mode;
    this.modeTransition = undefined;
    this.transitionElapsed = 0;
    this.heroReturnKind = undefined;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.wordAmount = mode === "hero" ? 1 : 0;
    this.ambientBlend.value = mode === "ambient" ? 1 : 0;
    this.ambientBlend.velocity = 0;
    this.semanticSuppression.value = mode === "ambient" ? 1 : 0;
    this.semanticSuppression.velocity = 0;
    this.resetSpatialInteraction();
    const initialShape =
      mode === "hero" ? this.shape(PARTICLE_CONFIG.initialShape) : this.scatter;
    this.base.set(initialShape);
    this.position.set(initialShape);
    this.source.set(initialShape);
    this.target.set(initialShape);
    this.modeTarget.set(initialShape);
    this.baseVelocity.fill(0);
    this.repX.fill(0);
    this.repY.fill(0);
    this.repVX.fill(0);
    this.repVY.fill(0);
    this.geometry?.setDrawRange(
      0,
      this.reducedMotion
        ? Math.min(PARTICLE_CONFIG.reducedMotionParticles, this.particleCount)
        : this.particleCount,
    );
    this.points?.scale.setScalar(1);
    if (this.camera) {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.lookAt(0, 0, 0);
    }
    this.updateParticles(0, performance.now() / 1_000);
  }

  private handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.pointerPresent = false;
    this.pointerActive = false;
    this.cameraTargetX = 0;
    this.cameraTargetY = 0;
    this.resetForMode(this.desiredMode);
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
    this.resetSpatialInteraction();
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
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.detachRuntimeListeners();
    this.geometry?.dispose();
    this.material?.dispose();
    if (this.spatialGroup) this.scene?.remove(this.spatialGroup);
    this.renderer?.dispose();
  }
}
