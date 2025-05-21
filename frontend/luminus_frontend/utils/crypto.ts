export async function encryptWithPublicKey(publicKeyPem: string, plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  // Remove cabeçalhos e rodapés da chave PEM
  const pemContents = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  // Converte para formato binário DER
  const binaryDer = Uint8Array.from(atob(pemContents), char => char.charCodeAt(0));

  // Importa a chave pública
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-1", // SHA-1 é default do Node.js se não especificar `oaepHash`
    },
    false,
    ["encrypt"]
  );

  // Criptografa os dados
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    data
  );

  // Retorna como base64
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
