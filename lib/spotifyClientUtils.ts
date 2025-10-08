import { Dispatch, SetStateAction } from "react";
import { Users } from "./types";
import { getFollows } from "@/app/actions";
import { toast } from "sonner";

export async function discover(
  username: string,
  token: string,
  setActiveOperations: Dispatch<SetStateAction<number>>,
  updateUserState: (username: string, newState: Partial<Users[number]>) => void,
  createUser: (userData: Users[number]) => boolean,
) {
  if (!token) return;
  if (username.startsWith("spotify:artist")) return;
  setActiveOperations((prev) => prev + 1);
  updateUserState(username, { searchState: "searching" });
  try {
    const { followers, following } = await getFollows(token, username);
    // Todo: Limit following (users only, not artists)
    updateUserState(username, {
      searchState: "searched",
      followers,
      following,
    });
    [...followers, ...following]
      .filter((user) => !user.username.startsWith("spotify:artist"))
      .forEach((user) => {
        if (
          !createUser({
            ...user,
            username: user.username.replace("spotify:user:", ""),
            followers: [],
            following: [],
            searchState: "not_searched",
            exclude_from_graph:
              followers.length > 100 ||
              following.filter(
                (user) => !user.username.startsWith("spotify:artist"),
              ).length > 100,
          }) &&
          !(
            followers.length > 100 ||
            following.filter(
              (user) => !user.username.startsWith("spotify:artist"),
            ).length > 100
          )
        ) {
          updateUserState(user.username, {
            exclude_from_graph: false,
          });
        }
      });
  } catch (error) {
    updateUserState(username, { searchState: "error" });
    toast.error("Something went wrong. Maybe aquire another token.");
    console.error("Error occurred while fetching data", error);
  } finally {
    setActiveOperations((prev) => prev - 1);
  }
}
