import { Search, LogOut, RefreshCw, Lock } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useChatStore } from "@/store/chatStore";
import { clearSessionPassword } from "@/lib/sessionKeyStore";
import { useState } from "react";

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { search, setSearch, activeContact, setActiveContact } = useChatStore();
  const [refreshing, setRefreshing] = useState(false);

  const contactsQuery = useQuery(api.users.getUsers);

  const isLoading = contactsQuery === undefined;
  const contacts = contactsQuery ?? [];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase()) &&
      contact.clerkId !== user?.id,
  );

  return (
    <aside className="w-full md:w-80 h-full sm:border-r border-border bg-card flex flex-col">
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
            onClick={() => {
              setRefreshing(true);

              setTimeout(() => {
                setRefreshing(false);
              }, 1000);
            }}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />
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
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={contact._id}
              onClick={() => {
                setActiveContact(contact);
              }}
              className={`w-full flex items-center gap-3 p-4 transition cursor-pointer ${
                activeContact?._id === contact._id
                  ? "bg-accent-dim/50"
                  : "hover:bg-muted"
              }`}
            >
              <div className="size-10 rounded-full bg-accent-glow flex items-center justify-center">
                {contact.username[0].toUpperCase()}
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium">{contact.username}</p>
              </div>

              <Lock className="size-3 text-accent" />
            </button>
          ))
        )}
        {!isLoading && filteredContacts.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No users found
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="border-t border-border">
        <button
          onClick={async () => {
            clearSessionPassword();
            await signOut();
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 px-4 py-3 hover:bg-destructive/30 transition duration-200 cursor-pointer"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
