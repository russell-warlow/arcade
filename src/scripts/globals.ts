export const COLUMNS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;

export const KEY = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  SPACE: "Space",
  X: "KeyX",
  Z: "KeyZ",
  P: "KeyP",
};

export const keys: { [id: KeyboardEvent["code"]]: boolean } = {};

export const shapes: number[][][] = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
  [
    [0, 0, 6],
    [6, 6, 6],
    [0, 0, 0],
  ],
  [
    [7, 0, 0],
    [7, 7, 7],
    [0, 0, 0],
  ],
];

export const COLORS = {
  CYAN: "#00FFFF",
  YELLOW: "#FFFF00",
  PURPLE: "#5D3FD3",
  GREEN: "#0BDA51",
  RED: "#FF0000",
  BLUE: "#0437F2",
  ORANGE: "#FF5F1F",
  BLACK: "#000000",
};

export const shapeColors: string[] = [
  COLORS.CYAN,
  COLORS.YELLOW,
  COLORS.PURPLE,
  COLORS.GREEN,
  COLORS.RED,
  COLORS.BLUE,
  COLORS.ORANGE,
];

export const level: { [id: number]: number } = {
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

export const maxLevel = 15;
export const maxFps = 60;
export const frameInterval = 1000 / maxFps;

export const gameState = {
  currentLevel: 1,
  currentScore: 0,
  currentLines: 0,
  lastFrameTimeMs: 0,
  timeExists: 0,
  // need to use (1 / level[currentLevel]) here but it's in the same declaration, not sure what the fix is b/c need singleton for updates?
  // also don't like duplication of code here and in initialize() in main.ts, need to clean up
  timeSimulated: (1 / 0.01667) * frameInterval,
};

export const scoreElement = document.getElementById("score") as HTMLSpanElement;
export const levelElement = document.getElementById("level") as HTMLSpanElement;
export const linesElement = document.getElementById("lines") as HTMLSpanElement;

export const foo = 1;
