import { Capacitor } from "@capacitor/core";
import { derived, writable } from "svelte/store";
import { Record, Admin } from "pocketbase";
import { getPublicKey, nip04 } from "nostr-tools";
import { asyncable, type Asyncable } from "svelte-asyncable";
import { asyncReadable, asyncDerived, asyncWritable } from "@square/svelte-store";
import { params } from "elegua";

import PocketBase, { type ClientResponseError } from 'pocketbase';
import { filterUniqueByAttribute, fromHexString, getSecureKey, privKeyFromEntropy, setSecureKey, toHexString, minutesAgoFromTimestamp } from "./utils";

interface User extends Record {
  username: string;
  pubkey: string;
}

interface ChatPartner {
  user: User,
  created: string,
  content: string;
}

interface Decrypted {
  to: User; 
  from: User;
  content: string;
  created: string;

}

interface Message extends Record {
  from: string;
  to: string;
  expand: object & { to: Record & User; from: Record & User };
  content: object & { message: string };
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
        currentKey.set(sk);
        await pb.collection('users').update(response.record.id, { pubkey: pk });
      }

  async function logoutUser() {
    currentKey.set(null);
    pb.authStore.clear();
  }

  async function getMessages() {
    const msg = (await pb.collection('messages').getFullList({ expand: 'from,to', sort: '-created' })) as Message[];
    return msg;

}

async function decryptMessage(msg: string, sk: string, pk: string) {
  const decrypted = await nip04.decrypt(sk, pk, msg);
  return decrypted;
}

async function decryptMessages(messages: Message[]): Promise<Decrypted[]> {
  let sk = null
  currentKey.subscribe((value) => sk = value)
  const decrypt = [];
  for (const msg of messages) {
    let dec = msg.content.message
    if (msg.expand.from.id === pb.authStore.model.id) {
      dec = await decryptMessage(msg.content.message, sk, msg.expand.to.pubkey)
    } else {
      dec = await decryptMessage(msg.content.message, sk, msg.expand.from.pubkey)
    }
    decrypt.push({ created: msg.created, from: msg.expand.from, to: msg.expand.to, content: dec })
  }

  return decrypt;
  
}

async function decryptIncoming(message: Record): Promise<Decrypted> {
  let sk = null
  currentKey.subscribe((value) => sk = value)
  const expanded = await expandMessage(message);
  let msg = expanded.content.message
    if (expanded.expand.from.id === pb.authStore.model.id) {
      msg = await decryptMessage(expanded.content.message, sk, expanded.expand.to.pubkey)
    } else {
      msg = await decryptMessage(expanded.content.message, sk, expanded.expand.from.pubkey)
    }

      return { created: message.created, from: expanded.expand.from, to: expanded.expand.to, content: msg };
  }

async function postMessage(msg: string, from: string, to: string, privKey: string) {
  const receiver = await getUserByName(to);
  let ciphertext = msg;
  if (privKey) {
    ciphertext = await nip04.encrypt(privKey, receiver.pubkey, msg);
  }
  // example create data
  const data = {
    from,
    to: receiver.id,
    content: JSON.stringify({ message: ciphertext }),
  };

  await pb.collection('messages').create(data);
}

async function getUserByName(name: string): Promise<User> {
  const user = (await pb.collection('users').getFirstListItem(`username="${name}"`)) as User;
  return user;
}

async function getUserById(id: string): Promise<User> {
  const user = (await pb.collection('users').getFirstListItem(`id="${id}"`)) as User;
  return user;
}

async function updateMessages(e) {
  const from = await pb.collection('users').getFirstListItem(`id="${e.from}"`)
  const to = await pb.collection('users').getFirstListItem(`id="${e.to}"`)
  messages.update((msgs) => [...msgs, { ...e, expand: { to, from } }])
}

async function expandMessage(m) {
  const from = await pb.collection('users').getFirstListItem(`id="${m.from}"`)
  const to = await pb.collection('users').getFirstListItem(`id="${m.to}"`)
  return { ...m, expand: { to, from } }
}

let url = ""

if (Capacitor.getPlatform() === "web") {
    url = 'https://damp-sky-8598.fly.dev'
} else {
    url = 'https://damp-sky-8598.fly.dev'
}

const pb = new PocketBase(url);

const loaded = false;

const currentUser = writable<User>(null)

const currentKey = asyncWritable(
  currentUser,
  async ($currentUser) => {
    if ($currentUser === null) {
      return null;
    }
    const key = await getSecureKey(`${$currentUser.username}-sk`)
    return key.value
  },
  async (newKey, $currentUser) => {
    const key = await setSecureKey(`${$currentUser.username}-sk`, newKey)
    return key.value;
  }
);

const isAuthenticated = derived([currentKey, currentUser], ([$key, $user]) => {
  return $user && $key;
});

const currentChatPartner = asyncable(async ($params) => {
  try {
    const user = await getUserById($params['user']);
    return user
  } catch {
    return null;
  }
}, null, [  params ]);

const messages = asyncable(async () => {
  const msg = await getMessages();
  const dec = await decryptMessages(msg);
  return dec;
}, [], [ currentKey, currentUser]);

const partners = asyncable(async ($messages) => {
  const messages =  await $messages as Decrypted[];
  const partners1 = messages.map(m => m.to);
  const partners2 = messages.map(m => m.from);
  const filteredList = filterUniqueByAttribute(partners1.concat(partners2), "id");

  const partnersWithMessages = [] as ChatPartner[]

  for (const partner of filteredList) {
    for (const message of messages) {
      if (message.from.id === partner.id) {
        partnersWithMessages.push({ user: message.from, content: message.content, created: minutesAgoFromTimestamp(message.created)  });
        break;
      } else if (message.to.id === partner.id) {
        partnersWithMessages.push({ user: message.to, content: message.content, created: minutesAgoFromTimestamp(message.created)  });
        break;
      }
    }
  }
  return partnersWithMessages;
  //TODO: make sure list is ordered and contains some extra metadata: last message, timestamp...
},  [], [ messages ]) as Asyncable<ChatPartner[]>;

const currentMessages = asyncable(async ($messages, $currentChatPartner) => {
  const messages =  await $messages as Decrypted[];
  const partner = await $currentChatPartner as User;
  const filtered = messages.filter(m => m.from.id === partner.id || m.to.id === partner.id)
  return filtered;
},  [], [ messages, currentChatPartner ]) as Asyncable<Decrypted[]>;

//initialisation
async function setData() {
  if (pb.authStore.isValid) {
  try {
    currentUser.set(pb.authStore.model as User);
    //realtime & changes
    pb.collection("messages").subscribe("*", async (e) => {console.log(e.record); const dec = await decryptIncoming(e.record); messages.update($msg => {return [dec, ...$msg]}) });
  } catch {

  }
  } else {
    currentUser.set(null);
  }
 
}

await setData();


pb.authStore.onChange(async (auth) => {
    console.log("Auth Changed", auth);
    await setData();
})

export { pb, currentUser, currentKey, messages, partners, currentMessages, isAuthenticated, currentChatPartner, postMessage, createUser, loginUser, logoutUser }
export type { User, Decrypted }