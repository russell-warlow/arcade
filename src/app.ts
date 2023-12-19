import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";

const app: Application = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//app.use(express.static(__dirname + "../public"));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.render("index");
});

app.listen(3000, () => console.log("Server started on port 3000 ..."));
