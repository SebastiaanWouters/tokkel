import { writable } from "svelte/store";
import { Record, Admin } from "pocketbase";
import { getPublicKey, nip04 } from "nostr-tools";

import PocketBase, { type ClientResponseError } from 'pocketbase';
import { getSecureKey, privKeyFromEntropy, setSecureKey } from "./utils";

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
  content: { message: string, image?: string }
}

interface Message {
  to: User; 
  from: User;
  content: string;
  created: string;
}

interface RawMessage {
  content: { message: string, image?: string };
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
        setSecureKey(pb.authStore.model.id, sk)
        await pb.collection('users').update(response.record.id, { pubkey: pk });
      }

  async function logoutUser() {
    setSecureKey(pb.authStore.model.id, null)
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
  let sk = await getSecureKey(pb.authStore.model.id)
  const decrypt = [];
  for (const msg of messages) {
    let decMsg = msg.content?.message ?? 'undefined'
    if (msg.expand.from.id === pb.authStore.model.id) {
      try {
        decMsg = await decryptMessage(msg.content.message, sk, msg.expand.to.pubkey)
        
      } catch {
        decMsg="Failed Decrypting"
      }
    } else {
      try {
        decMsg = await decryptMessage(msg.content.message, sk, msg.expand.from.pubkey)
        
      } catch {
        decMsg="Failed Decrypting"
      }
      
    }
    console.log("new message decrypted: " + decMsg)
    decrypt.push({ created: msg.created, from: msg.expand.from, to: msg.expand.to, content: decMsg })
    
  }
  return decrypt;
  
}

async function decryptRealtime(message: Message): Promise<Message> {
  let sk = await getSecureKey(pb.authStore.model.id)
  let decMsg = message.content;
    if (message.from.id === pb.authStore.model.id) {
      try {
         decMsg = await decryptMessage(message.content, sk, message.to.pubkey)
      } catch {
        decMsg = "decrypting realtime failed"
      }
    } else {
      try {
        decMsg = await decryptMessage(message.content, sk, message.from.pubkey)
      } catch {
        decMsg = "decrypting realtime failed"
      }
    }

      return { ...message, content: decMsg };
  }

async function postMessage(msg: string, from: User, to: User): Promise<Message> {
  let ciphertext = msg;
  let privKey = await getSecureKey(pb.authStore.model.id)
  if (privKey) {
    ciphertext = await nip04.encrypt(privKey, to.pubkey, msg);
  }
  // create data to post to pocketbase as message
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
  const user = (await pb.collection('users').getFirstListItem(`id="${id}"`)) as User;
  return user;
}

async function getUserByName(name: string): Promise<User> {
  try {
    const user = (await pb.collection('users').getFirstListItem(`username="${name}"`)) as User;
    return user;
  } catch {
    return null;
  }
  
}

async function fetchMessages(userId: string) : Promise<Message[]> {
   try {
    const rawMsg: RawMessage[] = await pb.collection('messages').getFullList({ expand: 'from,to', sort: '-created',
    filter: `(from="${userId}" || to="${userId}") && (to="${pb.authStore.model.id}" || from="${pb.authStore.model.id}")`
    });
    const decrypted = await decryptMessages(rawMsg);
    console.log(decrypted)
    return decrypted;
  } catch {
    return [];
  }
  
}

async function fetchAllMessages() : Promise<Message[]> {
  console.log("User when fetching messages: " + pb.authStore.model.username)
  try {
    const rawMsg: RawMessage[] = await pb.collection('messages').getFullList({ expand: 'from,to', sort: '-created',
    filter: `from="${pb.authStore.model.id}" || to="${pb.authStore.model.id}"`, '$autoCancel': false
    });
    for (const msg of rawMsg) {
      console.log("new message found")
      break;
    }
    const decrypted = await decryptMessages(rawMsg);
    return decrypted;
  } catch {
      return [];
  }
  
}

async function fetchChatPartners() : Promise<{}> {
  const messages = await fetchAllMessages();
   for (const msg of messages) {
      console.log("new message found while getting partners")
      break;
    }
  const partners = new Map()
    for (const msg of messages) {
      if (msg.from.id !== pb.authStore.model.id) {
        partners.set(msg.from.id, { user: msg.from, latest: msg.created, content: msg.content })
        console.log("new partner: " + msg.from.username + " " + msg.created)
        break;
      } else if (msg.to.id !== pb.authStore.model.id) {
        partners.set(msg.to.id, { user: msg.to, latest: msg.created, content: msg.content })
         console.log("new partner: " + msg.to.username + " " + msg.created)
         break;
      }
    }
    return partners;
}


async function expandMessage(m: MessageRecord): Promise<Message> {
  const from = await pb.collection('users').getFirstListItem(`id="${m.from}"`) as User
  const to = await pb.collection('users').getFirstListItem(`id="${m.to}"`) as User
  return { ...m, to, from, content: m.content.message }
}

let url = 'https://damp-sky-8598.fly.dev'

const pb = new PocketBase(url);

//const currentUser = writable<User>(null)
const currentUser = writable<User>(null)

const rememberUser = writable<boolean>(false);


pb.authStore.onChange(async (auth) => {
    currentUser.set(pb.authStore.model as User);
}, true)

export { pb, currentUser, rememberUser, decryptRealtime, getUserByName, expandMessage, getUserById, fetchMessages, fetchAllMessages, fetchChatPartners, postMessage, createUser, loginUser, logoutUser }
export type { User, Message, ChatPartner, MessageRecord }