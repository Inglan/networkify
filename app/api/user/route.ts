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
  const { token } = await JSON.parse(reqBody);
  if (!token) {
    return Response.json(
      { error: true, response: "Token not provided" },
      { status: 400 },
    );
  }

  try {
    const username = await getCurrentUsername(token);
    return Response.json({
      error: false,
      username: username,
      following: await getUserFollowing(token, username),
      followers: await getUserFollowers(token, username),
    });
  } catch {
    return Response.json({ error: true }, { status: 500 });
  }
}
