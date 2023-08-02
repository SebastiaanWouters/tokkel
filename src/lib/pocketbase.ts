import { Capacitor } from "@capacitor/core";
import { derived, writable } from "svelte/store";
import { Record, Admin } from "pocketbase";
import { getPublicKey, nip04 } from "nostr-tools";
import { params, goto } from "elegua";
import { asyncDerived, asyncWritable } from "@square/svelte-store";

import PocketBase, { type ClientResponseError } from 'pocketbase';
import { filterUniqueByAttribute, fromHexString, getSecureKey, privKeyFromEntropy, setSecureKey, toHexString, minutesAgoFromTimestamp } from "./utils";

interface User extends Record {
  username: string;
  pubkey: string;
}

interface ChatPartner {
  user: User,
  latest: string,
  content: string;
}

interface MessageRecord extends Record {
  content: { message: string }
}

interface Message {
  to: User; 
  from: User;
  content: string;
  created: string;

}

interface RawMessage {
  content: { message: string };
  created: string;
  expand: { from: User, to: User }
}

  async function createUser(username: string, password: string, passwordConfirm: string) {
    await pb.collection("users").create({
      username, 
      password,
      passwordConfirm,
      name: username,
    });
  }

  async function loginUser(username: string, password: string) {
        const sk = await privKeyFromEntropy(password, username);
        const pk = getPublicKey(sk);
        const response = await pb.collection("users").authWithPassword(username, password);
        setSecureKey(`${pb.authStore.model.username}-sk`, sk)
        await pb.collection('users').update(response.record.id, { pubkey: pk });
      }

  async function logoutUser() {
    pb.authStore.clear();
  }

  async function getMessages() : Promise<RawMessage[]> {
    const msg = (await pb.collection('messages').getFullList({ expand: 'from,to', sort: '-created' })) as RawMessage[];
    return msg;

}

async function decryptMessage(msg: string, sk: string, pk: string) {
  const decrypted = await nip04.decrypt(sk, pk, msg);
  return decrypted;
}

async function decryptMessages(messages: RawMessage[]): Promise<Message[]> {
  console.log(messages)
  let sk = await currentKey.load()
  console.log(sk)
  const decrypt = [];
  for (const msg of messages) {
    let dec = msg.content.message
    console.log(dec)
    if (msg.expand.from.id === pb.authStore.model.id) {
      dec = await decryptMessage(msg.content.message, sk, msg.expand.to.pubkey)
    } else {
      dec = await decryptMessage(msg.content.message, sk, msg.expand.from.pubkey)
    }
    decrypt.push({ created: msg.created, from: msg.expand.from, to: msg.expand.to, content: dec })
  }
  console.log(decrypt)
  return decrypt;
  
}

async function decryptIncoming(message: MessageRecord, from: User, to: User): Promise<Message> {
  let sk = await currentKey.load()
  const expanded = await expandMessage(message);
  let msg = expanded.content
    if (expanded.from.id === pb.authStore.model.id) {
      msg = await decryptMessage(expanded.content, sk, expanded.to.pubkey)
    } else {
      msg = await decryptMessage(expanded.content, sk, expanded.from.pubkey)
    }

      return { created: message.created, from: expanded.from, to: expanded.to, content: msg };
  }

async function postMessage(msg: string, from: User, to: User): Promise<Message> {
  let ciphertext = msg;
  let privKey = await currentKey.load()
  if (privKey) {
    ciphertext = await nip04.encrypt(privKey, to.pubkey, msg);
  }
  // example create data
  const data = {
    from: from.id,
    to: to.id,
    content: JSON.stringify({ message: ciphertext }),
  };
  try {
    const msg = await pb.collection('messages').create(data) as MessageRecord;
    return { from, to, content: msg.content.message, created: msg.created};
  } catch {
    return null
  }
  
}

async function getUserById(id: string): Promise<User> {
  console.log(id)
  const user = (await pb.collection('users').getFirstListItem(`id="${id}"`)) as User;
  return user;
}

async function fetchMessages(userId: string) : Promise<Message[]> {
  try {
    const rawMsg: RawMessage[] = await pb.collection('messages').getFullList({ expand: 'from,to', sort: '-created',
    filter: `from="${userId}" || to="${userId}"`
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const decrypted = await decryptMessages(rawMsg);
    return decrypted;
  } catch {
    console.log("jow")
    return [];
  }
  
}

async function fetchAllMessages() : Promise<Message[]> {
  try {
    const rawMsg: RawMessage[] = await pb.collection('messages').getFullList({ expand: 'from,to', sort: 'created',
    filter: `from="${pb.authStore.model.id}" || to="${pb.authStore.model.id}"`
});
    console.log(rawMsg)
    const decrypted = await decryptMessages(rawMsg);
    return decrypted;
  } catch {
    
    return [];
  }
  
}

async function fetchChatPartners() : Promise<{}> {
  const messages = await fetchAllMessages();
  console.log(messages)
  const partners = new Map()
    for (const msg of messages) {
      if (msg.from.id !== pb.authStore.model.id && !partners[msg.from.id]) {
        partners.set(msg.from.id, { user: msg.from, latest: msg.created, content: msg.content })
      } else if (msg.to.id !== pb.authStore.model.id && !partners[msg.to.id]) {
        partners.set(msg.to.id, { user: msg.to, latest: msg.created, content: msg.content })
      }
    }
    return partners;
}

// async function updateMessages(e) {
//   const from = await pb.collection('users').getFirstListItem(`id="${e.from}"`)
//   const to = await pb.collection('users').getFirstListItem(`id="${e.to}"`)
//   messages.update((msgs) => [...msgs, { ...e, expand: { to, from } }])
// }

async function expandMessage(m: MessageRecord): Promise<Message> {
  const from = await pb.collection('users').getFirstListItem(`id="${m.from}"`) as User
  const to = await pb.collection('users').getFirstListItem(`id="${m.to}"`) as User
  return { ...m, to, from, content: m.content.message }
}

let url = 'https://damp-sky-8598.fly.dev'


const pb = new PocketBase(url);

//const currentUser = writable<User>(null)
const currentUser = writable<User>(null)

//const queryClient = useQueryClient();
const currentKey = asyncWritable([], async () => {
    const key = getSecureKey(`${pb.authStore.model.username}-sk`);
    return key;
  }, 
  async (newKey) => {
    const key = setSecureKey(`${pb.authStore.model.username}-sk`, newKey);
    if (key) {
      return newKey
    }
    return null;
  } 
  );

const isAuthenticated = derived([currentKey, currentUser], ([$key, $user]) => {
  return $user && $key;
});

pb.authStore.onChange(async (auth) => {
    console.log("Auth Changed", auth);
    currentUser.set(pb.authStore.model as User);
}, true)

export { pb, currentUser, currentKey, decryptIncoming, isAuthenticated, getUserById, fetchMessages, fetchAllMessages, fetchChatPartners, postMessage, createUser, loginUser, logoutUser }
export type { User, Message, ChatPartner, MessageRecord }