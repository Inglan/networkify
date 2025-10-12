"use client";

import { Button } from "@/components/ui/button";
import { loadFromExport } from "@/lib/dataUtils";
import { Edges, Nodes, Users } from "@/lib/types";

export function Data({
  setUsersAction: setUsers,
  users,
  nodes,
  edges,
}: {
  setUsersAction: (users: Users) => void;
  users: Users;
  nodes: Nodes;
  edges: Edges;
}) {
  return (
    <div className=" flex flex-col gap-2">
      <Button
        onClick={() => {
          setUsers([]);
        }}
      >
        Clear all
      </Button>
      <Button
        onClick={() => {
          const data = {
            users,
          };

          const blob = new Blob([JSON.stringify(data)], {
            type: "text/plain;charset=utf-8",
          });

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `networkify-${new Date().toISOString()}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          loadFromExport().then((data) => {
            setUsers(data.users);
          });
        }}
      >
        Load
      </Button>
      <div>You need to manually update the graph after loading data.</div>
      <div>{nodes.length} nodes</div>
      <div>{edges.length} edges</div>
      <div>{users.length} users</div>
    </div>
  );
}
