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
  import { PersonStanding, LockIcon, LogInIcon, Loader2 } from "lucide-svelte";
  import { loginUser } from "../lib/api";
  import { z } from "zod";
  import Cookies from "js-cookie";
  import { getDevice } from "framework7";
  import { onMount } from "svelte";

  export let f7router;
  export let newHere = false;
  let deferredPrompt;
  let error: string | null = null;
  let loading = false;
  let remember = false;
  let username = { value: "", changed: false, error: "" };
  let password = { value: "", changed: false, error: "" };

  onMount(() => {
    const cookie = Cookies.get("visited");
    if (cookie) {
      const device = getDevice();
      if ((device.android || device.ios) && !device.webView) {
      }
      //first time visitor
      Cookies.set("visited");
    }

    //install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      deferredPrompt = e;
    });

    const installApp = document.getElementById("installApp");
    installApp.addEventListener("click", async () => {
      if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPrompt = null;
        }
      }
    });
  });

  const onNameChange = (e) => {
    validateUserName();
    username = { ...username, value: e.target.value, changed: true };
  };
  const onPassChange = (e) => {
    validatePassword();
    password = { ...password, value: e.target.value, changed: true };
  };

  const schema = z.object({
    username: z.string().min(5).max(18),
    password: z.string().min(8).max(38),
  });

  const validateUserName = (): boolean => {
    try {
      schema.shape.username.parse(username.value);
      username.error = "";
      return true;
    } catch {
      username.error = "Please enter a valid/unique username";
      return false;
    }
  };

  const validatePassword = (): boolean => {
    try {
      schema.shape.password.parse(password.value);
      password.error = "";
      return true;
    } catch {
      password.error = "Please enter a valid password";
      return false;
    }
  };

  async function attemptLogin() {
    loading = true;
    if (validatePassword() && validateUserName()) {
      const res = await loginUser(username.value, password.value);
      if (res.error) {
        error = "invalid credentials, please try again";
        loading = false;
        return;
      }
      f7router.navigate("/");
      loading = false;
    } else {
      loading = false;
      return;
    }
  }
</script>

<Page name="login">
  <div class="dark h-full flex flex-col justify-center items-center px-4">
    <h1
      class="material:px-4 text-left font-semibold w-full max-w-2xl text-3xl leading-10"
    >
      {#if newHere}
        Account created, please log in
      {:else}
        Login
      {/if}
    </h1>
    {#if error}
      <p class="w-full max-w-2xl text-primary mt-1">{error}</p>
    {/if}
    <List class="w-full max-w-2xl mt-6" strongIos insetIos>
      <ListInput
        class="w-full"
        label="Username"
        type="text"
        placeholder="Your username"
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
          {"Login "}
          {#if !loading}
            <LogInIcon class="ml-1 h-5 w-7" />
          {:else}
            <Loader2 class="animate-spin ml-1 h-5 w-7" />
          {/if}
        </div></Button
      >
      <Button id="installApp">Install</Button>
      <p class="text-zinc-400">
        No account yet? <Link class="text-primary" href="/register"
          >Register</Link
        >
      </p>
    </div>
  </div>
</Page>
