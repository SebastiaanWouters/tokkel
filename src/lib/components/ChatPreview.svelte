<script lang="ts">
  import { goto } from "elegua";
  import Avatar from "./Avatar.svelte";
  import type { User } from "../pocketbase";
  import { truncateContent } from "../utils";

  export let user: User;
  export let content: string;
  export let date: string;
</script>

<button
  class="cursor-pointer p-4 flex justify-between gap-3 border-white/5 border-b"
  on:click={() => {
    goto(`/chat/${user.id}`);
  }}
>
  <div class="flex gap-3">
    <Avatar />
    <div class="flex flex-col text-left whitespace-pre-wrap">
      <p>{user.username}</p>
      <p
        class="text-xs text-white/60 max-w-[14rem]"
        style="overflow-wrap: break-word;"
      >
        {truncateContent(content, 24)}
      </p>
    </div>
  </div>
  <div class="flex flex-col">
    <p class="text-xs text-white/60">{date}</p>
  </div>
</button>
