import {
  getTweetsFromContent,
  getTweetsFromUsername,
  returnFormattedTweets,
} from "./apiFunctions.js";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = 8000;

app.use(
  cors({
    origin: "*", //"http://192.168.0.117:3000",
  })
);
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  res.send({ status: "Working!" });
});

app.post("/search-user", async (req, res) => {
  try {
    const param = req.body.searchValue;
    const apiData = returnFormattedTweets(await getTweetsFromUsername(param));
    res.json(apiData);
  } catch {
    console.log("'/search-user' Endpoint Failure!");
    res.json("'/search-user' Endpoint Failure!");
  }
});

app.post("/search-content", async (req, res) => {
  try {
    const param = req.body.searchValue;
    const apiData = returnFormattedTweets(await getTweetsFromContent(param));
    res.json(apiData);
  } catch {
    console.log("'/search-content' Endpoint Failure!");
    res.json("'/search-content' Endpoint Failure!");
  }
});

app.listen(port, () => {
  console.log(`Twit listening at http://localhost:${port}`);
});
