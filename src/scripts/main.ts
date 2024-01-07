const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const fpsDisplay = document.getElementById("fpsDisplay") as HTMLDivElement;

const canvasNextPiece = document.getElementById(
  "nextPiece"
) as HTMLCanvasElement;
const ctxNextPiece = canvasNextPiece.getContext(
  "2d"
) as CanvasRenderingContext2D;

const isPaused = document.getElementById("isPaused") as HTMLParagraphElement;

const scoreElement = document.getElementById("score") as HTMLSpanElement;
const levelElement = document.getElementById("level") as HTMLSpanElement;
const linesElement = document.getElementById("lines") as HTMLSpanElement;

const startButton = document.getElementById("startButton") as HTMLButtonElement;
const restartButton = document.getElementById(
  "restartButton"
) as HTMLButtonElement;

console.log("main.js loaded!");

let board = new Board(ctx, ctxNextPiece);

function initialize() {
  board = new Board(ctx, ctxNextPiece);
  fps = 60;
  currentLevel = 1;
  currentScore = 0;
  currentLines = 0;
  lastFrameTimeMs = 0;
  timeExists = 0;
  timeSimulated = (1 / level[currentLevel]) * frameInterval;
  framesThisSecond = 0;
  lastFpsUpdate = 0;
  running = false;
  started = false;
  frameId = 0;
  oldTimeExists = 0;
  oldTimeSimulated = 0;
}

const moves = {
  [KEY.DOWN]: (p: Piece) => {
    // ({ ...p} as typeof Piece, y: p.y + 1),
    let copy = Object.assign({}, p);
    copy.y = p.y + 1;
    return copy;
  },
  [KEY.LEFT]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.x = p.x - 1;
    return copy;
  },
  [KEY.RIGHT]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.x = p.x + 1;
    return copy;
  },
  [KEY.UP]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.shape = p.rotateClockwise();
    return copy;
  },
  [KEY.X]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.shape = p.rotateClockwise();
    return copy;
  },
  [KEY.Z]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.shape = p.rotateCounterclockwise();
    return copy;
  },
  [KEY.CTRL_LEFT]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.shape = p.rotateCounterclockwise();
    return copy;
  },
  [KEY.CTRL_RIGHT]: (p: Piece) => {
    let copy = Object.assign({}, p);
    copy.shape = p.rotateCounterclockwise();
    return copy;
  },
};

const keys: { [id: KeyboardEvent["code"]]: boolean } = {};

window.addEventListener("keydown", (e) => {
  // Allow the default behavior for Ctrl + Shift + R (refresh)
  if (e.ctrlKey && e.shiftKey && e.key === "R") {
    return;
  }
  if (e.key === "p" || e.key === "P") {
    if (started && running) {
      stop();
    } else if (!started && !running) {
      start();
    }
    return;
  }

  e.preventDefault();
  if (!keys[e.code]) {
    keys[e.code] = true;
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function start() {
  if (!started) {
    isPaused.style.display = "none";
    started = true;
    frameId = requestAnimationFrame(function (timestamp) {
      running = true;
      // why need render here?
      render();
      lastFrameTimeMs = timestamp;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
      timeExists = oldTimeExists;
      // handle start case, where don't know if starting fresh or from pause, better way to handle this?
      timeSimulated = oldTimeSimulated;
      frameId = requestAnimationFrame(gameLoop);
    });
    startButton.disabled = true;
    startButton.blur();
  }
}

function stop() {
  isPaused.style.display = "block";
  running = false;
  started = false;
  // store old timeExists and timeSimulated calculation ?
  oldTimeExists = timeExists;
  oldTimeSimulated = timeSimulated;
  cancelAnimationFrame(frameId);
}

function gameLoop(timestamp: DOMHighResTimeStamp): void {
  if (running) {
    // throttle frame rate
    if (timestamp < lastFrameTimeMs + frameInterval) {
      frameId = requestAnimationFrame(gameLoop);
      return;
    }
    console.log("new frame timestamp: " + timestamp);
    // calculate moving average of frame rate
    if (timestamp > lastFpsUpdate + 1000) {
      fps = 0.25 * framesThisSecond + (1 - 0.25) * fps;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
    }
    framesThisSecond++;

    console.log(
      "in gameLoop: timeExists: " +
        timeExists +
        ", timeSimulated: " +
        timeSimulated
    );
    const deltaTime = timestamp - lastFrameTimeMs;
    update(deltaTime);
    render();
    lastFrameTimeMs = timestamp;
    frameId = requestAnimationFrame(gameLoop);
  }
}

function update(deltaTime: number): void {
  // time in ms
  timeExists += deltaTime;
  board.update();
  while (timeExists > timeSimulated) {
    console.log(
      "in update: timeExists: " +
        timeExists +
        ", timeSimulated: " +
        timeSimulated
    );
    board.drop();
    timeSimulated += (1 / level[currentLevel]) * frameInterval;
  }
}

function render(): void {
  board.render();
  fpsDisplay.textContent = Math.round(fps) + " FPS";
}

document.addEventListener("DOMContentLoaded", () => {
  startButton.addEventListener("click", () => {
    initialize();
    start();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  restartButton.addEventListener("click", () => {
    stop();
    // reset all global variables, easier way to do this?
    initialize();
    start();
  });
});
