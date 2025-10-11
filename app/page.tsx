"use client";

import { useEffect, useRef, useState } from "react";
import { GraphCanvasRef } from "reagraph";
import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { PanelBottom, PanelRight } from "lucide-react";
import { Edges, Nodes, Users } from "@/lib/types";
import * as graph from "@/lib/graphUtils";
import * as user from "@/lib/userUtils";
import * as spotify from "@/lib/spotifyClientUtils";
import { Graph } from "./Graph";
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
import { SidebarContent } from "./SidebarContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // Mobile device detection hook
  const isMobile = useIsMobile();

  // Data
  const [users, setUsers] = useState<Users>([]);

  // Graph state
  const [nodes, setNodes] = useState<Nodes>([]);
  const [edges, setEdges] = useState<Edges>([]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gettingStartedDialogOpen, setGettingStartedDialogOpen] =
    useState(true);
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
  useHotkeys("mod+r", () => updateGraph(), {
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
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        modal={isMobile}
        key={isMobile ? "mobile" : "desktop"}
      >
        <DrawerContent className={clsx("!h-screen", isMobile && "!w-screen")}>
          <DrawerTitle className="sr-only">Networkify sidebar</DrawerTitle>
          <div className="w-full h-full overflow-y-auto">
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
              setSidebarOpenAction={setSidebarOpen}
            />
          </div>
        </DrawerContent>
      </Drawer>
      <Button
        size="icon"
        variant="ghost"
        className={clsx("fixed right-4 z-50", isMobile ? "bottom-4" : "top-4")}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {isMobile ? <PanelBottom /> : <PanelRight />}
      </Button>
      {/*<Menubar className="fixed top-2 left-2 z-20">
        <MenubarMenu>
          <MenubarTrigger>Run</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Run on all unsearched nodes</MenubarItem>
            <MenubarItem>Rerun on all errored nodes</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Data</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Update graph</MenubarItem>
            <MenubarItem>Save</MenubarItem>
            <MenubarItem>Load</MenubarItem>
            <MenubarItem>Clear all</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>*/}
      <Graph
        discoverAction={discover}
        edges={edges}
        graphRef={graphRef}
        nodes={nodes}
        openAccordionAction={openAccordion}
        selectedUserId={selectedUserId}
        setSelectedUserIdAction={setSelectedUserId}
      />
      <GettingStartedDialog
        gettingStartedDialogOpen={gettingStartedDialogOpen}
        setGettingStartedDialogOpen={setGettingStartedDialogOpen}
      />
    </>
  );
}

function GettingStartedDialog({
  gettingStartedDialogOpen,
  setGettingStartedDialogOpen,
}: {
  gettingStartedDialogOpen: boolean;
  setGettingStartedDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [page, setPage] = useState(0);

  return (
    <Dialog open={gettingStartedDialogOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">Getting started</DialogTitle>
          {page == 0 && (
            <div className="p-14 w-full flex flex-col items-center text-center gap-4">
              <div className="text-3xl">Welcome to networkify</div>
              <div className="text-md">
                Networkify is a tool for visualizing your Spotify followers and
                follows.
              </div>
              <Button variant="outline" onClick={() => setPage(1)}>
                Get started
              </Button>
            </div>
          )}
          {page == 1 && (
            <div className="p-5 w-full flex flex-col items-center text-center gap-4">
              <div className="text-xl">
                To use networkify, you need a Spotify token
              </div>
              <div className="text-sm">
                This is due to Spotify API limitations. It expires after a short
                amount of time and we don't store it.
              </div>
              <div className="flex flex-row gap-4">
                <Button disabled variant="outline">
                  Use example data (coming soon)
                </Button>
                <Button onClick={() => setPage(2)}>Show me how</Button>
              </div>
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
