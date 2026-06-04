import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    publicKey: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  messages: defineTable({
    senderId: v.string(),
    receiverId: v.string(),

    ciphertext: v.string(),
    senderEncryptedKey: v.string(),
    receiverEncryptedKey: v.string(),
    iv: v.string(),

    createdAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),
});
