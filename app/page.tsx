"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { darkTheme, GraphCanvas, GraphCanvasRef } from "reagraph";
import { getUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useHotkeys } from "react-hotkeys-hook";
import clsx from "clsx";
import { ExternalLink, SearchX, Sidebar, User } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edges, Nodes, Users } from "@/lib/types";
import * as graph from "@/lib/graphUtils";
import * as user from "@/lib/userUtils";
import * as spotify from "@/lib/spotifyClientUtils";

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [users, setUsers] = useState<Users>([]);

  const [nodes, setNodes] = useState<Nodes>([]);
  const [edges, setEdges] = useState<Edges>([]);
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

  const updateGraph = () =>
    graph.update(nodes, setNodes, edges, setEdges, users);

  const updateUserState = (
    username: string,
    newState: Partial<Users[number]>,
  ) => user.updateState(username, newState, setUsers);

  const createUser = (userData: (typeof users)[number]) =>
    user.create(userData, setUsers);

  useHotkeys("mod+f", () => openAccordion("search"), {
    preventDefault: true,
  });
  useHotkeys("mod+b", () => setSidebarHidden(!sidebarHidden), {
    preventDefault: true,
  });

  const discover = (username: string) =>
    spotify.discover(
      username,
      token,
      setActiveOperations,
      updateUserState,
      createUser,
    );

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
        <Header updateGraph={updateGraph} />
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
                discover={discover}
                setAuto={setAuto}
                setToken={setToken}
                setUsers={setUsers}
                token={token}
                updateGraph={updateGraph}
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
                setUsers={setUsers}
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
                openAccordion={openAccordion}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                users={users}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="info">
            <AccordionTrigger className="px-4">User info</AccordionTrigger>
            <AccordionContent className="p-4">
              <UserInfo
                closeAccordion={closeAccordion}
                discover={discover}
                graphRef={graphRef}
                nodes={nodes}
                openAccordion={openAccordion}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                setUsers={setUsers}
                updateUserState={updateUserState}
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
        discover={discover}
        edges={edges}
        graphRef={graphRef}
        nodes={nodes}
        openAccordion={openAccordion}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
      />
    </>
  );
}

function Graph({
  graphRef,
  selectedUserId,
  nodes,
  edges,
  setSelectedUserId,
  openAccordion,
  discover,
}: {
  graphRef: RefObject<GraphCanvasRef | null>;
  selectedUserId: string;
  nodes: Nodes;
  edges: Edges;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
  openAccordion: (id: string) => void;
  discover: (id: string) => void;
}) {
  return (
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
  );
}

function Header({ updateGraph }: { updateGraph: () => void }) {
  return (
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
  );
}

function Discover({
  setToken,
  token,
  setAuto,
  auto,
  setUsers,
  updateGraph,
  users,
  activeOperations,
  discover,
}: {
  setToken: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setAuto: React.Dispatch<React.SetStateAction<CheckedState>>;
  auto: CheckedState;
  setUsers: React.Dispatch<React.SetStateAction<Users>>;
  updateGraph: () => void;
  users: Users;
  activeOperations: number;
  discover: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
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
                parsedData.log.entries.filter(
                  (entry: { request: { url: string } }) =>
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
                exclude_from_graph: false,
              },
            ]);
            updateGraph();
          } catch {
            toast.error("Something went wrong. Maybe aquire another token.");
          }
        }}
      >
        Add user node
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) =>
                user.searchState == "not_searched" && !user.exclude_from_graph,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Run on all unsearched nodes (
        {
          users.filter(
            (user) =>
              user.searchState == "not_searched" && !user.exclude_from_graph,
          ).length
        }
        )
      </Button>
      <Button
        disabled={!token || activeOperations > 0}
        onClick={async () => {
          users
            .filter(
              (user) => user.searchState == "error" && !user.exclude_from_graph,
            )
            .forEach((user) => {
              user.searchState = "searching";
              discover(user.username);
            });
          updateGraph();
        }}
      >
        Rerun on all errored nodes (
        {
          users.filter(
            (user) => user.searchState == "error" && !user.exclude_from_graph,
          ).length
        }
        )
      </Button>
      <div>{activeOperations} active searches</div>
    </div>
  );
}

function Data({
  setUsers,
  users,
  nodes,
  edges,
}: {
  setUsers: (users: Users) => void;
  users: Users;
  nodes: Nodes;
  edges: Edges;
}) {
  return (
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
          link.download = `networkify-${new Date().toISOString()}.json`;
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
            const file = (event.target as HTMLInputElement).files?.[0];
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
      <div>You need to manually update the graph after loading data.</div>
      <div>{nodes.length} nodes</div>
      <div>{edges.length} edges</div>
      <div>{users.length} users</div>
    </div>
  );
}

