<script lang="ts">
  import { useQuery } from "@sveltestack/svelte-query";
  import { convertStringMapToList } from "../lib/utils";
  import ChatPreview from "../lib/components/ChatPreview.svelte";
  import {
    currentUser,
    fetchChatPartners,
    type ChatPartner,
  } from "../lib/pocketbase";
  import { PenSquare } from "lucide-svelte";
  import NewChat from "../lib/components/NewChat.svelte";
  import { clickoutside } from "@svelte-put/clickoutside";

  const partners = useQuery<ChatPartner[]>(
    [$currentUser.id, "partners"],
    fetchPartners,
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  async function fetchPartners(): Promise<ChatPartner[]> {
    console.log("fetching partners for this user: " + $currentUser.id);
    const partners = await fetchChatPartners();
    const partnersArray = convertStringMapToList(
      partners,
      "latest"
    ) as ChatPartner[];
    return partnersArray;
  }

  let open = false;
</script>

<div class="fill grid grid-rows-[auto_1fr]">
  <div
    class="w-full h-16 p-3 border-border border-b flex justify-between items-center"
  >
    <h1 class="font-semibold text-font">Chats</h1>
    <button
      on:click|stopPropagation={() => {
        open = true;
      }}
      class="cursor-pointer"><PenSquare size={18} /></button
    >
  </div>
  <div class="flex flex-col gap-2">
    {#if $partners.status === "success"}
      {#each $partners.data as partner}
        <ChatPreview
          user={partner.user}
          content={partner.content}
          date={partner.latest}
        />
      {/each}
    {/if}
  </div>

  <div
    use:clickoutside
    on:clickoutside={() => {
      open = false;
    }}
  >
    <NewChat bind:open />
  </div>
</div>
