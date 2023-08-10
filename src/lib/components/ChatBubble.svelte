<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    minutesAgoFromTimestamp,
    parseMessage,
    type ParsedMessage,
    MessageType,
  } from "../utils";
  import { currentUser, type Message } from "../pocketbase";
  import "youtube-video-js";

  export let message: Message;
  export let modalOpen: boolean;
  export let src: string;
  let parsedMessage: ParsedMessage = null;

  let owner = false;
  let minutesAgo = minutesAgoFromTimestamp(message.created);

  // Function to update the minutesAgo value
  const updateMinutesAgo = () => {
    minutesAgo = minutesAgoFromTimestamp(message.created);
  };

  // Check if the message is from the current user
  $: owner = message.from.id === $currentUser.id;

  // Update the time every 60 seconds (adjust interval as needed)
  let interval;
  onMount(() => {
    parsedMessage = parseMessage(message.content);
    interval = setInterval(updateMinutesAgo, 20000); // 60 seconds
  });

  // Clear the interval when the component is destroyed
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div
  class="flex flex-col gap-1 w-fit"
  class:self-end={owner}
  class:items-end={owner}
>
  <p class="text-font-muted text-[0.92rem]" class:text-end={owner}>
    {minutesAgo}
  </p>
  <div class="flex flex-col gap-2">
    {#if parsedMessage}
      {#if parsedMessage.type === MessageType.Image}
        <button
          on:click|stopPropagation={() => {
            src = parsedMessage.content;
            modalOpen = true;
          }}
          class="cursor-pointer rounded-t-xl max-w-[16rem] overflow-wrap overflow-hidden"
        >
          <img src={parsedMessage.content} alt="message content" />
        </button>
      {:else}
        <div
          class="rounded-t-xl max-w-[20rem] overflow-wrap overflow-hidden"
          style="overflow-wrap: break-word;"
          class:rounded-bl-xl={owner}
          class:rounded-bl-sm={!owner}
          class:rounded-br-xl={!owner}
          class:rounded-br-sm={owner}
          class:bg-surface-hover={!owner}
          class:bg-primary-700={owner}
        >
          <div class="content text-md">{@html parsedMessage.content}</div>
        </div>
      {/if}
    {/if}
  </div>
</div>
