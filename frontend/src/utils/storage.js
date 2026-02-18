import { isNativePlatform } from './capacitor';

const TOKEN_KEY = 'sh_token';
const ONBOARDED_KEY = 'sh_onboarded';

async function getNative(key) {
  const { Preferences } = await import('@capacitor/preferences');
  const { value } = await Preferences.get({ key });
  return value;
}

async function setNative(key, value) {
  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.set({ key, value });
}

async function removeNative(key) {
  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.remove({ key });
}

export async function getToken() {
  if (isNativePlatform()) {
    return getNative(TOKEN_KEY);
  }
  try {
    return Promise.resolve(sessionStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
}

export async function setToken(value) {
  if (isNativePlatform()) {
    await setNative(TOKEN_KEY, value);
    return;
  }
  try {
    sessionStorage.setItem(TOKEN_KEY, value);
  } catch {}
}

export async function removeToken() {
  if (isNativePlatform()) {
    await removeNative(TOKEN_KEY);
    return;
  }
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function getOnboarded() {
  if (isNativePlatform()) {
    const v = await getNative(ONBOARDED_KEY);
    return v === '1';
  }
  try {
    return Promise.resolve(sessionStorage.getItem(ONBOARDED_KEY) === '1');
  } catch {
    return false;
  }
}

export async function setOnboarded(value) {
  if (isNativePlatform()) {
    await setNative(ONBOARDED_KEY, value ? '1' : '0');
    return;
  }
  try {
    sessionStorage.setItem(ONBOARDED_KEY, value ? '1' : '0');
  } catch {}
}
