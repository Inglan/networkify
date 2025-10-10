"use client";

import { RefObject } from "react";
import { GraphCanvasRef } from "reagraph";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SearchX, User } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Nodes, Users } from "@/lib/types";

export function UserInfo({
  selectedUserId,
  users,
  nodes,
  graphRef,
  discoverAction: discover,
  setUsersAction: setUsers,
  setSelectedUserIdAction: setSelectedUserId,
  openAccordionAction: openAccordion,
  closeAccordionAction: closeAccordion,
  updateUserStateAction: updateUserState,
}: {
  selectedUserId: string;
  users: Users;
  nodes: Nodes;
  graphRef: RefObject<GraphCanvasRef | null>;
  discoverAction: (username: string) => Promise<void>;
  setUsersAction: React.Dispatch<React.SetStateAction<Users>>;
  setSelectedUserIdAction: React.Dispatch<React.SetStateAction<string>>;
  openAccordionAction: (id: string) => void;
  closeAccordionAction: (id: string) => void;
  updateUserStateAction: (
    username: string,
    newState: Partial<Users[number]>,
  ) => void;
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
