import {
  COLUMNS,
  ROWS,
  BLOCK_SIZE,
  COLORS,
  KEY,
  keys,
  shapeColors,
  maxLevel,
  frameInterval,
  level,
  gameState,
  scoreElement,
  linesElement,
  levelElement,
} from "./globals";
import sfx from "./music";
import Piece from "./piece";

const moves = {
  [KEY.DOWN]: (p: Piece) => {
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
    this.resetBoard();
  }

  resetBoard() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  }

  printBoard() {
    console.table(this.grid);
  }

  // Returns array of [y,x] coordinates where piece exists, adjusted for position of piece on grid.
  getSquaresOfPiece(p: Piece): number[][] {
    const s = [];
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        if (p.shape[y][x]) {
          s.push([p.y + y, p.x + x]);
        }
      }
    }
    return s;
  }

  printSquares(squares: number[][]) {
    squares.forEach((s) => console.log("[" + s[0] + "," + s[1] + "]"));
  }

  // main game update loop.
  // updates done in the following order:
  // -gravity update (handled in outer game loop)
  // -user input handling
  // -collision detection
  // -line clearing + scoring
  // -spawn new piece
  update() {
    // check for initialization case, kind of a hack, try to improve this later
    if (this.piece == null) {
      this.spawn();
      return;
    }

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
      // kind of a hack of a loop check to drop piece, make less dependency'ish later
      while (!this.toSpawn) {
        this.drop(2);
      }
      sfx.harddrop.play();
      keys[KEY.SPACE] = false;
    }
    if (keys[KEY.X]) {
      if (this.valid(moves[KEY.X](this.piece))) {
        this.piece.shape = this.piece.rotateClockwise();
        sfx.rotate.play();
        keys[KEY.X] = false;
      }
    }
    if (keys[KEY.Z]) {
      if (this.valid(moves[KEY.Z](this.piece))) {
        this.piece.shape = this.piece.rotateCounterclockwise();
        sfx.rotate.play();
        keys[KEY.Z] = false;
      }
    }

    this.clearFilledRows();
    scoreElement.textContent = gameState.currentScore.toString();
    levelElement.textContent = gameState.currentLevel.toString();
    linesElement.textContent = gameState.currentLines.toString();

    if (this.toSpawn) {
      this.spawn();
      this.toSpawn = false;
    }
  }

  // handles logic for piece movement down the board
  // dropType = 0, standard aka gravity drop
  // dropType = 1, soft drop
  // dropType = 2, hard drop
  drop(dropType = 0): void {
    // why does spawnFlag have to be false? previously had a check 'if(this.piece != null && !spawnFlag)'
    if (this.piece != null && !this.toSpawn) {
      if (this.valid(moves[KEY.DOWN](this.piece))) {
        this.piece.move(this.piece.y + 1, this.piece.x);
        gameState.currentScore += dropType;
      } else {
        this.freeze(this.piece);
        this.toSpawn = true;
      }
    }
  }

  spawn() {
    let newPiece = this.nextPiece;
    // need to set nextPiece before gameover so nextPiece is correctly rendered
    this.nextPiece = new Piece(this.ctxNextPiece);
    newPiece.setStartingPosition();
    let squares = this.getSquaresOfPiece(newPiece);
    // if any of the squares of the newly spawned piece are already taken, then game over
    if (squares.some((s) => this.grid[s[0]][s[1]])) {
      sfx.gameover.play();
      throw new Error("gameover");
    } else {
      newPiece.ctx = this.ctx;
      this.piece = newPiece;
      this.resetTime();
    }
  }

  // reset time exists and time simulated logic for handling falling speed of various levels
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
    } else {
      sfx.clearlines.play();
      gameState.currentLines += linesCleared;
      // level up after clear ten lines
      if (gameState.currentLines % 10 == 0) {
        if (gameState.currentLevel != maxLevel) {
          gameState.currentLevel += 1;
          sfx.levelup.play();
        }
      }

      // points calculated *after* level change
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
  }

  freeze(p: Piece): void {
    sfx.freeze.play();
    this.getSquaresOfPiece(p).forEach(
      (s) => (this.grid[s[0]][s[1]] = p.index + 1)
    );
  }

  // checks if piece is valid for the board
  // sanity checks:
  // a) within confines of game board
  // b) isn't colliding with frozen pieces
  valid(p: Piece): boolean {
    return p.shape.every((row, y) => {
      return row.every((value, x) => {
        let y_ = p.y + y;
        let x_ = p.x + x;
        return (
          value == 0 ||
          (value > 0 && this.withinGrid(y_, x_) && this.noCollisions(y_, x_))
        );
      });
    });
  }

  withinGrid(y: number, x: number): boolean {
    let res = y < ROWS && x > -1 && x < COLUMNS;
    return res;
  }

  noCollisions(y: number, x: number): boolean {
    let res = this.grid[y][x] == 0;
    return res;
  }

  // returns [y,x] coordinates for ghost/projection piece
  ghostLocation(): number[] {
    let copy = Object.assign({}, this.piece);
    while (this.valid(copy)) {
      copy = moves[KEY.DOWN](copy);
    }
    return [copy.y - 1, copy.x];
  }

  clearCanvases() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctxNextPiece.clearRect(
      0,
      0,
      this.ctxNextPiece.canvas.width,
      this.ctxNextPiece.canvas.height
    );
  }

  render() {
    this.clearCanvases();
    if (this.piece != null) {
      // order matters here so that piece overrides ghost
      let ghostCoordinates = this.ghostLocation();
      // if current piece just got frozen, the there is a single frame where ghost piece
      // will end up being above the current piece, so only draw project if ghost piece is below
      if (ghostCoordinates[0] > this.piece.y) {
        this.piece.drawProjection(ghostCoordinates[0], ghostCoordinates[1]);
      }
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
}
