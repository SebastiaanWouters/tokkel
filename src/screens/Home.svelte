<script lang="ts">
  import { onMount } from "svelte";
  import {
    logoutUser,
    currentKey,
    postMessage,
    currentUser,
    currentMessages,
    currentChatPartner,
  } from "../lib/pocketbase";

  let receiver = "rec";
  let message = "msg";
</script>

<div class="contents">
  <div class="flex flex-col justify-center gap-1 overflow-auto fill">
    <input type="text" class="text-black" bind:value={receiver} />
    <input type="text" class="text-black" bind:value={message} />
    <button on:click={() => {}}> Post </button>
    <button on:click={() => logoutUser()}> Logout </button>
    <p>{$currentKey}</p>
    {#await $currentMessages}
      <p>Loading messages...</p>
    {:then decryptedMessages}
      {#each decryptedMessages as message, index}
        <div class="">{message.content + " " + index ?? "empty"}</div>
      {/each}
    {:catch err}
      <mark>User failed.</mark>
    {/await}
  </div>
</div>
