import { BLOCK_SIZE, COLORS, shapes, shapeColors } from "./globals";

export default class Piece {
  // shouldn't these all be private?
  public ctx: CanvasRenderingContext2D;
  public shape: number[][];
  public color: string;
  public width: number;
  public height: number;
  public x: number;
  public y: number;
  public index: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.index = Math.floor(Math.random() * shapes.length);
    this.shape = shapes[this.index];
    this.color = shapeColors[this.index];
    this.width = this.shape[0].length;
    this.height = this.shape.length;
    this.x = 0;
    this.y = 0;
  }

  setStartingPosition(): void {
    // if square piece, spawn from fourth column; otherwise third column
    this.x = this.index == 1 ? 3 : 2;
    this.y = 0;
  }

  move(y: number, x: number) {
    this.y = y;
    this.x = x;
  }

  rotateClockwise(): number[][] {
    let copy = this.shape.map((row) => [...row]);
    return this.reverse(this.transpose(copy));
  }

  rotateCounterclockwise(): number[][] {
    let copy = this.shape.map((row) => [...row]);
    return this.transpose(this.reverse(copy));
  }

  private transpose(matrix: number[][]): number[][] {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < row; col++) {
        let tmp = matrix[row][col];
        matrix[row][col] = matrix[col][row];
        matrix[col][row] = tmp;
      }
    }
    return matrix;
  }

  private reverse(matrix: number[][]): number[][] {
    matrix.map((row) => row.reverse());
    return matrix;
  }

  draw(): void {
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          let startX = (this.x + x) * BLOCK_SIZE;
          let startY = (this.y + y) * BLOCK_SIZE;
          this.ctx.fillStyle = this.color;
          this.ctx.fillRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = COLORS.BLACK;
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }

  drawProjection(pieceY: number, pieceX: number): void {
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          let startX = (pieceX + x) * BLOCK_SIZE;
          let startY = (pieceY + y) * BLOCK_SIZE;
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.fillRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = this.color;
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}
