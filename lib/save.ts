import { create } from "zustand";
import { User } from "./types";

interface SaveState {
  save: {
    data: { users: User[] };
    name: string;
    timestamp: number;
    id: string;
  }[];
  create: (data: { users: User[] }, name: string) => void;
  delete: (id: string) => void;
}

const useSave = create<SaveState>((set) => ({
  save: [],
  create: (data, name) => {
    const id = crypto.randomUUID();
    set((state) => {
      return {
        save: [...state.save, { data, name, timestamp: Date.now(), id }],
      };
    });
  },
  delete: (id) => {
    set((state) => {
      return {
        save: state.save.filter((item) => item.id !== id),
      };
    });
  },
}));
