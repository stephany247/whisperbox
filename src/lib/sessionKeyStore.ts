const SESSION_PASSWORD_KEY = "whisperbox-session";

export function setSessionPassword(password: string) {
  sessionStorage.setItem(
    SESSION_PASSWORD_KEY,
    password,
  );
}

export function getSessionPassword() {
  return sessionStorage.getItem(
    SESSION_PASSWORD_KEY,
  );
}

export function clearSessionPassword() {
  sessionStorage.removeItem(
    SESSION_PASSWORD_KEY,
  );
}