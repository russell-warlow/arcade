const COLUMNS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

console.log("board.js loaded!");

class Board {
  private ctx: CanvasRenderingContext2D;
  private grid: number[][] = [];
  private piece: Piece | null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.canvas.width = COLUMNS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.piece = null;
    // this.piece = new Piece(ctx);
    // this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    // this.reset(); // hoisting?
  }

  reset() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  }

  print() {
    console.table(this.grid);
  }

  // delete where piece was, update to where it is
  move(p: Piece, y: number, x: number) {
    let oldSquares = this.getSquaresOfPiece(p);
    // if every square is filled
    if (oldSquares.some((c) => this.grid[c[0]][c[1]] == 0)) {
      throw new Error("error in move(), moving unoccupied square");
    }
    // better to copy the object?
    p.x = x;
    p.y = y;
    let newSquares = this.getSquaresOfPiece(p);
    for (let i = 0; i < newSquares.length; i++) {
      let s = newSquares[i];
      if (this.grid[s[0]][s[1]]) {
        if (!oldSquares.find((d) => d[0] == s[0] && d[1] == s[1])) {
          throw new Error("error in move(), moving piece to occupied square");
        }
      }
    }
    // if (newSquares.some((c) => this.grid[c[0]][c[1]]) && oldSquares.find(d => d[0] == c[0] && d[1] == c[1])) {
    //   throw new Error("error in move(), moving piece to occupied square");
    // }

    oldSquares.forEach((s) => (this.grid[s[0]][s[1]] = 0));
    newSquares.forEach((s) => (this.grid[s[0]][s[1]] = 1));
  }

  getSquaresOfPiece(p: Piece): number[][] {
    const s = [];
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        if (p.shape[y][x]) {
          s.push([p.y + y, p.x + x]);
        }
      }
    }
    console.log("piece: ");
    console.table(p.shape);
    this.print();
    console.log("squares in piece: ");
    this.printSquares(s);
    return s;
  }

  printSquares(squares: number[][]) {
    squares.forEach((s) => console.log("[" + s[0] + "," + s[1] + "]"));
  }
  /*
  questions:
  when update board state?
  what does draw do? 
  what does the game loop entail?

  other questions:
  why do we need a piece.js class?
  what should we put in piece.js vs board.js?

  if current piece has valid move down (collision detection), move current piece down, update grid
  else spawn new piece, update grid
  render grid

  how handle keyboard inputs?

  draw the next frame?
  if piece has another valid move (hasn't hit the floor or another piece), then move it down one space
  else, create new piece
  re-render


  */
  animate() {
    if (this.piece == null) {
      this.spawn();
      this.render();
      return;
    }
    if (this.hasValidDownMove(this.piece)) {
      this.move(this.piece, this.piece.y + 1, this.piece.x);
    } else {
      this.spawn();
    }
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.render();
  }

  render() {
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[0].length; x++) {
        if (this.grid[y][x]) {
          this.ctx.fillStyle = "blue";
          let startX = x * BLOCK_SIZE;
          let startY = y * BLOCK_SIZE;
          this.ctx.fillRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }

  // if cannot spawn, then game over
  spawn() {
    let newPiece = new Piece(ctx);
    let squares = this.getSquaresOfPiece(newPiece);
    if (squares.some((s) => this.grid[s[0]][s[1]])) {
      throw new Error("gg");
    } else {
      // add piece to grid
      squares.forEach((s) => (this.grid[s[0]][s[1]] = 1));
      this.piece = newPiece;
    }
  }

  // check if all non-zero elements of matrix are zero in their future positions on the board
  hasValidDownMove(p: Piece): boolean {
    // get all squares that piece occupies
    const squares = [];
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        if (p.shape[y][x]) {
          squares.push([p.y + y, p.x + x]);
        }
      }
    }

    for (let i = 0; i < squares.length; i++) {
      let s = squares[i];
      console.log("s: " + s);
      console.log("s[0]: " + s[0]);
      console.log("s[1]: " + s[1]);
      if (s[0] + 1 >= ROWS) {
        console.log("reach floor: " + s);
        return false;
      } else if (this.grid[s[0] + 1][s[1]]) {
        // if new squares isn't part of old piece
        if (!squares.find((c) => c[0] == s[0] + 1 && c[1] == s[1])) {
          console.log("hit another piece " + s);
          return false;
        }
      }
    }
    return true;
  }
  // if (squares.every(c => this.grid[c[0]][c[1]])) {
  //   return true;
  // }
  // return false;

  // colorRandomBoxes() {
  //   for (var i = 0; i < 10; i++) {
  //     const x = Math.floor(Math.random() * 10);
  //     const y = Math.floor(Math.random() * 10);
  //     this.grid[x][y] = 1;
  //   }
  // }

  // testDraw() {
  //   this.ctx.fillStyle = "#f00";
  //   this.ctx.fillRect(2, 2, 2, 2);
  // }

  // // go through all elements and color them with canvas magic
  // draw2() {
  //   for (let i = 0; i < this.grid.length; i++) {
  //     for (let j = 0; j < this.grid[0].length; j++) {
  //       if (this.grid[i][j]) {
  //         console.log(i + " " + j);
  //         this.ctx.fillStyle = "#FF0000";
  //         this.ctx.fillRect(i, j, 1, 1);
  //       }
  //     }
  //   }
  // }
}
