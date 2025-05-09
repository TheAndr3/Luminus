//encriptar e mandar a senha para o backend já encriptada

export async function encryptWithPublicKey(publicKeyPem: string, plainText: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
  
    // Remove headers da chave PEM e converte para ArrayBuffer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = publicKeyPem
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
  
    const binaryDerString = atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
  
    // Importar chave pública
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );
  
    // Criptografar dados
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
    );
  
    // Converter para base64 para envio
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  