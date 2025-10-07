"use client";

import { useEffect, useRef, useState } from "react";
import { darkTheme, GraphCanvas, GraphCanvasRef } from "reagraph";
import { getFollows, getUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { Code, ExternalLink, Sidebar, User } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [users, setUsers] = useState<
    {
      username: string;
      name: string;
      searchState: "searched" | "searching" | "not_searched" | "error";
      error?: string;
      following: { username: string; name: string }[];
      followers: { username: string; name: string }[];
    }[]
  >([]);

  const [nodes, setNodes] = useState<
    { id: string; label: string; fill: string }[]
  >([]);
  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);
  const [activeOperations, setActiveOperations] = useState<number>(0);

  const [token, setToken] = useState<string>("");
  const [auto, setAuto] = useState<CheckedState>(false);

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [accordionValues, setAccordionValues] = useState<string[]>([
    "discover",
  ]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

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

  useHotkeys("mod+f", () => openAccordion("search"), {
    preventDefault: true,
  });
  useHotkeys("mod+b", () => setSidebarHidden(!sidebarHidden), {
    preventDefault: true,
  });

  const updateUserState = (
    username: string,
    searchState: (typeof users)[number]["searchState"],
  ) => {
    setUsers((prev) => {
      const userIndex = prev.findIndex((user) => user.username === username);
      if (userIndex === -1) return prev;
      return [
        ...prev.slice(0, userIndex),
        { ...prev[userIndex], searchState },
        ...prev.slice(userIndex + 1),
      ];
    });
  };

  const updateNodeColor = (nodeId: string, color: string) => {
    setNodes((currentNodes) => {
      const nodeIndex = currentNodes.findIndex((node) => node.id === nodeId);
      if (nodeIndex === -1) return currentNodes;
      return [
        ...currentNodes.slice(0, nodeIndex),
        { ...currentNodes[nodeIndex], fill: color },
        ...currentNodes.slice(nodeIndex + 1),
      ];
    });
  };

  async function discover(username: string) {
    if (!token) return;
    setActiveOperations((prev) => prev + 1);
    updateNodeColor(username, "blue");
    try {
      const { followers, following } = await getFollows(token, username);
      if (!(followers.length > 100 || following.length > 100)) {
        followers.forEach((follower) => {
          setNodes((currentNodes) => {
            if (!currentNodes.some((node) => node.id === follower.username)) {
              if (auto) discover(follower.username);
              return [
                ...currentNodes,
                {
                  id: follower.username,
                  label: follower.name,
                  fill: "grey",
                },
              ];
            } else {
              console.log(`Node ${follower.username} already exists`);
            }
            return currentNodes;
          });
          setEdges((currentEdges) => {
            if (
              !currentEdges.some(
                (edge) => edge.id === `${follower.username}-${username}`,
              )
            ) {
              return [
                ...currentEdges,
                {
                  source: follower.username,
                  target: username,
                  id: `${follower.username}-${username}`,
                  label: "Follower",
                },
              ];
            } else {
              console.log(
                `Edge ${follower.username}-${username} already exists`,
              );
            }
            return currentEdges;
          });
        });
        following.forEach((user) => {
          setNodes((currentNodes) => {
            if (!currentNodes.some((node) => node.id === user.username)) {
              if (auto) discover(user.username);
              return [
                ...currentNodes,
                {
                  id: user.username,
                  label: user.name,
                  fill: "grey",
                },
              ];
            } else {
              console.log(`Node ${user.username} already exists`);
            }
            return currentNodes;
          });
          setEdges((currentEdges) => {
            if (
              !currentEdges.some(
                (edge) => edge.id === `${username}-${user.username}`,
              )
            ) {
              return [
                ...currentEdges,
                {
                  source: username,
                  target: user.username,
                  id: `${username}-${user.username}`,
                  label: "Following",
                },
              ];
            } else {
              console.log(`Edge ${username}-${user.username} already exists`);
            }
            return currentEdges;
          });
        });

        updateNodeColor(username, "green");
      } else {
        updateNodeColor(username, "red");
        console.log(
          username + " has more than 100 followers or following, skipping",
        );
      }
    } catch (error) {
      updateNodeColor(username, "red");
      console.error("Error occurred while fetching data", error);
    } finally {
      setActiveOperations((prev) => prev - 1);
    }
  }

  return (
    <>
      <div
        className={clsx(
          "sidebar fixed top-0 right-0 h-full w-96 z-10 border-l duration-300 bg-card overflow-auto",
          sidebarHidden && "translate-x-96",
        )}
      >
        <div className="w-full p-2 px-4 flex flex-row items-center">
          <div className="font-bold">networkify</div>
          <div className="grow"></div>
          <Button variant="ghost" asChild>
            <Link href="https://github.com/Inglan/networkify" target="_blank">
              Source code
              <ExternalLink />
            </Link>
          </Button>
        </div>
        <Separator />
        <Accordion
          type="multiple"
          value={accordionValues}
          onValueChange={setAccordionValues}
        >
          <AccordionItem value="discover">
            <AccordionTrigger className="px-4">Discover</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className=" flex flex-col gap-2">
                <Input
                  placeholder="Token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const data = e.clipboardData.getData("text");
                    try {
                      const parsedData = JSON.parse(data);
                      setToken(
                        JSON.parse(
                          parsedData.log.entries.filter((entry: any) =>
                            entry.request.url.includes(
                              "https://open.spotify.com/api/token",
                            ),
                          )[0].response.content.text,
                        ).accessToken,
                      );
                    } catch {
                      setToken(data);
                    }
                  }}
                />

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="auto"
                    checked={auto}
                    onCheckedChange={(value) => setAuto(value)}
                  />
                  <Label htmlFor="auto">Auto discover</Label>
                </div>
                <br />
                <Button
                  disabled={!token}
                  onClick={async () => {
                    const data = await getUser(token);
                    setNodes([
                      {
                        id: data.username,
                        label: data.name,
                        fill: "grey",
                      },
                    ]);
                    discover(data.username);
                  }}
                >
                  Run
                </Button>
                <Button
                  disabled={!token}
                  onClick={async () => {
                    nodes
                      .filter((node) => node.fill == "grey")
                      .forEach((node) => {
                        discover(node.id);
                      });
                  }}
                >
                  Run on all nodes
                </Button>
                <div>{activeOperations} active searches</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="Data">
            <AccordionTrigger className="px-4">Data</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className=" flex flex-col gap-2">
                <Button
                  onClick={() => {
                    const data = {
                      nodes: nodes,
                      edges: edges,
                    };

                    const blob = new Blob([JSON.stringify(data)], {
                      type: "text/plain;charset=utf-8",
                    });

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "graph_data.json";
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = async (event) => {
                      const file = (event.target as HTMLInputElement)
                        .files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const data = JSON.parse(event.target?.result as string);
                        setNodes(data.nodes);
                        setEdges(data.edges);
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                >
                  Load
                </Button>
                <div>{nodes.length} nodes</div>
                <div>{edges.length} edges</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="search">
            <AccordionTrigger className="px-4">
              Search
              <Kbd>⌘ + F</Kbd>
              <div className="grow"></div>
            </AccordionTrigger>
            <AccordionContent>
              <Command>
                <CommandInput autoFocus placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {nodes.map((node) => (
                      <CommandItem
                        className={
                          selectedUserId === node.id
                            ? "!bg-primary !text-primary-foreground"
                            : ""
                        }
                        onSelect={() => {
                          graphRef.current?.centerGraph([node.id]);
                          setSelectedUserId(node.id);
                          openAccordion("info");
                        }}
                        key={node.id}
                      >
                        {node.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="info">
            <AccordionTrigger className="px-4">User info</AccordionTrigger>
            <AccordionContent className="p-4">
              {selectedUserId ? (
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-bold">
                    {
                      nodes.filter((node) => node.id === selectedUserId)[0]
                        ?.label
                    }
                  </h2>
                  <span className="text-foreground/75">{selectedUserId}</span>
                  <Command>
                    <CommandInput autoFocus placeholder="Actions" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            window.open(
                              "https://open.spotify.com/user/" + selectedUserId,
                            );
                          }}
                        >
                          View on Spotify
                        </CommandItem>
                        <CommandItem
                          onSelect={() => {
                            graphRef.current?.centerGraph([selectedUserId]);
                          }}
                        >
                          Center Graph
                        </CommandItem>
                        <CommandItem
                          onSelect={() => {
                            navigator.clipboard.writeText(selectedUserId);
                          }}
                        >
                          Copy User ID
                        </CommandItem>
                        <CommandItem
                          onSelect={() => {
                            discover(selectedUserId);
                          }}
                        >
                          Discover
                        </CommandItem>
                        <CommandItem
                          onSelect={() => {
                            setSelectedUserId("");
                          }}
                        >
                          Deselect
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <User />
                    </EmptyMedia>
                  </EmptyHeader>
                  <EmptyTitle>No user selected</EmptyTitle>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      onClick={() => {
                        openAccordion("search");
                        closeAccordion("info");
                      }}
                    >
                      <Kbd>⌘ + F</Kbd>
                      Search
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
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
      <GraphCanvas
        ref={graphRef}
        selections={[selectedUserId]}
        labelType="nodes"
        draggable={true}
        nodes={nodes}
        edges={edges}
        theme={{
          ...darkTheme,
          node: { ...darkTheme.node, inactiveOpacity: 1 },
        }}
        onCanvasClick={() => setSelectedUserId("")}
        onNodeContextMenu={(node) =>
          window.open("https://open.spotify.com/user/" + node.id)
        }
        onNodeClick={(node) => {
          setSelectedUserId(node.id);
          openAccordion("info");
        }}
        onNodeDoubleClick={(node) => discover(node.id)}
      />
    </>
  );
}
