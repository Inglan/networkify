"use server";

import {
  getCurrentUser,
  getUserFollowers,
  getUserFollowing,
} from "@/lib/spotifyUtils";

export async function getFollows(token: string, username: string) {
  if (!(token && username)) {
    throw new Error("Token or username not provided");
  }
  try {
    return {
      following: await getUserFollowing(token, username),
      followers: await getUserFollowers(token, username),
    };
  } catch {
    throw new Error("Something went wrong");
  }
}

export async function getUser(token: string) {
  if (!token) {
    throw new Error("Token not provided");
  }

  try {
    const userInfo = await getCurrentUser(token);
    return {
      ...userInfo,
      following: await getUserFollowing(token, userInfo.username),
      followers: await getUserFollowers(token, userInfo.username),
    };
  } catch {
    throw new Error("Something went wrong");
  }
}
