"use client";

import { useEffect, useRef, useState } from "react";
import { GraphCanvasRef } from "reagraph";
import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { PanelBottom, PanelRight, Sidebar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Kbd } from "@/components/ui/kbd";
import { Edges, Nodes, Save, Users } from "@/lib/types";
import * as graph from "@/lib/graphUtils";
import * as user from "@/lib/userUtils";
import * as spotify from "@/lib/spotifyClientUtils";
import { Data } from "./Data";
import { Graph } from "../graph/Graph";
import { Header } from "./Header";
import { Discover } from "./Discover";
import { UserInfo } from "./UserInfo";
import { Search } from "./Search";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function SidebarContent({
  nodes,
  edges,
  setTokenAction: setToken,
  token,
  setUsersAction: setUsers,
  updateGraphAction: updateGraph,
  users,
  activeOperations,
  graphRef,
  openAccordionAction: openAccordion,
  closeAccordionAction: closeAccordion,
  selectedUserId,
  setSelectedUserIdAction: setSelectedUserId,
  updateUserStateAction: updateUserState,
  discoverAction: discover,
  accordionValues,
  setAccordionValuesAction: setAccordionValues,
  setSidebarOpenAction: setSidebarOpen,
  save,
  setSaveAction: setSave,
}: {
  nodes: Nodes;
  edges: Edges;
  setTokenAction: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setUsersAction: React.Dispatch<React.SetStateAction<Users>>;
  updateGraphAction: () => void;
  users: Users;
  activeOperations: number;
  graphRef: React.RefObject<GraphCanvasRef | null>;
  openAccordionAction: (id: string) => void;
  closeAccordionAction: (id: string) => void;
  selectedUserId: string;
  setSelectedUserIdAction: React.Dispatch<React.SetStateAction<string>>;
  updateUserStateAction: (
    username: string,
    newState: Partial<Users[number]>,
  ) => void;
  discoverAction: (username: string) => Promise<void>;
  accordionValues: string[];
  setAccordionValuesAction: React.Dispatch<React.SetStateAction<string[]>>;
  setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
  save: Save[];
  setSaveAction: React.Dispatch<React.SetStateAction<Save[]>>;
}) {
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
              setTokenAction={setToken}
              setUsersAction={setUsers}
              token={token}
              updateGraphAction={updateGraph}
              users={users}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Data">
          <AccordionTrigger className="px-4">Data</AccordionTrigger>
          <AccordionContent className="p-4">
            <Data
              edges={edges}
              nodes={nodes}
              setUsersAction={setUsers}
              users={users}
              save={save}
              setSaveAction={setSave}
            />
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
              graphRef={graphRef}
              nodes={nodes}
              openAccordionAction={openAccordion}
              selectedUserId={selectedUserId}
              setSelectedUserIdAction={setSelectedUserId}
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
              graphRef={graphRef}
              nodes={nodes}
              openAccordionAction={openAccordion}
              selectedUserId={selectedUserId}
              setSelectedUserIdAction={setSelectedUserId}
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
