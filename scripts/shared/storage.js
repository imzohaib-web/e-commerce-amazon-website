export function getStringFromStorage(key, fallback = '') {
  return localStorage.getItem(key) || fallback;
}

export function setStringToStorage(key, value) {
  localStorage.setItem(key, value);
}

export function getJsonFromStorage(key, fallback = []) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

export function setJsonToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
