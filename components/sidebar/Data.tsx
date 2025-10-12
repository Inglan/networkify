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

export function Data({
  setUsersAction: setUsers,
  users,
  nodes,
  edges,
  save,
  setSaveAction: setSave,
}: {
  setUsersAction: (users: Users) => void;
  users: Users;
  nodes: Nodes;
  edges: Edges;
  save: Save[];
  setSaveAction: React.Dispatch<React.SetStateAction<Save[]>>;
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

      <form
        className="flex flex-row gap-2 required"
        onSubmit={(e) => {
          e.preventDefault();
          const formElement = e.target as HTMLFormElement;
          const formData = new FormData(formElement);
          const data = Object.fromEntries(formData.entries());
          const saveName = data.name.toString();
          if (!saveName) return;
          setSave((current) => {
            const newSave = current;
            newSave.push({ name: saveName, date: Date.now(), data: { users } });
            return newSave;
          });
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
            {save.map((s) => (
              <div key={s.date}>{s.name}</div>
            ))}
            {save.length === 0 && <div>No saves available</div>}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
