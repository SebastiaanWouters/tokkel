<script lang="ts">
  import {
    Block,
    BlockTitle,
    Navbar,
    ListInput,
    List,
    Button,
    Checkbox,
    ListItem,
  } from "konsta/svelte";
  import { Link, Page } from "framework7-svelte";
  import { PersonStanding, LockIcon, LogInIcon } from "lucide-svelte";
  import { loginUser } from "../lib/api";
  import { z } from "zod";

  export let f7router;
  let remember = false;
  let username = { value: "", changed: false, error: "" };
  let password = { value: "", changed: false, error: "" };

  const onNameChange = (e) => {
    validateUserName();
    username = { ...username, value: e.target.value, changed: true };
  };
  const onPassChange = (e) => {
    validatePassword();
    password = { ...password, value: e.target.value, changed: true };
  };

  const schema = z.object({
    username: z.string().min(5).max(16),
    password: z.string().min(8).max(32),
  });

  const validateUserName = () => {
    try {
      schema.shape.username.parse(username.value);
      username.error = "";
    } catch {
      username.error = "fail";
    }
  };

  const validatePassword = () => {
    try {
      schema.shape.password.parse(password.value);
      password.error = "";
    } catch {
      password.error = "fail";
    }
  };

  async function attemptLogin() {
    const res = await loginUser(username.value, password.value);
    if (res.error) {
      return;
    }
    f7router.navigate("/");
  }
</script>

<Page name="login">
  <div class="dark h-full flex flex-col justify-center items-center px-4">
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
        value={username.value}
        error={username.error}
        onInput={onNameChange}
      >
        <PersonStanding slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Password"
        type="password"
        placeholder="Your Password"
        info="Keep this password safe"
        value={password.value}
        error={password.error}
        onInput={onPassChange}
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
      <Button
        large
        onClick={() => {
          attemptLogin();
        }}
        ><div class="flex items-center">
          {"Login "}<LogInIcon class="ml-1 h-5 w-7 mt-[0.1rem]" />
        </div></Button
      >
      <p class="text-zinc-400">
        No account yet? <Link class="text-primary" href="/register"
          >Register</Link
        >
      </p>
    </div>
  </div>
</Page>
