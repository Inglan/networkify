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
    if (!(followers.length > 20)) {
      followers.forEach((follower) => {
        setNodes((currentNodes) => [
          ...currentNodes,
          {
            id: follower.username,
            label: follower.name,
          },
        ]);
        setEdges((currentEdges) => [
          ...currentEdges,
          {
            source: follower.username,
            target: username,
            id: `${follower.username}-${username}`,
            label: "Follower",
          },
        ]);
        addUserFollowsToGraph(follower.username);
      });
      following.forEach((user) => {
        setNodes((currentNodes) => [
          ...currentNodes,
          {
            id: user.username,
            label: user.name,
          },
        ]);
        setEdges((currentEdges) => [
          ...currentEdges,
          {
            source: username,
            target: user.username,
            id: `${username}-${user.username}`,
            label: "Following",
          },
        ]);
        addUserFollowsToGraph(user.username);
      });
    }
  }

  return (
    <>
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
        test
      </button>
      <br />
      {JSON.stringify(nodes)}
      <div style={{ position: "fixed", width: "75%", height: "75%" }}>
        <GraphCanvas nodes={nodes} edges={edges} />
      </div>
    </>
  );
}
