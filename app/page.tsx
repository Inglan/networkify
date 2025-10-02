"use client";

import { useEffect, useState } from "react";
import { GraphCanvas } from "reagraph";
import { getFollows, getUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);
  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);

  const [token, setToken] = useState<string>("");

  async function addUserFollowsToGraph(username: string) {
    const { followers, following } = await getFollows(token, username);
    if (!(followers.length > 50 || following.length > 50)) {
      followers.forEach((follower) => {
        setNodes((currentNodes) => {
          if (!currentNodes.some((node) => node.id === follower.username)) {
            addUserFollowsToGraph(follower.username);
            return [
              ...currentNodes,
              {
                id: follower.username,
                label: follower.name,
              },
            ];
          } else {
            console.log(`Node ${follower.username} already exists`);
          }
          return currentNodes;
        });
        setEdges((currentEdges) => {
          if (
            !currentEdges.some(
              (edge) => edge.id === `${follower.username}-${username}`,
            )
          ) {
            return [
              ...currentEdges,
              {
                source: follower.username,
                target: username,
                id: `${follower.username}-${username}`,
                label: "Follower",
              },
            ];
          } else {
            console.log(`Edge ${follower.username}-${username} already exists`);
          }
          return currentEdges;
        });
      });
      following.forEach((user) => {
        setNodes((currentNodes) => {
          if (!currentNodes.some((node) => node.id === user.username)) {
            addUserFollowsToGraph(user.username);
            return [
              ...currentNodes,
              {
                id: user.username,
                label: user.name,
              },
            ];
          } else {
            console.log(`Node ${user.username} already exists`);
          }
          return currentNodes;
        });
        setEdges((currentEdges) => {
          if (
            !currentEdges.some(
              (edge) => edge.id === `${username}-${user.username}`,
            )
          ) {
            return [
              ...currentEdges,
              {
                source: username,
                target: user.username,
                id: `${username}-${user.username}`,
                label: "Following",
              },
            ];
          } else {
            console.log(`Edge ${username}-${user.username} already exists`);
          }
          return currentEdges;
        });
      });
    } else {
      console.log(
        username + " has more than 50 followers or following, skipping",
      );
    }
  }

  return (
    <>
      <div className="top-2 left-2 p-4 bg-card border fixed z-30 rounded-md">
        Token
        <Input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <br />
        <Button
          onClick={async () => {
            const data = await getUser(token);
            setNodes((currentNodes) => [
              ...currentNodes,
              {
                id: data.username,
                label: data.name,
              },
            ]);
            addUserFollowsToGraph(data.username);
          }}
        >
          Run
        </Button>
        <Button
          onClick={() => {
            const data = {
              nodes: nodes,
              edges: edges,
            };

            const blob = new Blob([JSON.stringify(data)], {
              type: "text/plain;charset=utf-8",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "graph_data.json";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Save
        </Button>
        <Button>Load</Button>
      </div>
      <GraphCanvas
        labelType="nodes"
        draggable={true}
        nodes={nodes}
        edges={edges}
        onNodeClick={(node) =>
          window.open("https://open.spotify.com/user/" + node.id)
        }
      />
    </>
  );
}
