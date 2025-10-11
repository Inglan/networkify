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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import * as tokenUtils from "@/lib/tokenUtils";
import { toast } from "sonner";
export function Onboarding({
  onboardingOpen,
  setOnboardingOpenAction: setOnboardingOpen,
  setTokenAction: setToken,
}: {
  onboardingOpen: boolean;
  setOnboardingOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
  setTokenAction: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [page, setPage] = useState(0);

  return (
    <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Getting started</DialogTitle>
        </DialogHeader>
        <div className="h-96 flex items-center">
          <div className="overflow-auto max-h-96">
            {page == 0 && (
              <div className="p-5 w-full flex flex-col items-center text-center gap-4">
                <div className="text-3xl">Welcome to networkify</div>
                <div className="text-md">
                  networkify is a tool for visualizing your Spotify followers
                  and follows
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setOnboardingOpen(false)}
                  >
                    I know what I&apos;m doing
                  </Button>
                  <Button onClick={() => setPage(1)}>Get started</Button>
                </div>
              </div>
            )}
            {page == 1 && (
              <div className="p-5 w-full flex flex-col items-center text-center gap-4">
                <div className="text-xl">
                  To use networkify, you need a Spotify token
                </div>
                <div className="text-sm">
                  This is due to Spotify API limitations. It expires after a
                  short amount of time and we don&apos;t store it.
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button disabled variant="outline">
                    Use example data (coming soon)
                  </Button>
                  <Button onClick={() => setPage(2)}>Show me how</Button>
                </div>
              </div>
            )}
            {page == 2 && (
              <div className="p-5 w-full flex flex-col gap-4 text-left">
                <div className="text-xl">How to get a Spotify token</div>
                <div>
                  <ol className="list-decimal list-inside">
                    <li>
                      Open Spotify web in a Firefox based browser and log in
                    </li>
                    <li>
                      Open developer tools with <Kbd>Ctrl + Shift + I</Kbd>
                    </li>
                    <li>Go to the network tab</li>
                    <li>Refresh spotify, then wait a few seconds</li>
                    <li>Right click on one of the entries</li>
                    <li>Select Copy Value then Copy All As HAR</li>
                    <li>
                      Paste in here (or in the token field up the top right
                      later on):
                    </li>
                  </ol>
                </div>
                <Textarea
                  onPaste={(e) => {
                    e.preventDefault();
                    try {
                      setToken(tokenUtils.getFromClipboard(e));
                      setPage(3);
                    } catch {
                      toast.error("Invalid data pasted, please try again");
                    }
                  }}
                  placeholder="Paste here"
                />
                <div className="text-sm">
                  Disclaimer: It is generally not recommended to do random stuff
                  in devtools because a random website asked you to. This could
                  allow me to get access to your spotify account if I were
                  collecting tokens on the server. If you don&apos;t trust me
                  (theres no reason you should), then you can audit the code,
                  which is{" "}
                  <Link
                    href="https://github.com/Inglan/networkify"
                    target="_blank"
                    className="underline"
                    rel="noopener noreferrer"
                  >
                    open source
                  </Link>{" "}
                  (GPL-v3), and run it locally, or simply not use this tool.
                  This tool may also be against the terms of service of Spotify,
                  so be careful :)
                </div>
              </div>
            )}
            {page == 3 && (
              <div className="p-5 w-full flex flex-col gap-4 text-left">
                <div className="text-xl">How to use</div>
                <div>
                  Start by pressing add current user, then run on all unsearched
                  nodes. This will discover all your followers and following.
                  You can keep pressing run on all unsearched nodes to discover
                  more users. Be careful, as the amount of users goes up
                  exponentially (assuming you have friends). If there is an
                  issue with a node, it will show as red. If a node has been
                  searched, it will show as green. If a node is currently
                  searching, it will show as blue. If a node hasn&apos;t been
                  searched, it will show as gray. You can click a node, or
                  select a user in search show it in the sidebar. This allows
                  you to do things like view followers, and follows, view
                  profile, center the graph, run discovery on that user, or
                  exclude the user from the graph. Users with more than 100
                  followers or follows will be excluded by default. You can
                  double click a node to run discover, and right click to view
                  spotify profile. You can save and load the current state in
                  the data section of the sidebar.
                </div>
                <Button
                  onClick={() => {
                    setOnboardingOpen(false);
                  }}
                >
                  Got it
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
