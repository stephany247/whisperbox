export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  return keyPair;
}

export async function exportPublicKey(publicKey: CryptoKey) {
  const exported = await crypto.subtle.exportKey("spki", publicKey);

  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPublicKey(publicKeyB64: string) {
  const binary = Uint8Array.from(atob(publicKeyB64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binary.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
}

export async function exportPrivateKey(privateKey: CryptoKey) {
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);

  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPrivateKey(privateKeyB64: string) {
  const binary = Uint8Array.from(atob(privateKeyB64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );
}

export function savePrivateKey(userId: string, privateKey: string) {
  localStorage.setItem(`privateKey:${userId}`, privateKey);
}

export function getPrivateKey(userId: string) {
  return localStorage.getItem(`privateKey:${userId}`);
}

export async function encryptMessage(
  plaintext: string,
  recipientPublicKey: CryptoKey,
  senderPublicKey: CryptoKey,
) {
  const aesKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    new TextEncoder().encode(plaintext),
  );

  const exportedKey = await crypto.subtle.exportKey("raw", aesKey);

  const senderEncryptedKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    senderPublicKey,
    exportedKey,
  );

  const receiverEncryptedKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    recipientPublicKey,
    exportedKey,
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),

    senderEncryptedKey: btoa(
      String.fromCharCode(...new Uint8Array(senderEncryptedKey)),
    ),

    receiverEncryptedKey: btoa(
      String.fromCharCode(...new Uint8Array(receiverEncryptedKey)),
    ),

    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptMessage(
  payload: {
    ciphertext: string;
    encryptedKey: string;
    iv: string;
  },
  privateKey: CryptoKey,
) {
  const encryptedKey = Uint8Array.from(atob(payload.encryptedKey), (c) =>
    c.charCodeAt(0),
  );

  const rawAesKey = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedKey,
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    {
      name: "AES-GCM",
    },
    false,
    ["decrypt"],
  );

  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0)),
    },
    aesKey,
    Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0)),
  );

  return new TextDecoder().decode(plaintext);
}
