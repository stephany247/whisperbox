import { create } from "zustand";

interface User {
  _id: string;
  username: string;
}

interface ChatStore {
  contacts: User[];
  activeContact: User | null;
  search: string;

  setContacts: (contacts: User[]) => void;
  setActiveContact: (contact: User) => void;
  setSearch: (value: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  contacts: [],
  activeContact: null,
  search: "",

  setContacts: (contacts) => set({ contacts }),
  setActiveContact: (activeContact) => set({ activeContact }),
  setSearch: (search) => set({ search }),
}));
