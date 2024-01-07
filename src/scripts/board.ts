// import { json } from "stream/consumers";

let spawnFlag = false;

console.log("board.js loaded!");

class Board {
  private ctx: CanvasRenderingContext2D;
  private ctxNextPiece: CanvasRenderingContext2D;
  private grid: number[][] = [];
  private piece: Piece | null;
  private nextPiece: Piece;

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
    // this.piece = null;
    // kind of a hack ... initializing Board with dummy piece
    this.piece = null;
    this.nextPiece = new Piece(ctxNextPiece);
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
      while (!spawnFlag) {
        this.drop(2);
      }
      keys[KEY.SPACE] = false;
    }
    if (keys[KEY.X] || keys[KEY.UP]) {
      if (this.valid(moves[KEY.X](this.piece))) {
        this.piece.shape = this.piece.rotateClockwise();
        keys[KEY.X] = false;
        keys[KEY.UP] = false;
      }
    }
    if (keys[KEY.Z] || keys[KEY.CTRL_LEFT] || keys[KEY.CTRL_RIGHT]) {
      if (this.valid(moves[KEY.Z](this.piece))) {
        this.piece.shape = this.piece.rotateCounterclockwise();
        keys[KEY.Z] = false;
        keys[KEY.CTRL_LEFT] = false;
        keys[KEY.CTRL_RIGHT] = false;
      }
    }

    // design question: should row cancellation take place in between freezing and spawning?
    this.clearFilledRows();

    // update game state
    scoreElement.textContent = currentScore.toString();
    levelElement.textContent = currentLevel.toString();
    linesElement.textContent = currentLines.toString();

    if (spawnFlag) {
      this.spawn();
      spawnFlag = false;
    }
  }

  // 0: standard, 1: soft drop, 2: hard drop
  drop(dropType = 0): void {
    console.log("dropping ...");
    // why does spawnFlag have to be false? previously had a check 'if(this.piece != null && !spawnFlag)'
    if (this.piece != null) {
      if (this.valid(moves[KEY.DOWN](this.piece))) {
        this.piece.move(this.piece.y + 1, this.piece.x);
        currentScore += dropType;
      } else {
        this.freeze(this.piece);
        spawnFlag = true;
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
      newPiece.ctx = ctx;
      this.piece = newPiece;
      this.resetTime();
      this.nextPiece = new Piece(this.ctxNextPiece);
      console.log("spawning new piece ...");
    }
  }

  resetTime(): void {
    timeExists = 0;
    timeSimulated = (1 / level[currentLevel]) * frameInterval;
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
    currentLines += linesCleared;
    // ***change back to mod 10 later***
    if (currentLines % 2 == 0) {
      if (currentLevel != maxLevel) {
        currentLevel += 1;
      }
    }
    let points = 0;
    switch (linesCleared) {
      case 1:
        points = 100 * currentLevel;
        break;
      case 2:
        points = 300 * currentLevel;
        break;
      case 3:
        points = 500 * currentLevel;
        break;
      case 4:
        points = 800 * currentLevel;
        break;
      default:
        console.log("cleared too many lines: " + linesCleared);
        break;
    }
    currentScore += points;
  }

  freeze(p: Piece): void {
    console.log("freezing piece: " + p.index);
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
  hardDrop(currentPiece: Piece): Piece {
    let copy = Object.assign({}, currentPiece);
    while (this.valid(copy)) {
      copy = moves[KEY.DOWN](copy);
    }
    let shadow = new Piece(ctx);
    shadow.y = copy.y - 1;
    shadow.x = copy.x;
    shadow.shape = copy.shape;
    shadow.index = copy.index;
    shadow.width = copy.width;
    shadow.height = copy.width;
    shadow.color = copy.color;
    return shadow;
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
      // this.hardDrop(this.piece).drawProjection();
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
