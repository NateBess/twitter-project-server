import axios from "axios";
import { AUTH } from "./config.js";

const userSearchURL = `https://api.twitter.com/2/users/by?usernames=`;
const tweetsURL = `https://api.twitter.com/2/users/`;
const contentURL = `https://api.twitter.com/2/tweets/search/recent?query=`;

const nextTokenExampleURL = `${contentURL}snow&next_token=b26v89c19zqg8o3fobd8v73egzbdt3qao235oql`;

const returnUrlSearch = (username) => `${userSearchURL}${username}`;
const returnUrlTweets = (userId) => `${tweetsURL}${userId}/tweets`;
const returnUrlContent = (searchWord) =>
  `${contentURL}${searchWord}&max_results=10`;

const returnUserIdFromUsername = async (username) => {
  try {
    const request = await axios.get(returnUrlSearch(username), AUTH);
    return request.data.data[0].id;
  } catch {
    const error = {
      exists: false,
      message: "User Doesn't Exist!",
    };
    return error;
  }
};

const returnTweetDataFromUserId = async (userId) => {
  try {
    const request = await axios.get(returnUrlTweets(userId), AUTH);
    return request.data;
  } catch {
    return "Error 102!";
  }
};

const getUserTweets = async (username) => {
  const userId = await returnUserIdFromUsername(username);
  const tweets = await returnTweetDataFromUserId(userId);
  return tweets;
};

const getContentTweets = async (searchWord) => {
  const request = await axios.get(returnUrlContent(searchWord), AUTH);
  return request.data;
};

export { getUserTweets, getContentTweets };
