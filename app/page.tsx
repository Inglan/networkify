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
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [accordionValues, setAccordionValues] = useState<string[]>([
    "discover",
  ]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [activeOperations, setActiveOperations] = useState<number>(0);

  const [token, setToken] = useState<string>("");
  const [auto, setAuto] = useState<CheckedState>(false);

  const openAccordion = (value: string) => {
    setAccordionValues((prev) => {
      if (prev.includes(value)) {
        return prev;
      } else {
        return [...prev, value];
      }
    });
  };

  const closeAccordion = (value: string) => {
    setAccordionValues((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return prev;
      }
    });
  };

  const updateGraph = () =>
    graph.update(nodes, setNodes, edges, setEdges, users);

  const updateUserState = (
    username: string,
    newState: Partial<Users[number]>,
  ) => user.updateState(username, newState, setUsers);

  const createUser = (userData: (typeof users)[number]) =>
    user.create(userData, setUsers);

  const discover = (username: string) =>
    spotify.discover(
      username,
      token,
      setActiveOperations,
      updateUserState,
      createUser,
    );

  useHotkeys("mod+f", () => openAccordion("search"), {
    preventDefault: true,
  });
  useHotkeys("mod+b", () => setSidebarHidden(!sidebarHidden), {
    preventDefault: true,
  });

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
          sidebarHidden && "translate-x-96",
        )}
      >
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
      </div>
      <Button
        size="icon"
        className="fixed bottom-2 right-2 z-20"
        onClick={() => setSidebarHidden(!sidebarHidden)}
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
