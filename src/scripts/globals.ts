const COLUMNS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const KEY = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  UP: "ArrowUp",
  SPACE: "Space",
  X: "KeyX",
  Z: "KeyZ",
  CTRL_LEFT: "ControlLeft",
  CTRL_RIGHT: "ControlRight",
  P: "KeyP",
};

const level: { [id: number]: number } = {
  1: 0.01667,
  2: 0.021017,
  3: 0.026977,
  4: 0.035256,
  5: 0.04693,
  6: 0.06361,
  7: 0.0879,
  8: 0.1236,
  9: 0.1775,
  10: 0.2598,
  11: 0.388,
  12: 0.59,
  13: 0.92,
  14: 1.46,
  15: 2.36,
};

const maxLevel = 15,
  maxFps = 60,
  frameInterval = 1000 / maxFps;

let fps: number,
  currentLevel: number,
  currentScore: number,
  currentLines: number,
  lastFrameTimeMs: number,
  timeExists: number,
  timeSimulated: number,
  framesThisSecond: number,
  lastFpsUpdate: number,
  running: boolean,
  started: boolean,
  frameId: number,
  oldTimeExists: number,
  oldTimeSimulated: number;
