"use client";

import { RefObject, useState } from "react";
import { darkTheme, GraphCanvas, GraphCanvasRef } from "reagraph";
import { Edges, Nodes } from "@/lib/types";

export function Graph({
  graphRef,
  selectedUserId,
  nodes,
  edges,
  setSelectedUserIdAction: setSelectedUserId,
  openAccordionAction: openAccordion,
  discoverAction: discover,
}: {
  graphRef: RefObject<GraphCanvasRef | null>;
  selectedUserId: string[];
  nodes: Nodes;
  edges: Edges;
  setSelectedUserIdAction: React.Dispatch<React.SetStateAction<string[]>>;
  openAccordionAction: (id: string) => void;
  discoverAction: (id: string) => void;
}) {
  const [actives, setActives] = useState<string[]>([]);

  return (
    <GraphCanvas
      ref={graphRef}
      selections={selectedUserId}
      labelType="nodes"
      draggable={true}
      nodes={nodes}
      edges={edges}
      theme={{
        ...darkTheme,
        node: {
          ...darkTheme.node,
          inactiveOpacity: 1,
          label: {
            ...darkTheme.node.label,
            strokeWidth: 0,
            stroke: "#171717",
          },
        },
        canvas: { ...darkTheme.canvas, background: "" },
        edge: { ...darkTheme.edge, fill: "#ffffff" },
        arrow: { ...darkTheme.arrow, fill: "#ffffff" },
      }}
      onCanvasClick={() => setSelectedUserId([])}
      onNodeContextMenu={(node) =>
        window.open("https://open.spotify.com/user/" + node.id)
      }
      onNodeClick={(node) => {
        setSelectedUserId([node.id]);
        openAccordion("info");
      }}
      onNodeDoubleClick={(node) => discover(node.id)}
      lassoType="node"
      onLassoEnd={(nodes) => {
        setSelectedUserId(nodes);
        setActives([]);
      }}
      onLasso={(nodes) => {
        setActives(nodes);
      }}
      actives={actives}
    />
  );
}
