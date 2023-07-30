<script lang="ts">
  import { goto } from "elegua";
  import {
    currentMessages,
    currentChatPartner,
    postMessage,
    currentUser,
  } from "../lib/pocketbase";
  import ChatBubble from "../lib/components/ChatBubble.svelte";

  let message = "";

  async function sendMessage(msg: string) {
    const partner = await $currentChatPartner;
    console.log(partner.username);
    await postMessage(msg, $currentUser, partner);
  }
</script>

<div class="fill max-h-screen grid grid-rows-[auto_1fr_auto]">
  <div
    class="h-12 w-full flex justify-between items-center px-4 border-white/5 border-b"
  >
    <button on:click={() => goto("/home")}>{"<"}</button>
    {#await $currentChatPartner then partner}
      <p>{partner.username}</p>
    {/await}
  </div>
  <div class="p-4 flex-col-reverse overflow-auto flex gap-2">
    {#await $currentMessages then messages}
      {#each messages as message}
        <ChatBubble {message} />
      {/each}
    {:catch err}
      <mark>failed</mark>
    {/await}
  </div>
  <div class="flex gap-4 justify-between p-4 h-fit w-full">
    <input class="bg-transparent w-full" type="text" bind:value={message} />
    <button on:click={() => sendMessage(message)}>Send</button>
  </div>
</div>
