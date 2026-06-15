import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { Lock, Send, AlertTriangle, ArrowLeft } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import { useChatStore } from "@/store/chatStore";

import {
  encryptMessage,
  decryptMessage,
  importPublicKey,
  importPrivateKey,
} from "@/lib/crypto";
import { decryptPrivateKey, getPrivateKey } from "@/lib/keyStorage";
import { getSessionPassword } from "@/lib/sessionKeyStore";

export default function ChatWindow() {
  const { user } = useUser();
  const { activeContact, setActiveContact } = useChatStore();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

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

  const messagesLoading = messagesQuery === undefined;
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
      setIsDecrypting(!hasLoadedOnce);

      try {
        const storedPrivateKey = await getPrivateKey(user.id);
        const password = getSessionPassword();

        if (!password) {
          // setError("Session expired. Please sign in again.");
          return;
        }

        if (!storedPrivateKey) {
          setError(
            "Private key not found on this device. Messages cannot be decrypted.",
          );
          return;
        }

        const privateKeyPem = await decryptPrivateKey(
          storedPrivateKey,
          password,
        );
        const privateKey = await importPrivateKey(privateKeyPem);

        if (!messages.length) {
          setDecryptedMessages([]);
          setHasLoadedOnce(true);
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

              return {
                ...msg,
                text,
              };
            } catch (err) {
              console.error("Decrypt failed:", err);

              return {
                ...msg,
                text: `🔒 Unable to decrypt message\nThis device does not have the required private key.`,
              };
            }
          }),
        );
        setDecryptedMessages(decrypted);
        setHasLoadedOnce(true);
      } finally {
        setIsDecrypting(false);
      }
    }

    loadMessages();
  }, [messages, user?.id]);

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || !activeContact || !user) {
      return;
    }
    setIsSending(true);

    try {
      setError("");
      if (!currentUser) return null;
      const senderPublicKey = await importPublicKey(currentUser.publicKey);
      const recipientPublicKey = await importPublicKey(activeContact.publicKey);

      const encrypted = await encryptMessage(
        message,
        recipientPublicKey,
        senderPublicKey,
      );

      await sendMessageMutation({
        senderId: user.id,
        receiverId: activeContact.clerkId,
        ciphertext: encrypted.ciphertext,
        senderEncryptedKey: encrypted.senderEncryptedKey,
        receiverEncryptedKey: encrypted.receiverEncryptedKey,
        iv: encrypted.iv,
      });

      setMessage("");
    } catch (err) {
      console.error(err);

      setError("Failed to send message");
    } finally {
      setIsSending(false);
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
    <div className="flex h-dvh flex-1 flex-col">
      {/* HEADER */}

      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to contacts"
            onClick={() => setActiveContact(null)}
            className="md:hidden flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-6" />
          </button>
          <div className="flex size-10 items-center justify-center rounded-full bg-accent-glow">
            {activeContact.username[0].toUpperCase()}
          </div>

          <div>
            <h3 className="font-medium">{activeContact.username}</h3>

            <div className="flex items-center gap-1 text-xs text-accent">
              <Lock className="size-3" />
              End-to-End encrypted
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4 flex justify-center">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center text-sm">
            Messages are encrypted End-to-End. Only you and{" "}
            {activeContact.username} can read them.
          </div>
        </div>

        {messagesLoading || isDecrypting ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`h-12 ${
                    i % 2 === 0 ? "w-40" : "w-56"
                  } animate-pulse rounded-2xl bg-muted`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Lock className="size-7 text-accent" />
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                End-to-End Encrypted
              </h3>

              <p className="text-sm text-muted-foreground">
                Start your conversation with{" "}
                <span className="font-medium">{activeContact.username}</span>.
                Messages are encrypted before leaving your device.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {decryptedMessages.map((msg) => {
              const mine = msg.senderId === user?.id;

              return (
                <div
                  key={msg._id}
                  className={`flex animate-in fade-in duration-300 ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:px-4 sm:py-3 ${
                      mine
                        ? "bg-accent text-black"
                        : "border border-border bg-card"
                    }`}
                  >
                    <p>{msg.text}</p>

                    <p className="mt-1 text-xs opacity-70 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
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
            className="auth-input flex-1 min-h-12"
          />

          <button
            aria-label="Send message"
            type="submit"
            disabled={!message.trim() || isSending}
            className="flex size-12 items-center justify-center rounded-xl bg-accent text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <div className="size-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <Send className="size-6" />
            )}
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
