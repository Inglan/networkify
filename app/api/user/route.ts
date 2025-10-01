async function getCurrentUsername(token: string): Promise<string> {
  const request = await fetch(
    "https://api-partner.spotify.com/pathfinder/v2/query",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variables: {},
        operationName: "profileAttributes",
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              "53bcb064f6cd18c23f752bc324a791194d20df612d8e1239c735144ab0399ced",
          },
        },
      }),
    },
  );
  const data = await request.text();
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.data.me.profile.username) {
      return parsedData.data.me.profile.username;
    } else {
      throw new Error("Username not found");
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}

async function getUserFollowers(
  token: string,
  username: string,
): Promise<
  {
    uri: string;
    name: string;
    image_url: string;
    followers_count: number;
    color: number;
  }[]
> {
  const request = await fetch(
    `https://spclient.wg.spotify.com/user-profile-view/v3/profile/${username}/followers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await request.text();
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.profiles) {
      return parsedData.profiles;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}
async function getUserFollowing(
  token: string,
  username: string,
): Promise<
  {
    uri: string;
    name: string;
    image_url: string;
    followers_count: number;
    is_following: boolean;
  }[]
> {
  const request = await fetch(
    `https://spclient.wg.spotify.com/user-profile-view/v3/profile/${username}/following`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await request.text();
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.profiles) {
      return parsedData.profiles;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}

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
    return Response.json({ error: false, username: username });
  } catch (error) {
    return Response.json({ error: true }, { status: 500 });
  }
}
