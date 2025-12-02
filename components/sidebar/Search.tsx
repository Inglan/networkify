"use client";

import { RefObject } from "react";
import { GraphCanvasRef } from "reagraph";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Node, User } from "@/lib/types";

export function Search({
  users,
  nodes,
  selectedUserId,
  setSelectedUserIdAction: setSelectedUserId,
  openAccordionAction: openAccordion,
  graphRef,
}: {
  users: User[];
  nodes: Node[];
  selectedUserId: string;
  setSelectedUserIdAction: (userId: string) => void;
  openAccordionAction: (id: string) => void;
  graphRef: RefObject<GraphCanvasRef | null>;
}) {
  return (
    <Command className="bg-transparent">
      <CommandInput autoFocus placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {users.map((user) => (
            <CommandItem
              className={
                selectedUserId === user.username
                  ? "!bg-primary !text-primary-foreground"
                  : ""
              }
              onSelect={() => {
                // if nodes has username
                if (nodes.some((node) => node.id === user.username)) {
                  graphRef.current?.centerGraph([user.username]);
                }
                setSelectedUserId(user.username);
                openAccordion("info");
              }}
              key={user.username}
            >
              {user.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
