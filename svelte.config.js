import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte"],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      defaults: {
        style: "postcss",
      },
      postcss: true,
    }),
  ],
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter({
      fallback: "index.html",
    }),
    prerender: {
      enabled: false,
    },
    ssr: false,
    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",
    vite: {
      ssr: {
        noExternal: ["dayjs"],
      },
    },
  },
};

export default config;
