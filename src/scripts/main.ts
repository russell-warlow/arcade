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

const pauseOverlay = document.getElementById("pauseOverlay") as HTMLDivElement;
const gameOverOverlay = document.getElementById(
  "gameOverOverlay"
) as HTMLDivElement;

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
  pauseOverlay.style.display = "none";
  gameOverOverlay.style.display = "none";
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
}

function keyDownHandler(e: KeyboardEvent) {
  // Allow the default behavior for Ctrl + Shift + R (refresh)
  if (e.ctrlKey && e.shiftKey && e.key === "R") {
    return;
  }
  if (e.key === "p" || e.key === "P") {
    if (started && running) {
      pauseGame();
    } else if (!started && !running) {
      start();
    }
    return;
  }

  e.preventDefault();
  if (!keys[e.code]) {
    keys[e.code] = true;
  }
}

function keyUpHandler(e: KeyboardEvent) {
  keys[e.code] = false;
}

function start() {
  if (!started) {
    pauseOverlay.style.display = "none";
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

function pauseGame() {
  pauseOverlay.style.display = "block";
  running = false;
  started = false;
  sfx.game.pause();
  // store old timeExists and timeSimulated calculation ?
  oldTimeExists = gameState.timeExists;
  oldTimeSimulated = gameState.timeSimulated;
  cancelAnimationFrame(frameId);
}

function stopGame() {
  window.removeEventListener("keydown", keyDownHandler);
  window.removeEventListener("keyup", keyUpHandler);
  running = false;
  started = false;
  sfx.game.stop();
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

    // kind of a hack
    try {
      update(deltaTime);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "gameover") {
          gameOverOverlay.style.display = "block";
          stopGame();
        }
      } else {
        throw err;
      }
    }
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
    stopGame();
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
