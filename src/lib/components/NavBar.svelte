<script lang="ts">
  import NavItem from "./NavItem.svelte";
  import { Settings, Home } from "lucide-svelte";
  import { path } from "elegua";
  import { goto } from "elegua";
</script>

<div class="flex justify-between py-2.5 border-border border-t border-b">
  <NavItem>
    <button
      class="cursor-pointer contents"
      on:click={() => {
        goto("/chat");
      }}
    >
      <Home
        class="transition-all"
        color={$path === "/chat"
          ? "var(--text-color)"
          : "var(--muted-text-color)"}
      />
      <p class="transition-all" class:text-font-muted={!($path === "/chat")}>
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
        color={$path === "/settings"
          ? "var(--text-color)"
          : "var(--muted-text-color)"}
      />
      <p
        class="transition-all"
        class:text-font-muted={!($path === "/settings")}
      >
        Settings
      </p>
    </button>
  </NavItem>
</div>
