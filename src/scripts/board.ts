// import { json } from "stream/consumers";

import {
  COLUMNS,
  ROWS,
  BLOCK_SIZE,
  COLORS,
  KEY,
  keys,
  shapeName,
  shapeColors,
  maxLevel,
  frameInterval,
  level,
  gameState,
  scoreElement,
  linesElement,
  levelElement,
} from "./globals";
import Piece from "./piece";

console.log("board.js loaded!");

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
};

export default class Board {
  private ctx: CanvasRenderingContext2D;
  private ctxNextPiece: CanvasRenderingContext2D;
  private grid: number[][] = [];
  private piece: Piece | null;
  private nextPiece: Piece;
  private toSpawn: boolean;

  constructor(
    ctx: CanvasRenderingContext2D,
    ctxNextPiece: CanvasRenderingContext2D
  ) {
    this.ctx = ctx;
    this.ctx.canvas.width = COLUMNS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.ctxNextPiece = ctxNextPiece;
    this.ctxNextPiece.canvas.width = 4 * BLOCK_SIZE;
    this.ctxNextPiece.canvas.height = 4 * BLOCK_SIZE;
    this.piece = null;
    this.nextPiece = new Piece(ctxNextPiece);
    this.toSpawn = true;
    this.reset();
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
        // have to make sure square isn't a part of where piece was previously
        if (!oldSquares.find((d) => d[0] == s[0] && d[1] == s[1])) {
          throw new Error("error in move(), moving piece to occupied square");
        }
      }
    }

    oldSquares.forEach((s) => (this.grid[s[0]][s[1]] = 0));
    newSquares.forEach((s) => (this.grid[s[0]][s[1]] = 1));
  }

  // returns array of [y,x] coordinates where piece exists, adjusted for position of piece on grid
  getSquaresOfPiece(p: Piece): number[][] {
    const s = [];
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        if (p.shape[y][x]) {
          s.push([p.y + y, p.x + x]);
        }
      }
    }
    // console.log("piece: ");
    // console.table(p.shape);
    // this.print();
    // console.log("squares in piece: ");
    // this.printSquares(s);
    return s;
  }

  printSquares(squares: number[][]) {
    squares.forEach((s) => console.log("[" + s[0] + "," + s[1] + "]"));
  }

  /*
  Gravity Update:
      The game updates at regular intervals.
      During each update, the current tetromino is moved down by one row (or cell) based on the gravity settings.
  User Input Handling:
      After the gravity update, the game checks for user input.
      Player inputs, such as left, right, rotate, or soft drop, are processed.
  Collision Detection:
      After handling user input, the game checks for collisions.
      If the tetromino encounters a block or reaches the bottom, it stops falling.
  Line Clearing:
      The game checks for completed lines after a tetromino has stopped falling.
      If a line is completed, it is cleared, and the player scores points.
  Spawn New Tetromino:
      A new tetromino is spawned, and the process repeats.
  */
  update() {
    // kind of a hack, is there a cleaner way to do the start?
    if (this.piece == null) {
      this.spawn();
      return;
    }
    // handle key inputs
    if (keys[KEY.LEFT]) {
      if (this.valid(moves[KEY.LEFT](this.piece))) {
        this.piece.move(this.piece.y, this.piece.x - 1);
        keys[KEY.LEFT] = false;
      }
    }
    if (keys[KEY.RIGHT]) {
      if (this.valid(moves[KEY.RIGHT](this.piece))) {
        this.piece.move(this.piece.y, this.piece.x + 1);
        keys[KEY.RIGHT] = false;
      }
    }
    if (keys[KEY.DOWN]) {
      this.drop(1);
    }
    if (keys[KEY.SPACE]) {
      // kind of a hack of a loop check, make less dependency-ish
      while (!this.toSpawn) {
        this.drop(2);
      }
      keys[KEY.SPACE] = false;
    }
    if (keys[KEY.X]) {
      if (this.valid(moves[KEY.X](this.piece))) {
        this.piece.shape = this.piece.rotateClockwise();
        keys[KEY.X] = false;
      }
    }
    if (keys[KEY.Z]) {
      if (this.valid(moves[KEY.Z](this.piece))) {
        this.piece.shape = this.piece.rotateCounterclockwise();
        keys[KEY.Z] = false;
      }
    }

    // design question: should row cancellation take place in between freezing and spawning?
    this.clearFilledRows();

    // update game state
    scoreElement.textContent = gameState.currentScore.toString();
    levelElement.textContent = gameState.currentLevel.toString();
    linesElement.textContent = gameState.currentLines.toString();

    if (this.toSpawn) {
      this.spawn();
      this.toSpawn = false;
    }
  }

  // should 'drop' return a boolean per success/failure?
  // 0: standard, 1: soft drop, 2: hard drop
  drop(dropType = 0): void {
    // why does spawnFlag have to be false? previously had a check 'if(this.piece != null && !spawnFlag)'
    if (this.piece != null) {
      console.log("dropping " + shapeName[this.piece.index]);
      if (this.valid(moves[KEY.DOWN](this.piece))) {
        this.piece.move(this.piece.y + 1, this.piece.x);
        gameState.currentScore += dropType;
      } else {
        this.freeze(this.piece);
        this.toSpawn = true;
      }
    }
  }

  // if cannot spawn, then game over
  /*
  what need to do when start board ... 
  create a next piece

  when start animating ...
  make this piece equal to last next piece
  create new next piece
  re-draw next piece canvas
  */
  spawn() {
    let newPiece = this.nextPiece;
    newPiece.setStartingPosition();
    let squares = this.getSquaresOfPiece(newPiece);
    if (squares.some((s) => this.grid[s[0]][s[1]])) {
      // handle game over somehow
      throw new Error("gg");
    } else {
      // add piece to grid
      newPiece.ctx = this.ctx;
      this.piece = newPiece;
      this.resetTime();
      this.nextPiece = new Piece(this.ctxNextPiece);
      console.log("spawning new piece: " + shapeName[this.piece.index]);
    }
  }

  resetTime(): void {
    gameState.timeExists = 0;
    // important for initialization; otherwise, first piece falls too quickly (breaks math with initial values of zero and zero)
    gameState.timeSimulated =
      (1 / level[gameState.currentLevel]) * frameInterval;
  }

  clearFilledRows(): void {
    let linesCleared = 0;
    this.grid.forEach((row, y) => {
      if (row.every((element) => element > 0)) {
        linesCleared += 1;
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(COLUMNS).fill(0));
      }
    });
    if (!linesCleared) {
      return;
    }
    gameState.currentLines += linesCleared;
    // ***change back to mod 10 later***
    if (gameState.currentLines % 2 == 0) {
      if (gameState.currentLevel != maxLevel) {
        gameState.currentLevel += 1;
      }
    }

    // points calculated after level change
    let points = 0;
    switch (linesCleared) {
      case 1:
        points = 100;
        break;
      case 2:
        points = 300;
        break;
      case 3:
        points = 500;
        break;
      case 4:
        points = 800;
        break;
      default:
        console.log("cleared too many lines: " + linesCleared);
        break;
    }

    gameState.currentScore += points * gameState.currentLevel;
  }

  freeze(p: Piece): void {
    console.log("freezing piece: " + shapeName[p.index]);
    this.getSquaresOfPiece(p).forEach(
      (s) => (this.grid[s[0]][s[1]] = p.index + 1)
    );
  }

  /* 
  sanity checks:
  within confines of game board
  isn't colliding with frozen pieces
  */
  valid(p: Piece): boolean {
    return p.shape.every((row, y) => {
      return row.every((value, x) => {
        let y_ = p.y + y;
        let x_ = p.x + x;
        return (
          value == 0 ||
          (value > 0 && this.withinGrid(y_, x_) && this.noCollisions(y_, x_))
        );
        // if (value) {
        //   console.log(
        //     "result: " + this.withinGrid(y_, x_) && this.noCollisions(y_, x_)
        //   );
        //   this.withinGrid(y_, x_) && this.noCollisions(y_, x_);
        // } else {
        //   console.log("result: " + true);
        //   true;
        // }
      });
    });
  }

  valid2(p: Piece): boolean {
    let res = true;
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        let y_ = p.y + y;
        let x_ = p.x + x;

        let mini =
          value == 0 ||
          (value > 0 && this.withinGrid(y_, x_) && this.noCollisions(y_, x_));
        console.log("[y: " + y_ + ",x: " + x_ + "], result: " + mini);
        res = res && mini;
      });
    });
    return res;
  }

  withinGrid(y: number, x: number): boolean {
    let res = y < ROWS && x > -1 && x < COLUMNS;
    // console.log("withinGrid res: " + res);
    return res;
  }

  noCollisions(y: number, x: number): boolean {
    let res = this.grid[y][x] == 0;
    // console.log("noCollisions res: " + res);
    return res;
  }

  /*
  check if next move down is valid
  if so, then drop
  recurse

  what a hack, need to improve this
  */
  ghostLocation(): number[] {
    let copy = Object.assign({}, this.piece);
    while (this.valid(copy)) {
      copy = moves[KEY.DOWN](copy);
    }
    return [copy.y - 1, copy.x];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctxNextPiece.clearRect(
      0,
      0,
      this.ctxNextPiece.canvas.width,
      this.ctxNextPiece.canvas.height
    );
  }

  render() {
    this.clear();
    if (this.piece != null) {
      // order matters here so that piece overrides ghost
      let coordinates = this.ghostLocation();
      // if current piece just got frozen, the there is a single frame where ghost piece will end up being above the current piece
      if (coordinates[0] > this.piece.y) {
        this.piece.drawProjection(coordinates[0], coordinates[1]);
      }
      console.log("rendering ... ");
      console.log(
        "this piece: " +
          shapeName[this.piece.index] +
          ", y: " +
          this.piece.y +
          ", x: " +
          this.piece.x
      );
      console.log(
        "ghost piece: y: " + coordinates[0] + ", x: " + coordinates[1]
      );
      this.piece.draw();
      this.nextPiece.draw();
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            this.ctx.fillStyle = shapeColors[value - 1];
            let startX = x * BLOCK_SIZE;
            let startY = y * BLOCK_SIZE;
            this.ctx.fillRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
            this.ctx.strokeStyle = COLORS.BLACK;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(startX, startY, BLOCK_SIZE, BLOCK_SIZE);
          }
        });
      });
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
}
