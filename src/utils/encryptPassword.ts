import CryptoJS from 'react-native-crypto-js';

const PASSWORD_SALT_KEY = '11ebf1673f3a4c08813e10851346ba06';
const PASSWORD_SALT_IV = 'dcb95b4564cb4667';

/**
 * Encrypts a plain-text password using AES-256-CBC.
 *
 * @param password - The plain-text password to encrypt.
 * @returns The Base64-encoded encrypted password string.
 */
export const encryptPassword = (password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(PASSWORD_SALT_KEY);
  const iv = CryptoJS.enc.Utf8.parse(PASSWORD_SALT_IV);

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(password),
    key,
    {
      keySize: 256 / 8,
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.toString();
};

export default encryptPassword;
