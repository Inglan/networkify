import {
  getCurrentUsername,
  getUserFollowing,
  getUserFollowers,
} from "@/lib/utils";

export async function POST(req: Request) {
  const reqBody = await req.text();
  try {
    JSON.parse(reqBody);
  } catch (error) {
    return Response.json(
      { error: true, response: "Invalid JSON" },
      { status: 400 },
    );
  }
  const { token, username } = await JSON.parse(reqBody);
  if (!(token && username)) {
    return Response.json(
      { error: true, response: "Token or username not provided" },
      { status: 400 },
    );
  }
  return Response.json({
    error: false,
    following: await getUserFollowing(token, username),
    followers: await getUserFollowers(token, username),
  });
}
