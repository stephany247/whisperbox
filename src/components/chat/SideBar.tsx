import { Search, LogOut, RefreshCw, Lock } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useChatStore } from "@/store/chatStore";

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const { search, setSearch, activeContact, setActiveContact } = useChatStore();

  const contacts = useQuery(api.users.getUsers) ?? [];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase()) &&
      contact.clerkId !== user?.id,
  );

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-accent text-black flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>

            <div>
              <p className="font-medium">{user?.username}</p>

              <div className="flex items-center gap-1 text-xs text-accent">
                <Lock className="size-3" />
                E2E Encrypted
              </div>
            </div>
          </div>

          <button
            aria-label="Refresh"
            className="p-2 hover:bg-muted rounded-lg"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="auth-input w-full pl-10"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <button
            key={contact._id}
            onClick={() => {
              setActiveContact(contact);
              console.log("clicked", contact);
            }}
            className={`w-full flex items-center gap-3 p-4 transition ${
              activeContact?._id === contact._id
                ? "bg-accent/10"
                : "hover:bg-muted"
            }`}
          >
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              {contact.username[0].toUpperCase()}
            </div>

            <div className="flex-1 text-left">
              <p className="font-medium">{contact.username}</p>
            </div>

            <Lock className="size-3 text-accent" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-border">
        <button
          onClick={() => signOut()}
          className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 px-4 py-3 hover:bg-destructive/30 transition duration-200 cursor-pointer"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
