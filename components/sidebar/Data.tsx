"use client";

import { Button } from "@/components/ui/button";
import * as dataUtils from "@/lib/dataUtils";
import { Edges, Nodes, Save, Users } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "../ui/input";
import { useSave } from "@/lib/save";
import { ArchiveRestore, Delete, Trash } from "lucide-react";

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
  const saves = useSave((state) => state.save);
  const createSave = useSave((state) => state.create);
  const deleteSave = useSave((state) => state.delete);

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

      <form
        className="flex flex-row gap-2 required"
        onSubmit={(e) => {
          e.preventDefault();
          const formElement = e.target as HTMLFormElement;
          const formData = new FormData(formElement);
          const data = Object.fromEntries(formData.entries());
          const saveName = data.name.toString();
          if (!saveName) return;
          createSave({ users }, saveName);
          formElement.reset();
        }}
      >
        <Input required name="name" placeholder="Save name" />{" "}
        <Button>Save</Button>
      </form>
      <Accordion type="single" collapsible className="border rounded-md px-4">
        <AccordionItem value="saves">
          <AccordionTrigger>Saves</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {saves.map((s) => (
                <div
                  className="border p-2 pl-4 rounded-md flex flex-row gap-2 items-center"
                  key={s.id}
                >
                  <div className="flex flex-col">
                    <div>{s.name}</div>
                    <div>{new Date(s.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="grow"></div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      deleteSave(s.id);
                    }}
                  >
                    <Trash />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => {
                      setUsers(s.data.users);
                    }}
                  >
                    <ArchiveRestore />
                  </Button>
                </div>
              ))}
            </div>
            {saves.length === 0 && <div>No saves available</div>}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
