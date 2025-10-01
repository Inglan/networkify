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
          if (!currentNodes.some((node) => node.id === follower.username)) {
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
        addUserFollowsToGraph(follower.username);
      });
      following.forEach((user) => {
        setNodes((currentNodes) => {
          if (!currentNodes.some((node) => node.id === user.username)) {
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
