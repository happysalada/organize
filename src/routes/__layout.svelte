<script lang="ts">
  import "../global.css";
  import Nav from "$lib/Nav.svelte";
  import Footer from "../lib/Footer.svelte";
  import { onMount } from "svelte";

  let loaded = false;

  import { page } from "$app/stores";
  onMount(async () => {
    loaded = true;
  });
</script>

<div class="grid">
  <nav class="nav">
    <Nav path={$page.path} />
  </nav>

  <main class="main h-full">
    <slot />
  </main>

  <footer class="footer">
    <Footer />
  </footer>
</div>

<style lang="postcss">
  /* minmax on the nav is used for expansion on mobile */
  /* minmax on the main is used for long main content */
  .grid {
    display: grid;
    grid-template-rows: minmax(10vh, auto) minmax(80vh, auto) 10vh;
    grid-template-areas:
      "nav"
      "main"
      "footer";
  }

  .nav {
    grid-area: nav;
  }

  .main {
    grid-area: main;
  }

  .footer {
    grid-area: footer;
  }
</style>
