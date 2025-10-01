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
      return Response.json({
        error: false,
        response: parsedData.data.me.profile,
      });
    } else {
      return Response.json({ error: true, response: parsedData });
    }
  } catch (error) {
    return Response.json({ error: true, response: data });
  }
}
