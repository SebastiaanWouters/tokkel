<script>
  import { activeTab, activeChatTab } from "../lib/nav";
  import Chats from "./Chats.svelte";
  import Chat from "./Chat.svelte";
  import Settings from "./Settings.svelte";
</script>

<div class="grid grid-rows-[auto_1fr_auto] fill">
  <slot name="topNav" />
  <slot name="middle" />
  <slot name="bottomNav" />
</div>
