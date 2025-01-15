export enum Steps {
  Analyzing = 0,
  Transforming = 1,
  Translating = 2,
  Finish = 3,
}

export enum StepState {
  None = 0,
  Detected = 1,
  AnimatedCursor = 2,
  Animated = 3,
  Finished = 4,
}
