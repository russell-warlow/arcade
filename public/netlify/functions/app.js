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
import { join } from "path";
import { readFileSync } from "fs";
import serverless from "serverless-http";

const server = createServer((req, res) => {
  // Serve the index.html file
  if (req.url === "/" || req.url === "/index.html") {
    // Read the contents of the index.html file
    const indexPath = path.resolve("./public/index.html");
    const indexContent = readFileSync(indexPath, "utf-8");

    // Set the Content-Type header
    res.setHeader("Content-Type", "text/html");

    // Send the HTML content
    res.end(indexContent);
  } else {
    // Handle other requests (e.g., assets, API endpoints)
    // Return a 404 Not Found response for simplicity
    res.statusCode = 404;
    res.end("Not Found");
  }
});

export const handler = serverless(server);
