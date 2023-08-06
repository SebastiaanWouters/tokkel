<script lang="ts">
  import { goto, params, oldUrl } from "elegua";
  import {
    postMessage,
    currentUser,
    type Message,
    getUserById,
    type User,
    fetchAllMessages,
  } from "../lib/pocketbase";
  import { useQuery } from "@sveltestack/svelte-query";
  import ChatBubble from "../lib/components/ChatBubble.svelte";
  import { ChevronLeftCircle } from "lucide-svelte";
  import TopBar from "../lib/components/TopBar.svelte";
  import Avatar from "../lib/components/Avatar.svelte";
  import { SendHorizonal } from "lucide-svelte";

  const messages = useQuery<Message[]>(
    [$currentUser.id, "messages"],
    () => {
      return fetchAllMessages();
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  const currentChatPartner = useQuery<User>(
    [$params["user"], "currentPartner"],
    () => getUserById($params["user"]),
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  $: currentMessages = $messages.data?.filter((msg) => {
    return (
      (msg.from.id === $currentUser.id || msg.to.id === $currentUser.id) &&
      (msg.from.id === $params["user"] || msg.to.id === $params["user"])
    );
  });

  async function sendMessage(msg: string): Promise<Message> {
    if (msg) {
      const sentMsg = await postMessage(
        msg,
        $currentUser,
        $currentChatPartner.data
      );
      if (sentMsg) {
        message = "";
        return { ...sentMsg, content: msg };
      }
    }
  }

  async function handleKeyDown(e) {
    switch (e.keyCode) {
      case 13:
        sendMessage(message);
    }
  }

  let message = "";
</script>

<div class="fill max-h-screen grid grid-rows-[auto_1fr_auto]">
  <TopBar>
    <button on:click={() => goto("/chat")}
      ><ChevronLeftCircle strokeWidth={1.7} /></button
    >
    {#if $currentChatPartner.isLoading}
      <span>Loading...</span>
    {:else if $currentChatPartner.error}
      <span>An error has occurred</span>
    {:else}
      <div class="flex items-center gap-2">
        <p>{$currentChatPartner.data.username}</p>
        <Avatar />
      </div>
    {/if}
  </TopBar>
  <div class="p-4 flex-col-reverse overflow-auto flex gap-2">
    {#if $messages.isLoading}
      <span>Loading...</span>
    {:else if $messages.error}
      <span>An error has occurred</span>
    {:else}
      {#each currentMessages as message (message)}
        <ChatBubble {message} />
      {/each}
    {/if}
  </div>
  <div class="flex gap-4 justify-between p-4 h-fit w-full">
    <input
      on:keydown={(e) => handleKeyDown(e)}
      id="text-input"
      class=" bg-transparent w-full outline-none focus:ring-primary-600 focus:border-primary-600 rounded"
      type="text"
      bind:value={message}
    />
    <button id="send-button" on:click={() => sendMessage(message)}
      ><SendHorizonal /></button
    >
  </div>
</div>
