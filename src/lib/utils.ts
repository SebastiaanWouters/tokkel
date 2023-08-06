import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import * as secp from "@noble/secp256k1";
import hkdf from '@panva/hkdf'
import { intlFormatDistance } from 'date-fns';
import { string } from 'zod';

const publicRoutes = ["/login", "/register"]

type Response = {
    value: string,
    error: boolean
}

async function setSecureKey(userId: string, value: string): Promise<boolean> {
    
        const res = await SecureStoragePlugin.set({ key: `${userId}-sk`, value })
        return res.value;
}

async function getSecureKey(userId: string): Promise<string> {
        const value = await SecureStoragePlugin.get({ key: `${userId}-sk` })
        return value.value;
   
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

function mapDataToListOfMessages(data) {
  const listOfMessages = [];

  for (const [queryKey, messages] of data) {
    for (const message of messages) {
      listOfMessages.push({ queryKey, message });
    }
  }

  return listOfMessages;
}

function convertStringMapToList(stringMap, sortByProperty) {
  // Step 1: Parse the string representation of the map into an object  

  // Step 2: Convert the object's values into an array of objects
  const arrayOfObjects = Array.from(stringMap.values())

  // Step 3: Sort the array of objects based on the desired property
  arrayOfObjects.sort((b, a) => Date.parse(a[sortByProperty]) - Date.parse(b[sortByProperty]));

  return arrayOfObjects;
}

 function truncateContent(content, maxLength) {
    if (content && content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }
    return content;
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

export { getSecureKey, publicRoutes, truncateContent, setSecureKey, mapDataToListOfMessages, convertStringMapToList, minutesAgoFromTimestamp, privKeyFromEntropy, fromHexString, toHexString, filterUniqueByAttribute };
export type { Response };
