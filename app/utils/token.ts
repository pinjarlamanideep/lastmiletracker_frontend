import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@lmt_token';

export async function storeToken(token: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (err) {
    console.error('storeToken error', err);
    return false;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t;
  } catch (err) {
    console.error('getToken error', err);
    return null;
  }
}

export async function removeToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (err) {
    console.error('removeToken error', err);
    return false;
  }
}
