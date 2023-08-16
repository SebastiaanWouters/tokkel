<script lang="ts">
  import {
    Message as F7Message,
    Icon,
    Messagebar,
    MessagebarAttachment,
    MessagebarAttachments,
    MessagebarSheet,
    MessagebarSheetImage,
    Messages,
    MessagesTitle,
    NavRight,
    Navbar,
    Page,
    PageContent,
    f7,
    f7ready,
  } from "framework7-svelte";
  import { Send, Camera } from "lucide-svelte";
  import { postMessage } from "../lib/api";
  import { createQuery } from "@tanstack/svelte-query";
  import type { Message, User } from "../lib/types";
  import { authStore } from "../lib/pocketbase";
  import { fetchAllMessages, getUserById } from "../lib/api";
  import Avatar from "../components/Avatar.svelte";
  import { onMount } from "svelte";

  export let partnerId: string = null;
  let messagebarInstance;
  let message: string | null = null;

  onMount(() => {
    f7ready(() => {
      messagebarInstance = f7.messagebar.get(".messagebar");
    });
  });

  const partner = createQuery<User | null>({
    queryKey: [partnerId, "partner"],
    queryFn: () => getUserById(partnerId),
    enabled: $authStore ? true : false,
  });

  const messages = createQuery<Message[]>({
    queryKey: [$authStore.id, "messages"],
    queryFn: () => fetchAllMessages(),
    enabled: $authStore ? true : false,
  });

  $: currentMessages = $messages.data?.filter((msg) => {
    return (
      (msg.from.id === $authStore.id || msg.to.id === $authStore.id) &&
      (msg.from.id === partnerId || msg.to.id === partnerId)
    );
  });

  async function sendMessage(msg: string): Promise<void> {
    let sentMsg = null;
    if (msg) {
      sentMsg = await postMessage(msg, $authStore, $partner.data);
    }
    if (sentMsg) {
      //sent reset
      message = null;
    }
  }

  function isFirstMessage(message, index) {
    // const previousMessage = $messages.data[index - 1];
    // if (message.isTitle) return false;
    // if (
    //   !previousMessage ||
    //   previousMessage.type !== message.type ||
    //   previousMessage.name !== message.name
    // )
    //   return true;
    // return false;
    return false;
  }
  function isLastMessage(message, index) {
    // const nextMessage = $messages.data[index + 1];
    // if (message.isTitle) return false;
    // if (
    //   !nextMessage ||
    //   nextMessage.type !== message.type ||
    //   nextMessage.name !== message.name
    // )
    //   return true;
    // return false;
    return false;
  }
  function isTailMessage(message, index) {
    // const nextMessage = $messages.data[index + 1];
    // if (message.isTitle) return false;
    // if (
    //   !nextMessage ||
    //   nextMessage.type !== message.type ||
    //   nextMessage.name !== message.name
    // )
    //   return true;
    // return false;
    return false;
  }
</script>

<Page>
  <Navbar backLink>
    <NavRight
      ><div class="flex gap-2">
        {$partner.data?.username}<Avatar />
      </div></NavRight
    >
  </Navbar>
  <Messagebar
    placeholder="sdsd"
    value={message}
    onChange={(e) => {
      message = e.target.value;
    }}
    onInput={(e) => {}}
  >
    <a class="link icon-only" slot="inner-start" on:click={() => {}}>
      <Camera />
    </a>
    <a
      class="link icon-only"
      slot="inner-end"
      on:click={() => sendMessage(message)}
    >
      <Send />
    </a>
    <MessagebarAttachments />
    <MessagebarSheet />
  </Messagebar>
  <PageContent class="p-0">
    {#if $messages.isSuccess}
      <Messages class="justify-end">
        <MessagesTitle><b>Sunday, Feb 9,</b> 12:58</MessagesTitle>
        {#each currentMessages as message, index (index)}
          <F7Message
            type={message.from.id === $authStore.id ? "sent" : "received"}
            htmlText={message.content}
          />
        {/each}
      </Messages>
    {/if}
  </PageContent>
</Page>
