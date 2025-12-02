"use client";

import { RefObject, useState } from "react";
import { darkTheme, GraphCanvas, GraphCanvasRef } from "reagraph";
import { Edge, Node } from "@/lib/types";
import { useGraphState } from "@/lib/state";

export function Graph({
  openAccordionAction: openAccordion,
  discoverAction: discover,
}: {
  openAccordionAction: (id: string) => void;
  discoverAction: (id: string) => void;
}) {
  const { actives, setActives, nodes, edges, selected, setSelected, graphRef } =
    useGraphState();

  return (
    <GraphCanvas
      ref={graphRef}
      selections={selected}
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
      onCanvasClick={() => setSelected([])}
      onNodeContextMenu={(node) =>
        window.open("https://open.spotify.com/user/" + node.id)
      }
      onNodeClick={(node) => {
        setSelected([node.id]);
        openAccordion("info");
      }}
      onNodeDoubleClick={(node) => discover(node.id)}
      lassoType="node"
      onLassoEnd={(nodes) => {
        setSelected(nodes);
        setActives([]);
      }}
      onLasso={(nodes) => {
        setActives(nodes);
      }}
      actives={actives}
    />
  );
}
