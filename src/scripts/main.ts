const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const fpsDisplay = document.getElementById("fpsDisplay") as HTMLDivElement;
// import Piece from "./piece.js";

console.log("main.js loaded!");

const b = new Board(ctx);
// b.reset();

function play() {
  b.reset();
  // b.colorRandomBoxes();
  b.print();
  // b.draw();
  // b.testDraw();
  const p = new Piece(ctx);
  p.draw();
}

function start() {
  b.reset();
  b.print();
  b.animate();
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
  // /* include check to expedite debugging */
  // if (e.code != KEY.CTRL_LEFT) {
  //   e.preventDefault();
  // }

  // Allow the default behavior for Ctrl + Shift + R (refresh)
  if (e.ctrlKey && e.shiftKey && e.key === "R") {
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

function handleKeyboardInput(): void {}

function gameLoop(timestamp: DOMHighResTimeStamp): void {
  // throttle frame rate
  if (timestamp < lastFrameTimeMs + frameInterval) {
    requestAnimationFrame(gameLoop);
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

  const deltaTime = timestamp - lastFrameTimeMs;
  update(deltaTime);
  render();
  lastFrameTimeMs = timestamp;
  requestAnimationFrame(gameLoop);

  /* old implementation */
  // if (timestamp < lastFrameTimeMs + 1000 / maxFPS) {
  //   requestAnimationFrame(gameLoop);
  //   return;
  // }
  // lastFrameTimeMs = timestamp;
  // b.animate();
  // requestAnimationFrame(gameLoop);
}

function update(deltaTime: number): void {
  // time in ms
  timeExists += deltaTime;
  b.animate();
  while (timeExists >= timeSimulated) {
    console.log(
      "timeExists: " + timeExists + ", timeSimulated: " + timeSimulated
    );
    b.drop();
    timeSimulated += (1 / level[currentLevel]) * frameInterval;
  }
}

function render(): void {
  b.render();
  fpsDisplay.textContent = Math.round(fps) + " FPS";
}

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById(
    "startButton"
  ) as HTMLButtonElement;
  startButton.addEventListener("click", () => {
    requestAnimationFrame(gameLoop);
  });
});
