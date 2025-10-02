export async function getCurrentUser(token: string): Promise<{
  username: string;
  name: string;
  image_url: string;
}> {
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
    if (parsedData.data.me.profile) {
      return {
        username: parsedData.data.me.profile.username,
        name: parsedData.data.me.profile.name,
        image_url: (
          parsedData.data.me.profile.avatar.sources as {
            height: number;
            width: number;
            url: string;
          }[]
        ).slice(-1)[0].url,
      };
    } else {
      throw new Error("Username not found");
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}
export async function getUserFollowers(
  token: string,
  username: string,
): Promise<
  {
    username: string;
    name: string;
    image_url: string;
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
      return (
        parsedData.profiles as {
          uri: string;
          name: string;
          image_url: string;
          followers_count: number;
          color: number;
        }[]
      )
        .filter((profile) => profile.uri.startsWith("spotify:user:"))
        .map((profile) => ({
          username: profile.uri.split(":")[2],
          name: profile.name,
          image_url: profile.image_url,
        }));
    } else {
      return [];
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}
export async function getUserFollowing(
  token: string,
  username: string,
): Promise<
  {
    username: string;
    name: string;
    image_url: string;
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
      return (
        parsedData.profiles as {
          uri: string;
          name: string;
          image_url: string;
          followers_count: number;
          is_following: boolean;
        }[]
      )
        .filter((profile) => profile.uri.startsWith("spotify:user:"))
        .map((profile) => ({
          username: profile.uri.split(":")[2],
          name: profile.name,
          image_url: profile.image_url,
        }));
    } else {
      return [];
    }
  } catch (error) {
    throw new Error("Failed to parse response");
  }
}
