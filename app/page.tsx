"use client";

import { useEffect, useRef, useState } from "react";
import { GraphCanvasRef } from "reagraph";
import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { Sidebar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Kbd } from "@/components/ui/kbd";
import { Edges, Nodes, Users } from "@/lib/types";
import * as graph from "@/lib/graphUtils";
import * as user from "@/lib/userUtils";
import * as spotify from "@/lib/spotifyClientUtils";
import { Data } from "./Data";
import { Graph } from "./Graph";
import { Header } from "./Header";
import { Discover } from "./Discover";
import { UserInfo } from "./UserInfo";
import { Search } from "./Search";

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // Data
  const [users, setUsers] = useState<Users>([]);

  // Graph state
  const [nodes, setNodes] = useState<Nodes>([]);
  const [edges, setEdges] = useState<Edges>([]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accordionValues, setAccordionValues] = useState<string[]>([
    "discover",
  ]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [activeOperations, setActiveOperations] = useState<number>(0);

  const [token, setToken] = useState<string>("");
  const [auto, setAuto] = useState<CheckedState>(false);

  // Opens accordions in sidebar
  const openAccordion = (value: string) => {
    setAccordionValues((prev) => {
      if (prev.includes(value)) {
        return prev;
      } else {
        return [...prev, value];
      }
    });
  };

  // Closes accordions in sidebar
  const closeAccordion = (value: string) => {
    setAccordionValues((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return prev;
      }
    });
  };

  // Updates graph with latest data
  const updateGraph = () =>
    graph.update(nodes, setNodes, edges, setEdges, users);

  // Updates state of user by username
  const updateUserState = (
    username: string,
    newState: Partial<Users[number]>,
  ) => user.updateState(username, newState, setUsers);

  // Creates a new user in users array
  const createUser = (userData: (typeof users)[number]) =>
    user.create(userData, setUsers);

  // Discovers user's follows
  const discover = (username: string) =>
    spotify.discover(
      username,
      token,
      setActiveOperations,
      updateUserState,
      createUser,
    );

  // Search hotkey
  useHotkeys("mod+f", () => openAccordion("search"), {
    preventDefault: true,
  });
  // Sidebar hotkey
  useHotkeys("mod+b", () => setSidebarOpen(!sidebarOpen), {
    preventDefault: true,
  });

  // Auto update
  useEffect(() => {
    if (activeOperations === 0) {
      updateGraph();
    }
  }, [activeOperations, users.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className={clsx(
          "sidebar fixed top-0 right-0 h-full w-96 z-10 border-l duration-300 bg-card overflow-auto",
          !sidebarOpen && "translate-x-96",
        )}
      >
        <SidebarContent
          accordionValues={accordionValues}
          activeOperations={activeOperations}
          auto={auto}
          closeAccordionAction={closeAccordion}
          discoverAction={discover}
          edges={edges}
          graphRef={graphRef}
          nodes={nodes}
          openAccordionAction={openAccordion}
          selectedUserId={selectedUserId}
          setAccordionValuesAction={setAccordionValues}
          setAutoAction={setAuto}
          setSelectedUserIdAction={setSelectedUserId}
          setTokenAction={setToken}
          setUsersAction={setUsers}
          token={token}
          updateGraphAction={updateGraph}
          updateUserStateAction={updateUserState}
          users={users}
        />
      </div>
      <Button
        size="icon"
        className="fixed bottom-2 right-2 z-20"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Sidebar />
      </Button>
      <Graph
        discoverAction={discover}
        edges={edges}
        graphRef={graphRef}
        nodes={nodes}
        openAccordionAction={openAccordion}
        selectedUserId={selectedUserId}
        setSelectedUserIdAction={setSelectedUserId}
      />
    </>
  );
}

export function SidebarContent({
  nodes,
  edges,
  setTokenAction: setToken,
  token,
  setAutoAction: setAuto,
  auto,
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
}: {
  nodes: Nodes;
  edges: Edges;
  setTokenAction: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setAutoAction: React.Dispatch<React.SetStateAction<CheckedState>>;
  auto: CheckedState;
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
}) {
  return (
    <>
      <Header updateGraphAction={updateGraph} />
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
              auto={auto}
              discoverAction={discover}
              setAutoAction={setAuto}
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
