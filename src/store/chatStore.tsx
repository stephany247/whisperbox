import { create } from "zustand";

export interface User {
  _id: string;
  clerkId: string;
  username: string;
  publicKey: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;

  ciphertext: string;
  encryptedKey: string;
  iv: string;

  createdAt: number;

  // decrypted client-side only
  text?: string;
}

interface ChatStore {
  contacts: User[];
  activeContact: User | null;
  search: string;

  messages: Message[];

  setContacts: (contacts: User[]) => void;
  setActiveContact: (contact: User | null) => void;
  setSearch: (value: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  contacts: [],
  activeContact: null,
  search: "",
  messages: [],

  setContacts: (contacts) => set({ contacts }),
  setActiveContact: (activeContact) => set({ activeContact }),
  setSearch: (search) => set({ search }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
