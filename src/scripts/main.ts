const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// import Piece from "./piece.js";

console.log("main.js loaded!");

const b = new Board(ctx);
b.reset();

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

function gameLoop(timestamp: DOMHighResTimeStamp) {
  b.animate();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById(
    "startButton"
  ) as HTMLButtonElement;
  startButton.addEventListener("click", () => {
    requestAnimationFrame(gameLoop);
  });
});
