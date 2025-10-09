import { Dispatch } from "react";
import { Users } from "./types";

export function updateState(
  username: string,
  newState: Partial<Users[number]>,
  setUsers: Dispatch<React.SetStateAction<Users>>,
) {
  setUsers((prev) => {
    const userIndex = prev.findIndex(
      (user) => user.username === username.replace("spotify:user:", ""),
    );
    if (userIndex === -1) return prev;
    return [
      ...prev.slice(0, userIndex),
      { ...prev[userIndex], ...newState },
      ...prev.slice(userIndex + 1),
    ];
  });
}

export function create(
  userData: Users[number],
  setUsers: Dispatch<React.SetStateAction<Users>>,
) {
  let created = false;
  setUsers((prev) => {
    if (!prev.some((user) => user.username === userData.username)) {
      created = true;
      return [...prev, userData];
    }
    return prev;
  });
  return created;
}
