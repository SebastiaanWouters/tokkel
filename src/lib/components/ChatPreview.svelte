<script lang="ts">
  import { goto } from "elegua";
  import Avatar from "./Avatar.svelte";
  import type { User } from "../pocketbase";
  import { minutesAgoFromTimestamp, truncateContent } from "../utils";
  import { onDestroy, onMount } from "svelte";

  export let user: User;
  export let content: string;
  export let date: string;

  let minutesAgo = minutesAgoFromTimestamp(date);

  // Function to update the minutesAgo value
  const updateMinutesAgo = (date) => {
    minutesAgo = minutesAgoFromTimestamp(date);
  };

  $: updateMinutesAgo(date);

  let interval;
  onMount(() => {
    interval = setInterval(updateMinutesAgo, 20000); // 60 seconds
  });

  // Clear the interval when the component is destroyed
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<button
  class="cursor-pointer p-4 flex justify-between gap-3 border-white/5 border-b hover:bg-neutral-800 transition-all"
  on:click={() => {
    goto(`/chat/${user.id}`);
  }}
>
  <div class="flex gap-3 items-center">
    <Avatar lg={true} />
    <div class="flex flex-col text-left whitespace-pre-wrap">
      <p class="">{user.username}</p>
      <p
        class="text-xs text-white/60 max-w-[14rem]"
        style="overflow-wrap: break-word;"
      >
        {truncateContent(content, 24)}
      </p>
    </div>
  </div>
  <div class="flex flex-col">
    <p class="text-xs text-white/60">{minutesAgo}</p>
  </div>
</button>
