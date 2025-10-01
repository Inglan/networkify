"use client";

import { useEffect, useState } from "react";
import { GraphCanvas } from "reagraph";
import { getFollows, getUser } from "./actions";

export default function Home() {
  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);
  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);

  const [token, setToken] = useState<string>("");

  async function addUserFollowsToGraph(username: string) {
    const { followers, following } = await getFollows(token, username);
    if (!(followers.length > 50)) {
      followers.forEach((follower) => {
        setNodes((currentNodes) => {
          return [
            ...currentNodes,
            {
              id: follower.username,
              label: follower.name,
            },
          ];
        });
        setEdges((currentEdges) => {
          return [
            ...currentEdges,
            {
              source: follower.username,
              target: username,
              id: `${follower.username}-${username}`,
              label: "Follower",
            },
          ];
        });
        addUserFollowsToGraph(follower.username);
      });
      following.forEach((user) => {
        setNodes((currentNodes) => {
          return [
            ...currentNodes,
            {
              id: user.username,
              label: user.name,
            },
          ];
        });
        setEdges((currentEdges) => {
          return [
            ...currentEdges,
            {
              source: username,
              target: user.username,
              id: `${username}-${user.username}`,
              label: "Following",
            },
          ];
        });
        addUserFollowsToGraph(user.username);
      });
    } else {
      console.log(username + " has more than 50 followers, skipping");
    }
  }

  return (
    <>
      <div className="top-0 left-0 p-4 bg-black fixed z-10">
        Token
        <input
          className="p-2 border"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <br />
        <button
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
        </button>
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
