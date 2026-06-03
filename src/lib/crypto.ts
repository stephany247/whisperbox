export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
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

export async function exportPrivateKey(privateKey: CryptoKey) {
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);

  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export function savePrivateKey(userId: string, privateKey: string) {
  localStorage.setItem(`privateKey:${userId}`, privateKey);
}

export function getPrivateKey(userId: string) {
  return localStorage.getItem(`privateKey:${userId}`);
}
