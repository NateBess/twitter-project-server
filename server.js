import { getContentTweets, getUserTweets } from "./apiFunctions.js";
import express from "express";
import cors from "cors";
const app = express(cors());
const port = 8000;

app.get("/", async (req, res) => {
  const userTweets = await getUserTweets("theprimeagen");
  res.send(userTweets.data);
});

app.listen(port, () => {
  console.log(`Twit listening at http://localhost:${port}`);
});
