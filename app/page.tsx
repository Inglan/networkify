"use client";

import { useEffect, useRef, useState } from "react";
import { GraphCanvasRef } from "reagraph";
import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { PanelBottom, PanelRight } from "lucide-react";
import { Edge, Node, Users } from "@/lib/types";
import * as user from "@/lib/userUtils";
import * as spotify from "@/lib/spotifyClientUtils";
import { Graph } from "../components/graph/Graph";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarContent } from "../components/sidebar/SidebarContent";
import { Onboarding } from "../components/OnboardingDialog";
import { useGraphState, useOnboardingDialogState } from "@/lib/state";
import { toast } from "sonner";

export default function Home() {
  // Mobile device detection hook
  const isMobile = useIsMobile();

  // Data
  const [users, setUsers] = useState<Users>([]);

  // Graph state
  // const [nodes, setNodes] = useState<Node[]>([]);
  // const [edges, setEdges] = useState<Edge[]>([]);
  const { nodes, setNodes, edges, setEdges, graphRef, update } =
    useGraphState();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accordionValues, setAccordionValues] = useState<string[]>([
    "discover",
  ]);
  const [selectedUserId, setSelectedUserId] = useState<string[]>([]);

  const [activeOperations, setActiveOperations] = useState<number>(0);

  const [token, setToken] = useState<string>("");

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
  const updateGraph = () => {
    update(users);
    toast.success("Graph updated");
  };

  // Updates state of user by username
  const updateUserState = (
    username: string,
    newState: Partial<Users[number]>,
  ) => user.updateState(username, newState, setUsers);

  // Creates a new user in users array
  const createUser = (userData: (typeof users)[number]) =>
    user.create(userData, setUsers);

  // Discovers user&apos;s follows
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

  const onboardingOpen = useOnboardingDialogState((state) => state.open);

  return (
    <>
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={!(isMobile && onboardingOpen) && sidebarOpen}
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
              closeAccordionAction={closeAccordion}
              discoverAction={discover}
              edges={edges}
              nodes={nodes}
              openAccordionAction={openAccordion}
              selectedUserId={selectedUserId}
              setAccordionValuesAction={setAccordionValues}
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
      <Graph discoverAction={discover} openAccordionAction={openAccordion} />
      <Onboarding setTokenAction={setToken} />
    </>
  );
}
