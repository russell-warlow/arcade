import express, { Application, Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import path from "path";

const app: Application = express();

app.set("views", path.join(__dirname, "..", "..", "public", "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "..", "..", "public")));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.render("index");
});

export const handler = serverless(app);
