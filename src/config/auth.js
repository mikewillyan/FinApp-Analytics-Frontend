let currentAccessToken = null;

export function setAccessToken(token) {
  currentAccessToken = token || null;
}

export function getAccessToken() {
  return currentAccessToken;
}

export function clearAccessToken() {
  currentAccessToken = null;
}


