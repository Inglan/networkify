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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [users, setUsers] = useState<
    {
      username: string;
      name: string;
      searchState: "searched" | "searching" | "not_searched" | "error";
      error?: string;
      following: { username: string; name: string; image_url?: string }[];
      followers: { username: string; name: string; image_url?: string }[];
      image_url?: string;
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
    newState: Partial<(typeof users)[number]>,
  ) => {
    setUsers((prev) => {
      const userIndex = prev.findIndex((user) => user.username === username);
      if (userIndex === -1) return prev;
      return [
        ...prev.slice(0, userIndex),
        { ...prev[userIndex], ...newState },
        ...prev.slice(userIndex + 1),
      ];
    });
  };

  const createUser = (userData: (typeof users)[number]) => {
    setUsers((prev) => {
      if (!prev.some((user) => user.username === userData.username)) {
        return [...prev, userData];
      }
      return prev;
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
    if (username.startsWith("spotify:artist")) return;
    setActiveOperations((prev) => prev + 1);
    updateUserState(username, { searchState: "searching" });
    try {
      const { followers, following } = await getFollows(token, username);
      updateUserState(username, {
        searchState: "searched",
        followers,
        following,
      });
      [...followers, ...following]
        .filter((user) => !user.username.startsWith("spotify:artist"))
        .forEach((user) =>
          createUser({
            ...user,
            username: user.username.replace("spotify:user:", ""),
            followers: [],
            following: [],
            searchState: "not_searched",
          }),
        );
    } catch (error) {
      updateUserState(username, { searchState: "error" });
      toast.error("Something went wrong. Maybe aquire another token.");
      console.error("Error occurred while fetching data", error);
    } finally {
      setActiveOperations((prev) => prev - 1);
    }
  }

  function updateGraph() {
    let updatedNodes: typeof nodes = [];
    let updatedEdges: typeof edges = [];
    users.forEach((user) => {
      let fillColor: string;
      switch (user.searchState) {
        case "not_searched":
          fillColor = "gray";
          break;
        case "searching":
          fillColor = "blue";
          break;
        case "searched":
          fillColor = "green";
          break;
        case "error":
          fillColor = "red";
          break;
        default:
          fillColor = "gray";
      }
      updatedNodes.push({
        id: user.username,
        label: user.name,
        fill: fillColor,
      });

      user.followers.forEach((follower) => {
        if (!follower.username.startsWith("spotify:artist")) {
          const followerId = follower.username.replace("spotify:user:", "");
          const userId = user.username.replace("spotify:user:", "");
          const edgeId = `${followerId}-${userId}`;
          if (!updatedEdges.some((edge) => edge.id === edgeId)) {
            updatedEdges.push({
              id: edgeId,
              source: followerId,
              target: userId,
              label: "Following",
            });
          }
        }
      });

      user.following.forEach((following) => {
        if (!following.username.startsWith("spotify:artist")) {
          const userId = user.username.replace("spotify:user:", "");
          const followingId = following.username.replace("spotify:user:", "");
          const edgeId = `${userId}-${followingId}`;
          if (!updatedEdges.some((edge) => edge.id === edgeId)) {
            updatedEdges.push({
              id: edgeId,
              source: userId,
              target: followingId,
              label: "Following",
            });
          }
        }
      });
    });

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    toast.success("Graph updated");
  }

  useEffect(() => {
    if (activeOperations === 0) {
      updateGraph();
    }
  }, [activeOperations, users.length]);

  return (
    <>
      <div
        className={clsx(
          "sidebar fixed top-0 right-0 h-full w-96 z-10 border-l duration-300 bg-card overflow-auto",
          sidebarHidden && "translate-x-96",
        )}
      >
        <div className="flex flex-col gap-4 p-4 sticky top-0 bg-card border-b z-30">
          <div className="w-full flex flex-row items-center">
            <div className="font-bold">networkify</div>
            <div className="grow"></div>
            <Button variant="outline" asChild>
              <Link href="https://github.com/Inglan/networkify" target="_blank">
                Source code
                <ExternalLink />
              </Link>
            </Button>
          </div>
          <Button onClick={updateGraph}>Update graph</Button>
        </div>
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
                    try {
                      const data = await getUser(token);
                      setUsers([
                        {
                          followers: [],
                          following: [],
                          name: data.name,
                          searchState: "not_searched",
                          username: data.username,
                        },
                      ]);
                      discover(data.username);
                      updateGraph();
                    } catch (error) {
                      toast.error(
                        "Something went wrong. Maybe aquire another token.",
                      );
                    }
                  }}
                >
                  Run
                </Button>
                <Button
                  disabled={!token || activeOperations > 0}
                  onClick={async () => {
                    users
                      .filter((user) => user.searchState == "not_searched")
                      .forEach((user) => {
                        user.searchState = "searching";
                        discover(user.username);
                      });
                    updateGraph();
                  }}
                >
                  Run on all unsearched nodes (
                  {
                    users.filter((user) => user.searchState == "not_searched")
                      .length
                  }
                  )
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
                        setUsers(data.users);
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                >
                  Load
                </Button>
                <div>
                  You need to manually update the graph after loading data.
                </div>
                <div>{nodes.length} nodes</div>
                <div>{edges.length} edges</div>
                <div>{users.length} users</div>
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
                            toast.promise(
                              navigator.clipboard.writeText(selectedUserId),
                              {
                                loading: "Copying...",
                                success: "Copied!",
                                error: "Failed to copy",
                              },
                            );
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
                  {users.find((user) => user.username == selectedUserId)
                    ?.searchState == "searched" && (
                    <Accordion
                      type="multiple"
                      className="border rounded-md px-4"
                    >
                      {[
                        {
                          title: "Followers",
                          id: "followers",
                          value: users.find(
                            (user) => user.username == selectedUserId,
                          )?.followers,
                        },
                        {
                          title: "Users Following",
                          id: "usersfollowing",
                          value: users
                            .find((user) => user.username == selectedUserId)
                            ?.following.filter((user) =>
                              user.username.startsWith("spotify:user:"),
                            ),
                        },
                        {
                          title: "Artists Following",
                          id: "artistsfollowing",
                          value: users
                            .find((user) => user.username == selectedUserId)
                            ?.following.filter((user) =>
                              user.username.startsWith("spotify:artist:"),
                            ),
                        },
                      ].map(({ title, id, value }) => {
                        return (
                          <AccordionItem value={id} key={id}>
                            <AccordionTrigger>{title}</AccordionTrigger>
                            <AccordionContent>
                              <div className="flex flex-col gap-2">
                                {value?.map((follower) => (
                                  <div
                                    key={follower.username}
                                    className="flex items-center gap-2"
                                  >
                                    <Avatar>
                                      <AvatarFallback>
                                        {follower.name[0]}
                                      </AvatarFallback>
                                      <AvatarImage src={follower.image_url} />
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">
                                        {follower.name}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
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
          node: {
            ...darkTheme.node,
            inactiveOpacity: 1,
            label: {
              ...darkTheme.node.label,
              strokeWidth: 0,
              stroke: "#171717",
            },
          },
          canvas: { ...darkTheme.canvas, background: "#171717" },
          edge: { ...darkTheme.edge, fill: "#ffffff" },
          arrow: { ...darkTheme.arrow, fill: "#ffffff" },
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
