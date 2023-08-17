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
  import { minutesAgoFromTimestamp } from "../lib/utils";
  import { getUnixTime } from "date-fns";

  export let partnerId: string = null;
  let messagebarInstance;
  let message: string | null = null;

  onMount(() => {
    f7ready(() => {
      messagebarInstance = f7.messagebar.get(".messagebar");
    });
  });

  const users = createQuery<User[]>(["users"]);

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

  $: currentPartner = $users.data.find((user) => user.id === partnerId);

  async function sendMessage(msg: string): Promise<void> {
    let sentMsg = null;
    if (msg) {
      sentMsg = await postMessage(msg, $authStore, currentPartner);
    }
    if (sentMsg) {
      //sent reset
      message = null;
    }
  }

  function isFirstMessage(message, index) {
    const previousMessage = currentMessages[index - 1];
    // if (message.isTitle) return false;
    if (
      !previousMessage ||
      previousMessage.from.id !== message.from.id ||
      Math.round(new Date(message.created).getTime() / 1000) >
        Math.round(new Date(previousMessage.created).getTime() / 1000) + 240
      //   || previousMessage.name !== message.name
    ) {
      return true;
    } else {
      return false;
    }

    // return false;
  }
  function isLastMessage(message, index) {
    const nextMessage = currentMessages[index + 1];
    // if (message.isTitle) return false;
    if (
      !nextMessage ||
      nextMessage.from.id !== message.from.id

      //  || nextMessage.name !== message.name
    ) {
      return true;
    } else {
      return false;
    }
    //   return true;
    // return false;
    return false;
  }
  function isTailMessage(message, index) {
    const nextMessage = currentMessages[index + 1];
    // if (message.isTitle) return false;
    if (
      !nextMessage ||
      nextMessage.from.id !== message.from.id
      //  || nextMessage.name !== message.name
    ) {
      return true;
    } else {
      return false;
    }
    //   return true;
    // return false;
    return false;
  }
</script>

<Page class="">
  <Navbar class="h-[3.75rem]" backLink>
    <NavRight
      ><div class="flex gap-2 items-center">
        <p>{currentPartner?.username}</p>
        <Avatar seed={partnerId} />
      </div></NavRight
    >
  </Navbar>
  <Messagebar
    resizable={false}
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
  <PageContent class="p-0 pt-4 no-scrollbar bg-zinc-950">
    {#if $messages.isSuccess}
      <Messages class="justify-end">
        <MessagesTitle
          ><b>{currentMessages[0].created.slice(0, 10)}</b></MessagesTitle
        >
        {#each currentMessages as message, index (index)}
          <F7Message
            class="text-md py-[0.05rem]"
            first={isFirstMessage(message, index)}
            last={isLastMessage(message, index)}
            tail={isTailMessage(message, index)}
            header={isFirstMessage(message, index)
              ? minutesAgoFromTimestamp(message.created)
              : ""}
            type={message.from.id === $authStore.id ? "sent" : "received"}
            htmlText={message.content}
          />
        {/each}
      </Messages>
    {/if}
  </PageContent>
</Page>
