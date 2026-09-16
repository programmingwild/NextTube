import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_CHAT_SECRET || "my_secure_key_fallback_change_me";

export const encryptMessage = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    return decoded || "[Decryption Error]";
  } catch {
    return "[Decryption Error]";
  }
};
