import axios from "axios";
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
  `${contentURL}${searchWord}&tweet.fields=attachments%2Ccreated_at%2Cpublic_metrics&max_results=10&media.fields=media_key%2Cpublic_metrics%2Cpreview_image_url%2Curl%2Cvariants&expansions=attachments.media_keys&user.fields=profile_image_url%2Cname`;

const getTweetTime = (tweetTime) => {
  const time = new Date(tweetTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  const dateTimeStamp = time.replace(",", " -");
  return dateTimeStamp;
};

const returnUserIdFromUsername = async (username) => {
  try {
    const request = await axios.get(returnUrlSearch(username), AUTH);
    return request.data.data.id;
  } catch {
    return "User Doesn't Exist!";
  }
};

const returnSearchObjectFromUsername = async (username) => {
  const userId = await returnUserIdFromUsername(username);
  const request = (await axios.get(returnUrlTweets(userId), AUTH)).data;
  const nextToken = request.meta.next_token;
  const tweetIdArray = request.data.map((tweet) => tweet.id);
  return {
    search_value: username,
    user_id: userId,
    next_token: nextToken,
    tweets: tweetIdArray,
  };
};

const returnSearchObjectFromContent = async (content) => {
  const request = (await axios.get(returnUrlContent(content), AUTH)).data;
  const nextToken = request.meta.next_token;
  const tweetIdArray = request.data.map((tweet) => tweet.id);
  return { search_value: content, next_token: nextToken, tweets: tweetIdArray };
};

const buildTweetIdListStringFromArray = (idArray) => {
  const tempArray = [`&ids=`];
  idArray.map((id) => tempArray.push(`%2C${id}`));
  return tempArray.toString().replace("%2C", "").replaceAll(",", "");
};

const queryURL = `https://api.twitter.com/2/tweets?`;
const userFields = `&user.fields=name%2Cprofile_image_url%2Cusername`;
const mediaFields = `&media.fields=public_metrics%2Cvariants%2Cmedia_key%2Cpreview_image_url%2Curl`;
const tweetFields = `&tweet.fields=attachments%2Ccreated_at%2Cpublic_metrics`;
const expansionFields = `&expansions=attachments.media_keys%2Cauthor_id%2Centities.mentions.username%2Creferenced_tweets.id%2Creferenced_tweets.id.author_id`;
const modFields = `${userFields}${mediaFields}${tweetFields}${expansionFields}`;

const getRawTweetDataFromSearchObject = async (searchObject) => {
  const idArray = searchObject.tweets;
  const tweet_id_list = buildTweetIdListStringFromArray(idArray);
  const built_url = `${queryURL}${tweet_id_list}${modFields}`;
  const request = (await axios.get(built_url, AUTH)).data;
  return {
    search_value: searchObject.search_value,
    next_token: searchObject.next_token,
    raw_data: request,
  };
};

const getTweetsFromUsername = async (username) => {
  const searchObject = await returnSearchObjectFromUsername(username);
  const rawTweetData = await getRawTweetDataFromSearchObject(searchObject);
  return rawTweetData;
};

const getTweetsFromContent = async (content) => {
  const searchObject = await returnSearchObjectFromContent(content);
  const rawTweetData = await getRawTweetDataFromSearchObject(searchObject);
  return rawTweetData;
};

const returnMediaKeys = (tweet) => {
  try {
    const media_keys = tweet.attachments.media_keys;
    return media_keys;
  } catch {
    return false;
  }
};

const returnTweetDataObject = (tweet) => {
  const media_keys = returnMediaKeys(tweet);
  return {
    userId: tweet.author_id,
    tweetId: tweet.id,
    retweets: tweet.public_metrics.retweet_count,
    likes: tweet.public_metrics.like_count,
    replies: tweet.public_metrics.reply_count,
    timeStamp: getTweetTime(tweet.created_at),
    tweetText: tweet.text,
    media_keys: media_keys,
  };
};

const returnUserDataObject = (tweet, tweetUsers) => {
  try {
    const currentUserObject = tweetUsers.map((user) => {
      if (tweet.author_id === user.id)
        return {
          name: user.name,
          username: user.username,
          profile_image_url: user.profile_image_url,
          error: "NONE",
        };
    });
    return currentUserObject.filter((item) => item !== undefined)[0];
  } catch {
    return false;
  }
};

const returnMediaDataObject = (tweet, tweetMedia) => {
  try {
    const currentMediaObject = tweetMedia.map((mediaItem) => {
      if (tweet.attachments.media_keys.includes(mediaItem.media_key)) {
        if (mediaItem.type === "animated_gif")
          return {
            type: mediaItem.type,
            media_key: mediaItem.media_key,
            variants: mediaItem.variants,
          };
        if (mediaItem.type === "photo")
          return {
            type: mediaItem.type,
            media_key: mediaItem.media_key,
            image_url: mediaItem.url,
          };
        if (mediaItem.type === "video")
          return {
            type: mediaItem.type,
            media_key: mediaItem.media_key,
            //image_url: mediaItem.url,
            variants: mediaItem.variants,
          };
      }
    });
    return currentMediaObject.filter((item) => item !== undefined);
  } catch {
    return false;
  }
};

// Make function that returns all tweets attached with all elements needed
const returnFormattedTweets = (rawTweetData) => {
  const searchValue = rawTweetData.search_value;
  const nextToken = rawTweetData.next_token;
  const tweetData = rawTweetData.raw_data;

  const tweetUsers = tweetData.includes.users;
  const tweetMedia = tweetData.includes.media;
  const tweetArray = tweetData.data;

  const formattedTweets = tweetArray.map((tweet) => {
    return {
      tweetData: returnTweetDataObject(tweet),
      tweetUserData: returnUserDataObject(tweet, tweetUsers),
      tweetMediaData: returnMediaDataObject(tweet, tweetMedia),
    };
  });
  return {
    search_value: searchValue,
    next_token: nextToken,
    tweetArray: formattedTweets,
  };
};

export { returnFormattedTweets, getTweetsFromUsername, getTweetsFromContent };
