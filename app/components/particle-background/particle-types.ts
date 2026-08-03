export type ParticleShape = "scatter" | "theodore" | "ouyang";

export type TimelinePhase =
  | {
      kind: "hold";
      shape: ParticleShape;
      duration: number;
    }
  | {
      kind: "morph";
      to: ParticleShape;
      duration: number;
    };

export type SampledWord = {
  points: Float32Array;
  width: number;
  height: number;
};

export type SampledWords = {
  theodore: SampledWord;
  ouyang: SampledWord;
  maxWidth: number;
  maxHeight: number;
};
