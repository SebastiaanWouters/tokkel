<script>
  import ChatPreview from "../lib/components/ChatPreview.svelte";
  import { partners } from "../lib/pocketbase";
</script>

<div class="fill grid grid-rows-[auto_1fr]">
  <div class="w-full p-3 font-semibold text-gray-300 border-white/5 border-b">
    Chats
  </div>
  <div class="flex flex-col gap-2">
    {#await $partners then partners}
      {#each partners as partner}
        <ChatPreview
          user={partner.user}
          content={partner.content}
          date={partner.created}
        />
      {/each}
    {:catch err}
      <mark>failed</mark>
    {/await}
  </div>
</div>
