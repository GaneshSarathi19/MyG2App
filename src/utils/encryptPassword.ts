import CryptoJS from 'crypto-js';

/**
 * Encrypts a plain-text password using AES-256 in CBC mode
 * with PKCS7 padding and UTF-8 encoding.
 *
 * This is the exact CryptoJS implementation used by the backend.
 *
 * @param password - The raw user password.
 * @returns The encrypted password as a Base64 string (no Salt / no IV prepended).
 */
export function encryptPassword(password: string): string {
  const key = CryptoJS.enc.Utf8.parse('11ebf1673f3a4c08813e10851346ba06');
  const iv = CryptoJS.enc.Utf8.parse('dcb95b4564cb4667');

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(password),
    key,
    {
      keySize: 256 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  // Return ciphertext as Base64 so the backend can decrypt it
  // with the same key/iv.
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}
