import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    receiverId: v.string(),

    ciphertext: v.string(),
    senderEncryptedKey: v.string(),
    receiverEncryptedKey: v.string(),

    iv: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.receiverId,

      ciphertext: args.ciphertext,
      senderEncryptedKey: args.senderEncryptedKey,
      receiverEncryptedKey: args.receiverEncryptedKey,
      iv: args.iv,

      createdAt: Date.now(),
    });
  },
});

export const getConversation = query({
  args: {
    userA: v.string(),
    userB: v.string(),
  },

  handler: async (ctx, args) => {
    const messages = await ctx.db.query("messages").collect();

    return messages
      .filter(
        (message) =>
          (message.senderId === args.userA &&
            message.receiverId === args.userB) ||
          (message.senderId === args.userB &&
            message.receiverId === args.userA),
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});
