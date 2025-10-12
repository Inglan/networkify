export type Nodes = {
  id: string;
  label: string;
  fill: string;
}[];

export type Edges = {
  source: string;
  target: string;
  id: string;
  label: string;
}[];

export type Users = {
  username: string;
  name: string;
  searchState: "searched" | "searching" | "not_searched" | "error";
  error?: string;
  following: { username: string; name: string; image_url?: string }[];
  followers: { username: string; name: string; image_url?: string }[];
  image_url?: string;
  exclude_from_graph: boolean;
}[];

export type Save = { name: string; date: number; data: { users: Users } };
