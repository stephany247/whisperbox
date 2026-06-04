import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { Lock, Send, AlertTriangle } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import { useChatStore } from "@/store/chatStore";

import {
  encryptMessage,
  decryptMessage,
  importPublicKey,
  importPrivateKey,
} from "@/lib/crypto";
import { getPrivateKey } from "@/lib/keyStorage";

console.count("ChatWindow Render");

export default function ChatWindow() {
  const { user } = useUser();
  const { activeContact } = useChatStore();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const messagesQuery = useQuery(
    api.messages.getConversation,
    activeContact && user?.id
      ? {
          userA: user.id,
          userB: activeContact.clerkId,
        }
      : "skip",
  );

  const messages = messagesQuery ?? [];

  //auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [decryptedMessages]);

  //decrypt messages
  useEffect(() => {
    async function loadMessages() {
      if (!user?.id) return;

      const storedPrivateKey = await getPrivateKey(user.id);

      if (!storedPrivateKey) {
        setError(
          "Private key not found on this device. Messages cannot be decrypted.",
        );
        return;
      }

      const privateKey = await importPrivateKey(storedPrivateKey);

      
      if (!messages.length) {
        setDecryptedMessages([]);
        return;
      }
      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          try {
            const encryptedKey =
              msg.senderId === user?.id
                ? msg.senderEncryptedKey
                : msg.receiverEncryptedKey;
            const text = await decryptMessage(
              {
                ciphertext: msg.ciphertext,
                encryptedKey,
                iv: msg.iv,
              },
              privateKey,
            );

            console.log("Decrypted:", text);

            return {
              ...msg,
              text,
            };
          } catch (err) {
            console.error("Decrypt failed:", err);

            return {
              ...msg,
              text: "[Unable to decrypt]",
            };
          }
        }),
      );
      console.log("decrypted");
      setDecryptedMessages(decrypted);
    }

    loadMessages();
  }, [messagesQuery, user?.id]);

  // console.log("messages", messages.length);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !activeContact || !user) {
      return;
    }

    try {
      setError("");
      if (!currentUser) return null;
      const senderPublicKey = await importPublicKey(currentUser.publicKey);
      console.log("sender public key");
      const recipientPublicKey = await importPublicKey(activeContact.publicKey);
      console.log("receiver public key");

      const encrypted = await encryptMessage(
        message,
        recipientPublicKey,
        senderPublicKey,
      );
      console.log("msg encrypted");

      await sendMessageMutation({
        senderId: user.id,
        receiverId: activeContact.clerkId,
        ciphertext: encrypted.ciphertext,
        senderEncryptedKey: encrypted.senderEncryptedKey,
        receiverEncryptedKey: encrypted.receiverEncryptedKey,
        iv: encrypted.iv,
      });
      console.log("msg sent");

      setMessage("");
    } catch (err) {
      console.error(err);

      setError("Failed to send message");
    }
  };

  if (!activeContact) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Lock className="mx-auto mb-4 size-16 text-accent/40" />

          <h2 className="text-xl font-semibold">Select a conversation</h2>

          <p className="mt-2 text-muted-foreground">
            Choose a user from the sidebar to start an encrypted chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* HEADER */}

      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            {activeContact.username[0].toUpperCase()}
          </div>

          <div>
            <h3 className="font-medium">{activeContact.username}</h3>

            <div className="flex items-center gap-1 text-xs text-accent">
              <Lock className="size-3" />
              End-to-end encrypted
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-center">
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm">
            Messages are encrypted end-to-end. Only you and{" "}
            {activeContact.username} can read them.
          </div>
        </div>

        <div className="space-y-4">
          {decryptedMessages.map((msg) => {
            const mine = msg.senderId === user?.id;

            return (
              <div
                key={msg._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "bg-accent text-black"
                      : "border border-border bg-card"
                  }`}
                >
                  <p>{msg.text}</p>

                  <p className="mt-1 text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}

      <div className="border-t border-border p-4">
        {error && (
          <div className="mb-3 flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="size-4" />
            {error}
          </div>
        )}

        <form className="flex gap-3" onSubmit={handleSend}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${activeContact.username}...`}
            className="auth-input flex-1"
          />

          <button
            aria-label="Send message"
            type="submit"
            className="flex size-12 items-center justify-center rounded-xl bg-accent text-black"
          >
            <Send className="size-6" />
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3" />
          Encrypted with AES-256-GCM · Keys never leave your device
        </div>
      </div>
    </div>
  );
}
