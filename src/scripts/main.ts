import { keys, level, frameInterval, gameState } from "./globals";
import Board from "./board";
import sfx from "./music";

console.log("main.js loaded!");

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

const startButton = document.getElementById("startButton") as HTMLButtonElement;
// const restartButton = document.getElementById(
//   "restartButton"
// ) as HTMLButtonElement;

let board = new Board(ctx, ctxNextPiece),
  fps = 60,
  lastFrameTimeMs = 0,
  framesThisSecond = 0,
  lastFpsUpdate = 0,
  running = false,
  started = false,
  frameId = 0,
  oldTimeExists = 0,
  oldTimeSimulated = 0;

function initialize() {
  board = new Board(ctx, ctxNextPiece);
  gameState.currentLevel = 1;
  gameState.currentScore = 0;
  gameState.currentLines = 0;
  gameState.timeExists = 0;
  gameState.timeSimulated = (1 / level[gameState.currentLevel]) * frameInterval;
  fps = 60;
  lastFrameTimeMs = 0;
  framesThisSecond = 0;
  lastFpsUpdate = 0;
  running = false;
  started = false;
  frameId = 0;
  oldTimeExists = 0;
  oldTimeSimulated = 0;
}

window.addEventListener("keydown", (e) => {
  // Allow the default behavior for Ctrl + Shift + R (refresh)
  if (e.ctrlKey && e.shiftKey && e.key === "R") {
    return;
  }
  if (e.key === "p" || e.key === "P") {
    if (started && running) {
      stopGame();
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
    sfx.game.play();
    frameId = requestAnimationFrame(function (timestamp) {
      running = true;
      // why need render here?
      render();
      lastFrameTimeMs = timestamp;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
      gameState.timeExists = oldTimeExists;
      // handle start case, where don't know if starting fresh or from pause, better way to handle this?
      gameState.timeSimulated = oldTimeSimulated;
      frameId = requestAnimationFrame(gameLoop);
    });
    // startButton.disabled = true;
    // startButton.blur();
  }
}

function stopGame() {
  isPaused.style.display = "block";
  running = false;
  started = false;
  sfx.game.stop();
  // store old timeExists and timeSimulated calculation ?
  oldTimeExists = gameState.timeExists;
  oldTimeSimulated = gameState.timeSimulated;
  cancelAnimationFrame(frameId);
}

function gameLoop(timestamp: DOMHighResTimeStamp): void {
  if (running) {
    // throttle frame rate
    if (timestamp < lastFrameTimeMs + frameInterval) {
      frameId = requestAnimationFrame(gameLoop);
      return;
    }
    // console.log("new frame timestamp: " + timestamp);

    // calculate moving average of frame rate
    if (timestamp > lastFpsUpdate + 1000) {
      fps = 0.25 * framesThisSecond + (1 - 0.25) * fps;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
    }
    framesThisSecond++;

    // console.log(
    //   "in gameLoop: timeExists: " +
    //     timeExists +
    //     ", timeSimulated: " +
    //     timeSimulated
    // );
    const deltaTime = timestamp - lastFrameTimeMs;
    update(deltaTime);
    render();
    lastFrameTimeMs = timestamp;
    frameId = requestAnimationFrame(gameLoop);
  }
}

function update(deltaTime: number): void {
  // time in ms
  gameState.timeExists += deltaTime;
  board.update();
  while (gameState.timeExists > gameState.timeSimulated) {
    // console.log(
    //   "in update: timeExists: " +
    //     timeExists +
    //     ", timeSimulated: " +
    //     timeSimulated
    // );
    board.drop();
    gameState.timeSimulated +=
      (1 / level[gameState.currentLevel]) * frameInterval;
  }
}

function render(): void {
  board.render();
  fpsDisplay.textContent = Math.round(fps) + " FPS";
}

document.addEventListener("DOMContentLoaded", () => {
  startButton.addEventListener("click", () => {
    if (started && running) {
      stopGame();
    }
    initialize();
    start();
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   restartButton.addEventListener("click", () => {
//     stopGame();
//     // reset all global variables, easier way to do this?
//     initialize();
//     start();
//   });
// });
