import express, { Application, Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import path from "path";

const app = express();

app.set("views", path.join(__dirname, "..", "..", "views"));
// app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "..", "..")));

app.get("/", (req, res, next) => {
  res.render("index");
});

export const handler = serverless(app);
