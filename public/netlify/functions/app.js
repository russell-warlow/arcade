// import express, { Application, Request, Response, NextFunction } from "express";
// import serverless from "serverless-http";
// import path from "path";

// const app = express();

// // app.set("views", path.join(__dirname, "..", "..", "views"));
// // app.set("view engine", "ejs");

// app.use(express.static(path.join(__dirname, "..", "..")));

// app.get("/", (req, res, next) => {
//   res.render("views/index");
// });

// export const handler = serverless(app);

import { createServer, IncomingMessage, ServerResponse } from "http";
import { path } from "path";
import { readFileSync } from "fs";
import serverless from "serverless-http";

const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <link href="/css/style.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
      <div class="table">
        <canvas id="board" class="board"></canvas>
        <div id="pauseOverlay" class="overlay">
          <p>PAUSE</p>
        </div>
        <div id="gameOverOverlay" class="overlay">
          <p>GAME OVER</p>
        </div>
        <div class="game-info">
          <div class="game-state">
            <div>
              <p><b>Tetris</b></p>
              <p>Score: <span id="score">0</span></p>
              <p>Lines: <span id="lines">0</span></p>
              <p>Level: <span id="level">0</span></p>
              <p>Frame Rate: <span id="fpsDisplay">0</span></p>
              <p>Next piece:</p>
              <canvas id="nextPiece"></canvas>
            </div>
          </div>
          <div>
            <button id="startButton">Start/Restart</button>
          </div>
        </div>
        <div>
          <p><b>Keyboard instructions</b></p>
          <p>Left arrow: move left</p>
          <p>Right arrow: move right</p>
          <p>x: rotate clockwise</p>
          <p>z: rotate counter-clockwise</p>
          <p>Down arrow: soft drop</p>
          <p>Space: hard drop</p>
          <p>p: pause/unpause game</p>
        </div>
      </div>
      <script src="/scripts/bundle.js"></script>
    </body>
  </html>
  `;

const server = createServer((req, res) => {
  // Serve the index.html file
  if (req.url === "/" || req.url === "/index.html") {
    // Read the contents of the index.html file
    const indexPath = path.resolve("./public/index.html");
    const indexContent = readFileSync(indexPath, "utf-8");

    // Set the Content-Type header
    res.setHeader("Content-Type", "text/html");

    // Send the HTML content
    res.end(htmlContent);
  } else {
    // Handle other requests (e.g., assets, API endpoints)
    // Return a 404 Not Found response for simplicity
    res.statusCode = 404;
    res.end("Not Found");
  }
});

export const handler = serverless(server);
