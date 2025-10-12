export type Node = {
  id: string;
  label: string;
  fill: string;
}[];
export type Nodes = Node[];

export type Edge = {
  source: string;
  target: string;
  id: string;
  label: string;
}[];
export type Edges = Edge[];

export type User = {
  username: string;
  name: string;
  searchState: "searched" | "searching" | "not_searched" | "error";
  error?: string;
  following: { username: string; name: string; image_url?: string }[];
  followers: { username: string; name: string; image_url?: string }[];
  image_url?: string;
  exclude_from_graph: boolean;
};
export type Users = User[];

export type Save = { name: string; date: number; data: { users: Users } };
