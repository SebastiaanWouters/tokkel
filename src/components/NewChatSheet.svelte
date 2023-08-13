<script lang="ts">
  import { Button, Link, PageContent, Sheet } from "framework7-svelte";
  import { Block, Toolbar } from "konsta/svelte";

  export let opened;
</script>

<Sheet
  style="height: 80%; background: #111;"
  closeByOutsideClick
  {opened}
  onSheetClosed={() => (opened = false)}
>
  <Button fill large sheetClose>Close</Button>

  <Block />
</Sheet>
