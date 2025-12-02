"use client";

import { GraphCanvasRef } from "reagraph";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Kbd } from "@/components/ui/kbd";
import { Edge, Node, Users } from "@/lib/types";
import { Data } from "./Data";
import { Header } from "./Header";
import { Discover } from "./Discover";
import { UserInfo } from "./UserInfo";
import { Search } from "./Search";
import { useGraphState } from "@/lib/state";

export function SidebarContent({
  setUsersAction: setUsers,
  updateGraphAction: updateGraph,
  users,
  activeOperations,
  openAccordionAction: openAccordion,
  closeAccordionAction: closeAccordion,
  selectedUserId,
  setSelectedUserIdAction: setSelectedUserId,
  updateUserStateAction: updateUserState,
  discoverAction: discover,
  accordionValues,
  setAccordionValuesAction: setAccordionValues,
  setSidebarOpenAction: setSidebarOpen,
}: {
  setUsersAction: React.Dispatch<React.SetStateAction<Users>>;
  updateGraphAction: () => void;
  users: Users;
  activeOperations: number;
  openAccordionAction: (id: string) => void;
  closeAccordionAction: (id: string) => void;
  selectedUserId: string[];
  setSelectedUserIdAction: React.Dispatch<React.SetStateAction<string[]>>;
  updateUserStateAction: (
    username: string,
    newState: Partial<Users[number]>,
  ) => void;
  discoverAction: (username: string) => Promise<void>;
  accordionValues: string[];
  setAccordionValuesAction: React.Dispatch<React.SetStateAction<string[]>>;
  setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { graphRef } = useGraphState();

  return (
    <>
      <Header
        updateGraphAction={updateGraph}
        setSidebarOpenAction={setSidebarOpen}
      />
      <Accordion
        type="multiple"
        value={accordionValues}
        onValueChange={setAccordionValues}
      >
        <AccordionItem value="discover">
          <AccordionTrigger className="px-4">Discover</AccordionTrigger>
          <AccordionContent className="p-4">
            <Discover
              activeOperations={activeOperations}
              discoverAction={discover}
              setUsersAction={setUsers}
              updateGraphAction={updateGraph}
              users={users}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Data">
          <AccordionTrigger className="px-4">Data</AccordionTrigger>
          <AccordionContent className="p-4">
            <Data setUsersAction={setUsers} users={users} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="search">
          <AccordionTrigger className="px-4">
            Search
            <Kbd>⌘ + F</Kbd>
            <div className="grow"></div>
          </AccordionTrigger>
          <AccordionContent>
            <Search
              openAccordionAction={openAccordion}
              selectedUserId={
                selectedUserId.length == 1 ? selectedUserId[0] : ""
              }
              setSelectedUserIdAction={(userId) => setSelectedUserId([userId])}
              users={users}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="info">
          <AccordionTrigger className="px-4">User info</AccordionTrigger>
          <AccordionContent className="p-4">
            <UserInfo
              closeAccordionAction={closeAccordion}
              discoverAction={discover}
              openAccordionAction={openAccordion}
              setUsersAction={setUsers}
              updateUserStateAction={updateUserState}
              users={users}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
