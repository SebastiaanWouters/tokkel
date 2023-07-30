import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { writable } from "svelte/store";
import * as secp from "@noble/secp256k1";
import hkdf from '@panva/hkdf'
import { intlFormatDistance } from 'date-fns';

const publicRoutes = ["/login", "/register"]

type Response = {
    value: string,
    error: boolean
}

async function setSecureKey(key: string, value: string): Promise<Response> {
    try {
        await SecureStoragePlugin.set({ key, value })
        return { value, error: false };
    } catch (error) {
        return { value: 'item not found', error: true };
    }
}

async function getSecureKey(key: string): Promise<Response> {
    try {
        const value = await SecureStoragePlugin.get({ key })
        return { value: value.value, error: false };
    } catch (error) {
        return { value: 'item not found', error: true };
    }
}

async function privKeyFromEntropy(ent: string, username: string) {
    const derivedKey = await hkdf(
            'sha256',
            ent,
            'salt',
            username,
            64
            )
    const hex = secp.utils.bytesToHex(derivedKey);
    const sk = secp.utils.hashToPrivateKey(hex);
    const ret = secp.utils.bytesToHex(sk)
    return ret;
}

const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');


function filterUniqueByAttribute<T>(list: T[], attribute: keyof T): T[] {
  const uniqueMap: Map<T[keyof T], T> = new Map();
  list.forEach((item) => {
    const key = item[attribute];
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });
  return Array.from(uniqueMap.values());
}

function minutesAgoFromTimestamp(timestampString: string): string {
  const timestamp = Date.parse(timestampString);
  if (isNaN(timestamp)) {
    throw new Error("Invalid timestamp format");
  }

  return intlFormatDistance(timestamp, new Date())

}

export { getSecureKey, publicRoutes, setSecureKey, minutesAgoFromTimestamp, privKeyFromEntropy, fromHexString, toHexString, filterUniqueByAttribute };
export type { Response };
