import { getContentTweets, getUserTweets } from "./apiFunctions.js";
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
  try {
    const userSearchTweets = await getUserTweets(req.body.searchValue);
    res.json(userSearchTweets);
  } catch {
    console.log("Error, user probably doesn't exist!");
    res.json("NONE");
  }
});

app.listen(port, () => {
  console.log(`Twit listening at http://localhost:${port}`);
});
