<script lang="ts">
  import type { FlashType } from "$lib/types";
  export let message: string | undefined;
  export let type: FlashType;

  $: setTimeout(() => (message = undefined), 10000);
</script>

{#if message}
  <div class="relative bg-{type === 'ERROR' ? 'red' : 'indigo'}-600">
    <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
      <div class="pr-16 sm:text-center sm:px-16">
        <p class="font-medium text-white">
          <span class="md:hidden">{message}</span>
          <span class="hidden md:inline">
            {message}
          </span>
          <!-- <span class="block sm:ml-2 sm:inline-block">
            <a href="#" class="text-white font-bold underline">
              Learn more <span aria-hidden="true">&rarr;</span></a
            >
          </span> -->
        </p>
      </div>
      <div
        class="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start"
      >
        <button
          type="button"
          class="flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
          on:click={() => (message = undefined)}
        >
          <span class="sr-only">Dismiss</span>
          <!-- Heroicon name: outline/x -->
          <svg
            class="h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}
