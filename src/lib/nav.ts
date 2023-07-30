import { writable } from "svelte/store";

const activeTab = writable<number>(0);
const activeChatTab = writable<number>(0);

export { activeTab, activeChatTab }