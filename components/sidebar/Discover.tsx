"use client";

import { getUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { Users } from "@/lib/types";
import * as tokenUtils from "@/lib/tokenUtils";

export function Discover({
  setTokenAction: setToken,
  token,
  setAutoAction: setAuto,
  auto,
  setUsersAction: setUsers,
  updateGraphAction: updateGraph,
  users,
  activeOperations,
  discoverAction: discover,
}: {
  setTokenAction: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setAutoAction: React.Dispatch<React.SetStateAction<CheckedState>>;
  auto: CheckedState;
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
          } catch (error) {
            setToken(e.clipboardData.getData("text"));
          }
        }}
      />

      <div className="flex items-center gap-3">
        <Checkbox
          id="auto"
          checked={auto}
          onCheckedChange={(value) => setAuto(value)}
        />
        <Label htmlFor="auto">Auto discover</Label>
      </div>
      <br />
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
      <div>{activeOperations} active searches</div>
    </div>
  );
}