function Search({
  users,
  nodes,
  selectedUserId,
  setSelectedUserId,
  openAccordion,
  graphRef,
}: {
  users: Users;
  nodes: Nodes;
  selectedUserId: string;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
  openAccordion: (id: string) => void;
  graphRef: RefObject<GraphCanvasRef | null>;
}) {
  return (
    <Command>
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

function UserInfo({
  selectedUserId,
  users,
  nodes,
  graphRef,
  discover,
  setUsers,
  setSelectedUserId,
  openAccordion,
  closeAccordion,
  updateUserState,
}: {
  selectedUserId: string;
  users: Users;
  nodes: Nodes;
  graphRef: RefObject<GraphCanvasRef | null>;
  discover: (username: string) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<Users>>;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
  openAccordion: (id: string) => void;
  closeAccordion: (id: string) => void;
  updateUserState: (username: string, newState: Partial<Users[number]>) => void;
}) {
  return (
    <>
      {selectedUserId ? (
        <div className="flex flex-col gap-2">
          <div className="border rounded-md p-4">
            <h2 className="text-lg font-bold">
              {users.find((user) => user.username == selectedUserId)?.name}
            </h2>
            <span className="text-foreground/75">{selectedUserId}</span>
            <br />
            <span className="text-foreground/75">
              {users.find((user) => user.username === selectedUserId)
                ?.exclude_from_graph
                ? "Excluded from graph"
                : "Included in graph"}
            </span>
            <br />
            <span className="text-foreground/75">
              {
                users.find((user) => user.username === selectedUserId)
                  ?.searchState
              }
              {users.find((user) => user.username === selectedUserId)
                ?.searchState == "error" &&
                " - " +
                  users.find((user) => user.username === selectedUserId)?.error}
            </span>
          </div>
          <Command className="border">
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
                    if (nodes.some((node) => node.id === selectedUserId)) {
                      graphRef.current?.centerGraph([selectedUserId]);
                    }
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
                    setUsers(
                      users.filter((user) => user.username == selectedUserId),
                    );
                  }}
                >
                  Isolate
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setSelectedUserId("");
                  }}
                >
                  Deselect
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    const user = users.find(
                      (user) => user.username == selectedUserId,
                    );
                    updateUserState(selectedUserId, {
                      exclude_from_graph: !user?.exclude_from_graph,
                    });
                  }}
                >
                  {users.find((user) => user.username === selectedUserId)
                    ?.exclude_from_graph
                    ? "Include"
                    : "Exclude"}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          {users.find((user) => user.username == selectedUserId)?.searchState ==
          "searched" ? (
            <Accordion type="multiple" className="border rounded-md px-4">
              {[
                {
                  title: "Followers",
                  id: "followers",
                  value: users.find((user) => user.username == selectedUserId)
                    ?.followers,
                  onclick: (username: string) => {
                    setSelectedUserId(username.replace("spotify:user:", ""));
                  },
                },
                {
                  title: "Users Following",
                  id: "usersfollowing",
                  value: users
                    .find((user) => user.username == selectedUserId)
                    ?.following.filter((user) =>
                      user.username.startsWith("spotify:user:"),
                    ),
                  onclick: (username: string) => {
                    setSelectedUserId(username.replace("spotify:user:", ""));
                  },
                },
                {
                  title: "Artists Following",
                  id: "artistsfollowing",
                  value: users
                    .find((user) => user.username == selectedUserId)
                    ?.following.filter((user) =>
                      user.username.startsWith("spotify:artist:"),
                    ),
                  onclick: (username: string) => {
                    window.open(
                      "https://open.spotify.com/artist/" +
                        username.replace("spotify:artist:", ""),
                    );
                  },
                },
              ].map(({ title, id, value, onclick }) => {
                return (
                  <AccordionItem value={id} key={id}>
                    <AccordionTrigger>
                      {title} ({value?.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2">
                        {value?.map((user) => (
                          <div
                            onClick={() => {
                              onclick(user?.username || "");
                            }}
                            key={user?.username || ""}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Avatar>
                              <AvatarFallback>
                                {user.name ? user?.name[0] : ""}
                              </AvatarFallback>
                              <AvatarImage src={user?.image_url || ""} />
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {user?.name || ""}
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
          ) : (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyTitle>Follows not discovered yet</EmptyTitle>
              <EmptyContent>
                <Button onClick={() => discover(selectedUserId)}>
                  Discover
                </Button>
              </EmptyContent>
            </Empty>
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
    </>
  );
}
