"use client";

import { useEffect, useState } from "react";
import { GraphCanvas } from "reagraph";
import { getUser } from "./actions";

export default function Home() {
  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);
  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);

  const [token, setToken] = useState<string>("");

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
        onClick={() =>
          getUser(token).then((data) => {
            setNodes([
              ...nodes,
              {
                id: data.username,
                label: data.name,
              },
            ]);
            console.log(nodes);
          })
        }
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
