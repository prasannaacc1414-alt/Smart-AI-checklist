/**
 * Security Utility for Smart AI Checklist
 * Implements lightweight data encryption for local storage items to mitigate local extraction risks
 * and enforces strict 1-hour session persistence checks.
 */

// Generate a stable key using browser-specific headers and elements
const getLocalSecret = (): string => {
  const navigatorKeys = [
    window.navigator.userAgent,
    window.navigator.language,
    String(window.screen.colorDepth),
    String(window.screen.height),
  ].join('_');
  
  // Custom simple hash function to derive a 32-character key
  let hash = 0;
  for (let i = 0; i < navigatorKeys.length; i++) {
    hash = (hash << 5) - hash + navigatorKeys.charCodeAt(i);
    hash |= 0;
  }
  return `SECURE_KEY_${Math.abs(hash).toString(16).toUpperCase()}_SALT_2026`;
};

/**
 * Encrypts cleartext using standard XOR-cycling and Base64 encoding.
 * Mitigates cleartext snooping in client-side localStorage.
 */
export const encryptData = (text: string): string => {
  if (!text) return '';
  const key = getLocalSecret();
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    // XOR operation
    result += String.fromCharCode(textChar ^ keyChar);
  }
  // Convert to safely-storable Base64 string
  try {
    return window.btoa(encodeURIComponent(result));
  } catch (e) {
    return window.btoa(result);
  }
};

/**
 * Decrypts salted, XOR-encoded Base64 string.
 */
export const decryptData = (cipherText: string): string => {
  if (!cipherText) return '';
  const key = getLocalSecret();
  let decoded = '';
  try {
    decoded = decodeURIComponent(window.atob(cipherText));
  } catch (e) {
    try {
      decoded = window.atob(cipherText);
    } catch (err) {
      return '';
    }
  }
  
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode ^ keyChar);
  }
  return result;
};

// Session metadata keys
const SESSION_TOKEN_KEY = 'secure_session_token';
const SESSION_SHEET_KEY = 'secure_session_sheet_id';
const SESSION_START_KEY = 'secure_session_start_time';
const SESSION_USER_KEY = 'secure_session_user';

export interface DecryptedSession {
  token: string | null;
  spreadsheetId: string | null;
  startTime: number | null;
  userEmail: string | null;
  timeRemainingSeconds: number;
  isValid: boolean;
}

/**
 * Saves and encrypts user session info to local storage.
 */
export const saveSecureSession = (token: string, sheetId: string, email: string) => {
  const now = Date.now();
  localStorage.setItem(SESSION_TOKEN_KEY, encryptData(token));
  localStorage.setItem(SESSION_SHEET_KEY, encryptData(sheetId));
  localStorage.setItem(SESSION_USER_KEY, encryptData(email));
  localStorage.setItem(SESSION_START_KEY, encryptData(String(now)));
};

/**
 * Loads, decrypts, and validates the session. Enforces a strict 1-hour timeout.
 */
export const loadSecureSession = (): DecryptedSession => {
  const encryptedToken = localStorage.getItem(SESSION_TOKEN_KEY);
  const encryptedSheet = localStorage.getItem(SESSION_SHEET_KEY);
  const encryptedUser = localStorage.getItem(SESSION_USER_KEY);
  const encryptedStart = localStorage.getItem(SESSION_START_KEY);

  if (!encryptedToken || !encryptedSheet || !encryptedStart) {
    return {
      token: null,
      spreadsheetId: null,
      startTime: null,
      userEmail: null,
      timeRemainingSeconds: 0,
      isValid: false,
    };
  }

  try {
    const token = decryptData(encryptedToken);
    const spreadsheetId = decryptData(encryptedSheet);
    const userEmail = encryptedUser ? decryptData(encryptedUser) : null;
    const startTimeStr = decryptData(encryptedStart);
    const startTime = parseInt(startTimeStr, 10);

    if (isNaN(startTime)) {
      clearSecureSession();
      return { token: null, spreadsheetId: null, startTime: null, userEmail: null, timeRemainingSeconds: 0, isValid: false };
    }

    const elapsedMs = Date.now() - startTime;
    const oneHourMs = 60 * 60 * 1000; // 1 hour
    const timeRemainingSeconds = Math.max(0, Math.floor((oneHourMs - elapsedMs) / 1000));

    if (elapsedMs >= oneHourMs) {
      // Session has expired (exceeded 1 hour)
      clearSecureSession();
      return {
        token: null,
        spreadsheetId: null,
        startTime: null,
        userEmail: null,
        timeRemainingSeconds: 0,
        isValid: false,
      };
    }

    return {
      token,
      spreadsheetId,
      startTime,
      userEmail,
      timeRemainingSeconds,
      isValid: true,
    };
  } catch (error) {
    console.error('Session decryption/validation error:', error);
    clearSecureSession();
    return {
      token: null,
      spreadsheetId: null,
      startTime: null,
      userEmail: null,
      timeRemainingSeconds: 0,
      isValid: false,
    };
  }
};

/**
 * Clears session details completely.
 */
export const clearSecureSession = () => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_SHEET_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(SESSION_START_KEY);
};
