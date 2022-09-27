import express from "express";
import cors from "cors";
const app = express(cors());
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Twit listening at http://localhost:${port}`);
});
