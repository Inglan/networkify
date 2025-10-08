import { Dispatch, SetStateAction } from "react";
import { Edges, Nodes, Users } from "./types";
import { toast } from "sonner";

export function updateGraph(
  nodes: Nodes,
  setNodes: Dispatch<SetStateAction<Nodes>>,
  edges: Edges,
  setEdges: Dispatch<SetStateAction<Edges>>,
  users: Users,
) {
  let updatedNodes: typeof nodes = [];
  const updatedEdges: typeof edges = [];
  users.forEach((user) => {
    let fillColor: string;
    switch (user.searchState) {
      case "not_searched":
        fillColor = "gray";
        break;
      case "searching":
        fillColor = "blue";
        break;
      case "searched":
        fillColor = "green";
        break;
      case "error":
        fillColor = "red";
        break;
      default:
        fillColor = "gray";
    }
    updatedNodes.push({
      id: user.username,
      label: user.name,
      fill: fillColor,
    });

    if (user.followers.length < 100) {
      user.followers.forEach((follower) => {
        if (!follower.username.startsWith("spotify:artist")) {
          const followerId = follower.username.replace("spotify:user:", "");
          const userId = user.username.replace("spotify:user:", "");
          const edgeId = `${followerId}-${userId}`;
          if (!updatedEdges.some((edge) => edge.id === edgeId)) {
            updatedEdges.push({
              id: edgeId,
              source: followerId,
              target: userId,
              label: "Following",
            });
          }
        }
      });
    }

    if (user.following.length < 100) {
      user.following.forEach((following) => {
        if (!following.username.startsWith("spotify:artist")) {
          const userId = user.username.replace("spotify:user:", "");
          const followingId = following.username.replace("spotify:user:", "");
          const edgeId = `${userId}-${followingId}`;
          if (!updatedEdges.some((edge) => edge.id === edgeId)) {
            updatedEdges.push({
              id: edgeId,
              source: userId,
              target: followingId,
              label: "Following",
            });
          }
        }
      });
    }
  });

  updatedNodes.forEach((node) => {
    if (
      !updatedEdges.some(
        (edge) => edge.source === node.id || edge.target === node.id,
      )
    ) {
      updatedNodes = updatedNodes.filter((n) => n.id !== node.id);
    }
  });

  setNodes(updatedNodes);
  setEdges(updatedEdges);
  toast.success("Graph updated");
}
