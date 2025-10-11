import { ClipboardEvent } from "react";

export function getFromClipboard(event: ClipboardEvent<HTMLInputElement>) {
  const data = event.clipboardData.getData("text");
  try {
    const parsedData = JSON.parse(data);
    return JSON.parse(
      parsedData.log.entries.filter((entry: { request: { url: string } }) =>
        entry.request.url.includes("https://open.spotify.com/api/token"),
      )[0].response.content.text,
    ).accessToken;
  } catch {
    return data;
  }
}
