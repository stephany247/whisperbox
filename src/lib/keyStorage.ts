import { openDB } from "idb";

const DB_NAME = "whisperbox";
const STORE_NAME = "keys";

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function savePrivateKey(
  userId: string,
  privateKey: string,
) {
  const db = await dbPromise;

  await db.put(
    STORE_NAME,
    privateKey,
    `privateKey:${userId}`,
  );
}

export async function getPrivateKey(
  userId: string,
) {
  const db = await dbPromise;

  return db.get(
    STORE_NAME,
    `privateKey:${userId}`,
  );
}

export async function deletePrivateKey(
  userId: string,
) {
  const db = await dbPromise;

  await db.delete(
    STORE_NAME,
    `privateKey:${userId}`,
  );
}