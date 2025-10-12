"use client";

import { getUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users } from "@/lib/types";
import * as tokenUtils from "@/lib/tokenUtils";

export function Discover({
  setTokenAction: setToken,
  token,
  setUsersAction: setUsers,
  updateGraphAction: updateGraph,
  users,
  activeOperations,
  discoverAction: discover,
}: {
  setTokenAction: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setUsersAction: React.Dispatch<React.SetStateAction<Users>>;
  updateGraphAction: () => void;
  users: Users;
  activeOperations: number;
  discoverAction: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Token"
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          try {
            const token = tokenUtils.getFromClipboard(e);
            setToken(token);
          } catch {
            setToken(e.clipboardData.getData("text"));
          }
        }}
      />

      <Button
        disabled={!token}
        onClick={async () => {
          try {
            const data = await getUser(token);
            setUsers([
              {
                followers: [],
                following: [],
                name: data.name,
                searchState: "not_searched",
                username: data.username,
                exclude_from_graph: false,
              },
            ]);
            updateGraph();
          } catch {
            toast.error("Something went wrong. Maybe aquire another token.");
          }
        }}
      >
        Add current user
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) =>
                !user.exclude_from_graph &&
                user.followers.length + user.following.length == 0,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Run on all nodes with no follows (
        {
          users.filter(
            (user) =>
              !user.exclude_from_graph &&
              user.followers.length + user.following.length == 0,
          ).length
        }
        )
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) =>
                user.searchState == "searched" &&
                !user.exclude_from_graph &&
                user.followers.length + user.following.length == 0,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Rerun on all searched nodes w/ no follows (
        {
          users.filter(
            (user) =>
              user.searchState == "searched" &&
              !user.exclude_from_graph &&
              user.followers.length + user.following.length == 0,
          ).length
        }
        )
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) =>
                user.searchState == "not_searched" && !user.exclude_from_graph,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Run on all unsearched nodes (
        {
          users.filter(
            (user) =>
              user.searchState == "not_searched" && !user.exclude_from_graph,
          ).length
        }
        )
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) => user.searchState == "error" && !user.exclude_from_graph,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Rerun on all errored nodes (
        {
          users.filter(
            (user) => user.searchState == "error" && !user.exclude_from_graph,
          ).length
        }
        )
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter((user) => !user.exclude_from_graph)
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Run on all nodes (
        {users.filter((user) => !user.exclude_from_graph).length})
      </Button>
      <div>{activeOperations} active searches</div>
    </div>
  );
}
