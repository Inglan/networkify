"use client";

import { useEffect, useRef, useState } from "react";
import { GraphCanvas, GraphCanvasRef } from "reagraph";
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

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);
  const [edges, setEdges] = useState<
    { source: string; target: string; id: string; label: string }[]
  >([]);
  const [activeOperations, setActiveOperations] = useState<number>(0);

  const [token, setToken] = useState<string>("");
  const [auto, setAuto] = useState<CheckedState>(false);

  const [searchOpen, setSearchOpen] = useState(false);

  useHotkeys(["ctrl+k", "meta+k"], () => setSearchOpen(true), {
    preventDefault: true,
  });

  async function addUserFollowsToGraph(username: string) {
    setActiveOperations((prev) => prev + 1);
    try {
      const { followers, following } = await getFollows(token, username);
      if (!(followers.length > 100 || following.length > 100)) {
        followers.forEach((follower) => {
          setNodes((currentNodes) => {
            if (!currentNodes.some((node) => node.id === follower.username)) {
              if (auto) addUserFollowsToGraph(follower.username);
              return [
                ...currentNodes,
                {
                  id: follower.username,
                  label: follower.name,
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
              if (auto) addUserFollowsToGraph(user.username);
              return [
                ...currentNodes,
                {
                  id: user.username,
                  label: user.name,
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
      } else {
        console.log(
          username + " has more than 100 followers or following, skipping",
        );
      }
    } catch (error) {
      console.error("Error occurred while fetching data", error);
    } finally {
      setActiveOperations((prev) => prev - 1);
    }
  }

  return (
    <>
      <div className="top-2 left-2 p-4 bg-card border fixed z-30 rounded-md flex flex-col gap-2">
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
              },
            ]);
            addUserFollowsToGraph(data.username);
          }}
        >
          Run
        </Button>
        <Button
          disabled={!token}
          onClick={async () => {
            nodes.forEach((node) => {
              addUserFollowsToGraph(node.id);
            });
          }}
        >
          Run on all nodes
        </Button>
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
              const file = (event.target as HTMLInputElement).files?.[0];
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
        <div>{activeOperations} active searches</div>
      </div>
      <div className="sidebar fixed top-0 right-0 h-full w-96 z-10 border-l">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {nodes.map((node) => (
                <CommandItem
                  onSelect={() => {
                    graphRef.current?.centerGraph([node.id]);
                    setSearchOpen(false);
                  }}
                  key={node.id}
                >
                  {node.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <GraphCanvas
        ref={graphRef}
        labelType="nodes"
        draggable={true}
        nodes={nodes}
        edges={edges}
        onNodeContextMenu={(node) =>
          window.open("https://open.spotify.com/user/" + node.id)
        }
        onNodeDoubleClick={(node) => addUserFollowsToGraph(node.id)}
      />
    </>
  );
}
