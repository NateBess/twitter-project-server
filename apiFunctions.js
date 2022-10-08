import axios from "axios";
import { getDate } from "date-fns";
import { AUTH } from "./config.js";

const userSearchURL = `https://api.twitter.com/2/users/by/username/`;
const tweetsURL = `https://api.twitter.com/2/users/`;
const contentURL = `https://api.twitter.com/2/tweets/search/recent?query=`;

const nextTokenExampleURL = `${contentURL}snow&next_token=b26v89c19zqg8o3fobd8v73egzbdt3qao235oql`;

const returnUrlSearch = (username) =>
  `${userSearchURL}${username}?user.fields=id,profile_image_url,url,username`;
const returnUrlTweets = (userId) =>
  `${tweetsURL}${userId}/tweets?tweet.fields=attachments%2Ccreated_at%2Cpublic_metrics&max_results=10&media.fields=media_key%2Cpublic_metrics%2Cpreview_image_url%2Curl%2Cvariants&expansions=attachments.media_keys&user.fields=profile_image_url%2Cname`;
const returnUrlContent = (searchWord) =>
  `${contentURL}${searchWord}&max_results=10`;

const returnUserIdFromUsername = async (username) => {
  try {
    const request = await axios.get(returnUrlSearch(username), AUTH);
    return request.data.data;
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

const returnAllTweets = async (userData, tweetData) => {
  const tweetArray = [];
  const tweetMediaArray = tweetData.includes.media;

  let video_variants;
  let preview_image;

  tweetData.data.map((tweet) => {
    try {
      const tweetMediaKey = tweet.attachments.media_keys[0];
      for (let i = 0; i < tweetMediaArray.length; i++) {
        if (tweetMediaKey === tweetMediaArray[i].media_key) {
          video_variants = tweetMediaArray[i].variants;
          preview_image = tweetMediaArray[i].preview_image_url;
        }
      }
    } catch {
      video_variants = "NONE";
      preview_image = "NONE";
    }

    //HERE
    const time = new Date(tweet.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    const dateTimeStamp = time.replace(",", " -");

    const newTweet = {
      userId: userData.id,
      tweetId: tweet.id,
      name: userData.name,
      username: userData.username,
      tweetText: tweet.text,
      metrics: tweet.public_metrics,
      timeStamp: dateTimeStamp,
      video_options: video_variants,
      preview_image_link: preview_image,
      profilePic: userData.profile_image_url,
    };
    tweetArray.push(newTweet);
  });
  return tweetArray;
};

const getUserTweets = async (username) => {
  const userData = await returnUserIdFromUsername(username);
  const tweetData = await returnTweetDataFromUserId(userData.id);
  const tweetArray = await returnAllTweets(userData, tweetData);

  const nextToken = tweetData.meta.next_token;
  const requestedTweetData = {
    next_token: nextToken,
    tweets: tweetArray,
  };

  return requestedTweetData;
};

const getContentTweets = async (searchWord) => {
  const request = await axios.get(returnUrlContent(searchWord), AUTH);
  return request.data;
};

export { getUserTweets, getContentTweets };
