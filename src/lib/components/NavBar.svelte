<script lang="ts">
  import NavItem from "./NavItem.svelte";
  import { Settings, Home } from "lucide-svelte";
  import { path } from "elegua";
  import { activeTab } from "../nav";
  import { goto } from "elegua";
</script>

<div class="fill flex justify-between py-2 border-white/5 border-t">
  <NavItem>
    <button
      class="cursor-pointer contents"
      on:click={() => {
        goto("/home");
      }}
    >
      <Home
        class="transition-all"
        color={$path === "/home" ? "white" : "gray"}
      />
      <p class="transition-all" class:text-gray-400={!($path === "/home")}>
        Home
      </p>
    </button>
  </NavItem>

  <NavItem>
    <button
      class="cursor-pointer contents"
      on:click={() => {
        goto("/settings");
      }}
    >
      <Settings
        class="transition-all"
        color={$path === "/settings" ? "white" : "gray"}
      />
      <p class="transition-all" class:text-gray-400={!($path === "/settings")}>
        Settings
      </p>
    </button>
  </NavItem>
</div>
