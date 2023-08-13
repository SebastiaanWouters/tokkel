<script>
  import {
    Block,
    BlockTitle,
    Navbar,
    Page,
    ListInput,
    List,
    Button,
    Checkbox,
    ListItem,
  } from "konsta/svelte";
  import { PersonStanding, LockIcon, LogInIcon } from "lucide-svelte";

  let remember = false;
</script>

<Page class="w-full h-full">
  <div class="h-full flex flex-col justify-center items-center px-4">
    <h1
      class="material:px-4 text-left font-semibold w-full max-w-2xl text-3xl leading-6"
    >
      Login
    </h1>
    <List class="w-full max-w-2xl" strongIos insetIos>
      <ListInput
        class="w-full"
        label="Username"
        type="text"
        placeholder="Your desired username"
        info=""
        value={""}
        error={false ? "Please specify your name" : ""}
        onInput={() => {}}
      >
        <PersonStanding slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Password"
        type="password"
        placeholder="Your Password"
        info="Keep this password safe"
        value={""}
        error={false ? "Please specify your name" : ""}
        onInput={() => {}}
      >
        <LockIcon slot="media" />
      </ListInput>
    </List>
    <List class="material:px-4 pt-0 mt-0 w-full max-w-2xl" strongIos insetIos>
      <ListItem label title="Remember me">
        <Checkbox
          slot="media"
          component="div"
          name="demo-checkbox"
          checked={remember}
          onChange={() => {
            remember = !remember;
          }}
        />
      </ListItem></List
    >

    <div
      class="w-full max-w-2xl material:px-4 flex flex-col gap-3 justify-center"
    >
      <Button large
        ><div class="flex items-center">
          {"Login "}<LogInIcon class="ml-1 h-5 w-7 mt-[0.1rem]" />
        </div></Button
      >
      <p class="text-zinc-400">
        No account yet? <a class="text-primary" href="/register">Register</a>
      </p>
    </div>
  </div>
</Page>
