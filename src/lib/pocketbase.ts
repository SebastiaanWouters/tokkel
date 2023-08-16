import { f7, f7ready } from 'framework7-svelte'
import PocketBase from 'pocketbase';
import { writable } from "svelte/store";
import type { User } from './types';


let url = 'https://damp-sky-8598.fly.dev'

export const pb = new PocketBase(url);

export const authStore = writable<User| null>(null);

pb.authStore.onChange(async (auth) => {
    authStore.set(pb.authStore.model as User);
    if (!pb.authStore.isValid) {
        f7.views.current.router.navigate('/login')
    }
}, true)

