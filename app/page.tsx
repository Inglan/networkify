"use client";

import { useState } from "react";
import { GraphCanvas } from "reagraph";

export default function Home() {
  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);

  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);

  return (
    <>
      <GraphCanvas nodes={nodes} edges={edges} />
    </>
  );
}
