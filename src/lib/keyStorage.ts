import { openDB } from "idb";

const DB_NAME = "whisperbox";
const STORE_NAME = "keys";

export type StoredPrivateKey = {
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
};

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function savePrivateKey(userId: string, data: StoredPrivateKey) {
  const db = await dbPromise;

  await db.put(STORE_NAME, data, `privateKey:${userId}`);
}

export async function getPrivateKey(userId: string) {
  const db = await dbPromise;

  return db.get(STORE_NAME, `privateKey:${userId}`);
}

export async function deletePrivateKey(userId: string) {
  const db = await dbPromise;

  await db.delete(STORE_NAME, `privateKey:${userId}`);
}

async function deriveKey(password: string, salt: ArrayBuffer) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

function bufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function encryptPrivateKey(privateKey: string, password: string) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await deriveKey(password, saltBytes.buffer.slice(0));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    new TextEncoder().encode(privateKey),
  );

  return {
    encryptedPrivateKey: bufferToBase64(encrypted),
    salt: bufferToBase64(saltBytes.buffer.slice(0)),
    iv: bufferToBase64(iv.buffer.slice(0)),
  };
}

//decrypt login/msg load
function base64ToBuffer(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return bytes.buffer;
}

export async function decryptPrivateKey(
  stored: StoredPrivateKey,
  password: string,
) {
  const saltBuffer = base64ToBuffer(stored.salt);

  const iv = new Uint8Array(base64ToBuffer(stored.iv));

  const aesKey = await deriveKey(password, saltBuffer);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    base64ToBuffer(stored.encryptedPrivateKey),
  );

  return new TextDecoder().decode(decrypted);
}
