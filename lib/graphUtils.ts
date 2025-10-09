import { Dispatch } from "react";
import { Edges, Nodes, Users } from "./types";
import { toast } from "sonner";

export function update(
  nodes: Nodes,
  setNodes: Dispatch<React.SetStateAction<Nodes>>,
  edges: Edges,
  setEdges: Dispatch<React.SetStateAction<Edges>>,
  users: Users,
) {
  const updatedNodes: typeof nodes = [];
  const updatedEdges: typeof edges = [];
  users
    .filter((user) => !user.exclude_from_graph)
    .forEach((user) => {
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
    });

  setNodes(updatedNodes);
  setEdges(updatedEdges);
  toast.success("Graph updated");
}
