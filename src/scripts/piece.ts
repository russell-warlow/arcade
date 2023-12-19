/*
  what does a piece do/know?
  type
  color
  how to rotate?
  coordinates? -> why does piece need to know its x,y coordinates? can't the board keep track of that?

  what should a board know?
  what squares to color and how
  collision detection
  clearing rows
  how to render/draw?

  what's done in 'main'? 
  game loop?


  */

// /* what does this line even do?! */
// import { BlockList } from "net";

const shapes: number[][][] = [
  [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
];

const colors: string[] = [
  "#FF7F00",
  "#9400D3",
  "#4B0082",
  "#0000FF",
  "#00FF00",
  "#FFFF00",
  "#FF7F00",
  "#FF0000",
];

class Piece {
  public ctx: CanvasRenderingContext2D;
  public shape: number[][];
  public color: string;
  public width: number;
  public height: number;
  public x: number;
  public y: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    const index = Math.floor(Math.random() * shapes.length);
    this.shape = shapes[index];
    this.color = colors[index];
    this.width = this.shape[0].length;
    this.height = this.shape.length;
    // if square piece, spawn from one column over
    this.x = index == 1 ? 3 : 2;
    this.y = 0;
  }

  draw(): void {
    console.table(this.shape);
    console.log(this.color);
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[0].length; x++) {
        if (this.shape[y][x]) {
          // TODO: how make sure border isn't larger for shared edges?
          console.log(y + " " + x);
          let startX = (this.x + x) * BLOCK_SIZE;
          let startY = (this.y + y) * BLOCK_SIZE;
          this.ctx.fillStyle = this.color;
          this.ctx.fillRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }
}
