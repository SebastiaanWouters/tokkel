import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import * as secp from "@noble/secp256k1";
import hkdf from '@panva/hkdf'
import { intlFormatDistance } from 'date-fns';

const publicRoutes = ["/login", "/register"]

enum MessageType {
  Image = 'image',
  Other = 'other',
}

interface ParsedMessage {
  content: string;
  type: MessageType;
}

const primaryColors = {
  50: '#F8E4F6',
  100: '#F2CCF0',
  200: '#E29CE5',
  300: '#CB6CD8',
  400: '#AE3BCB',
  500: '#7E2A9F',
  600: '#602383',
  700: '#451B66',
  800: '#2D144A',
  900: '#190C2E',
};

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

function parseMessage(inputString: string): ParsedMessage {
  if (inputString.startsWith('https') && inputString.endsWith('gif')) {
    const imgElement = document.createElement('img');
    imgElement.src = inputString;
    return { content: imgElement.outerHTML, type: MessageType.Other }
  } else if (inputString.includes('youtube.com') || inputString.includes('youtu.be')) {
    const youtubeVideoElement = document.createElement('youtube-video');
    youtubeVideoElement.setAttribute('controls', 'true');
    youtubeVideoElement.setAttribute('allowfullscreen', 'true');
    youtubeVideoElement.setAttribute('src', inputString);
    
    youtubeVideoElement.style.width = '100%';
    youtubeVideoElement.style.height = '100%';
    youtubeVideoElement.style.objectFit = 'cover';

    return { content: youtubeVideoElement.outerHTML, type: MessageType.Other };
  } else if (inputString.startsWith('data:image')) { // Check if input is a base64 image
    return { content: inputString, type: MessageType.Image };
  } else {
    const pElement = document.createElement('p');
    pElement.textContent = inputString;
    pElement.className = 'py-2 px-3';
    return { content: pElement.outerHTML, type: MessageType.Other };
  }
}

function parsePreview(inputString: string): string {
  if (inputString.includes('youtube.com') || inputString.includes('youtu.be')) {
    return "Youtube Video";
  } else if (inputString.startsWith('data:image')) {
    return "Image Content";
  } else if (inputString.startsWith('https') && inputString.endsWith('gif')) {
    return "Gif Media";
  } else {
    return inputString;
  }
}



export { getSecureKey, publicRoutes, primaryColors, parsePreview, MessageType, type ParsedMessage, parseMessage, truncateContent, setSecureKey, mapDataToListOfMessages, convertStringMapToList, minutesAgoFromTimestamp, privKeyFromEntropy, fromHexString, toHexString, filterUniqueByAttribute };
export type { Response };
