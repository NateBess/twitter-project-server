import { getContentTweets, getUserTweets } from "./apiFunctions.js";
import express from "express";

const app = express();
const port = 8000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", async (req, res) => {
  const userSearchTweets = await getUserTweets("VancityReynolds");
  res.json(userSearchTweets);
});

app.listen(port, () => {
  console.log(`Twit listening at http://localhost:${port}`);
});
