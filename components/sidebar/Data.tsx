"use client";

import { Button } from "@/components/ui/button";
import * as dataUtils from "@/lib/dataUtils";
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
    <div className="flex flex-col gap-2">
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

          dataUtils.exportData(data);
        }}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          dataUtils.loadFromExport().then((data) => {
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
