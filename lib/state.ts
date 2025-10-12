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
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
}
export const useGraphState = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: [],
      setNodes: (nodes) => set({ nodes }),
      edges: [],
      setEdges: (edges) => set({ edges }),
    }),
    {
      name: "networkify-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface DataState {
  users: User[];
  setUsers: (users: User[]) => void;
}
export const useDataState = create<DataState>()(
  persist(
    (set, get) => ({
      users: [],
      setUsers: (users) => set({ users }),
    }),
    {
      name: "networkify-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface PersistentUIState {
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
  accordionValues: string[];
  setAccordionValues: (accordionValues: string[]) => void;
  openAccordion: (value: string) => void;
  closeAccordion: (value: string) => void;
  selectedUserId: string;
  setSelectedUserId: (selectedUserId: string) => void;
}
export const usePersistentUIState = create<PersistentUIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      accordionValues: ["discover"],
      setAccordionValues: (accordionValues) => set({ accordionValues }),
      openAccordion: (value) => {
        set((prev) => {
          if (prev.accordionValues.includes(value)) {
            return prev;
          } else {
            return { accordionValues: [...prev.accordionValues, value] };
          }
        });
      },
      closeAccordion: (value) => {
        set((prev) => {
          if (prev.accordionValues.includes(value)) {
            return {
              accordionValues: prev.accordionValues.filter((v) => v !== value),
            };
          } else {
            return prev;
          }
        });
      },
      selectedUserId: "",
      setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
    }),
    { name: "networkify-ui", storage: createJSONStorage(() => localStorage) },
  ),
);

interface UIState {
  activeOperations: number;
  setActiveOperations: (activeOperations: number) => void;
  token: string;
  setToken: (token: string) => void;
}
export const useUIState = create<UIState>((set, get) => ({
  activeOperations: 0,
  setActiveOperations: (activeOperations) => set({ activeOperations }),
  token: "",
  setToken: (token) => set({ token }),
}));
