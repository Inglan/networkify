import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Edge, Node, User } from "./types";

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

export const useSave = create<SaveState>()(
  persist(
    (set, get) => ({
      save: [],
      create: (data, name) => {
        const id = crypto.randomUUID();
        set((state) => {
          return {
            save: [{ data, name, timestamp: Date.now(), id }, ...state.save],
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
    }),
    {
      name: "networkify-save",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface OnboardingDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useOnboardingDialogState = create<OnboardingDialogState>()(
  persist(
    (set, get) => ({
      open: true,
      setOpen: (open) => set({ open }),
    }),
    {
      name: "networkify-onboaring",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface GraphState {
  nodes: Node[];
  edges: Edge[];
}
export const useGraphState = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
    }),
    {
      name: "networkify-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface DataState {
  users: User[];
}
export const useDataState = create<DataState>()(
  persist(
    (set, get) => ({
      users: [],
    }),
    {
      name: "networkify-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface PersistentUIState {
  sidebarOpen: boolean;
  accordionValues: string[];
  selectedUserId: string;
}
export const usePersistentUIState = create<PersistentUIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      accordionValues: ["discover"],
      selectedUserId: "",
    }),
    { name: "networkify-ui", storage: createJSONStorage(() => localStorage) },
  ),
);

interface UIState {
  activeOperations: number;
  token: string;
}
export const useUIState = create<UIState>((set, get) => ({
  activeOperations: 0,
  token: "",
}));
