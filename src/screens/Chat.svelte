<script>
  import { goto } from "elegua";
  import { currentMessages, currentChatPartner } from "../lib/pocketbase";
  import ChatBubble from "../lib/components/ChatBubble.svelte";
</script>

<div class="fill grid grid-rows-[auto_1fr_auto]">
  <div
    class="h-12 w-full flex justify-between items-center px-4 border-white/5 border-b"
  >
    <button on:click={() => goto("/home")}>{"<"}</button>
    {#await $currentChatPartner then partner}
      <p>{partner.username}</p>
    {/await}
  </div>
  <div class="p-4 flex-col flex gap-2">
    {#await $currentMessages then messages}
      {#each messages as message}
        <ChatBubble {message} />
      {/each}
    {:catch err}
      <mark>failed</mark>
    {/await}
  </div>
  <div class="h-12 w-full" />
</div>
