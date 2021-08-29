<script lang="ts">
  import Loader from "$lib/Loader.svelte";
  import CommitmentForm from "$lib/CommitmentForm.svelte";
  import type { Commitment } from "$lib/types";
  import clickOutside from "$lib/clickOutside";
  export let agents;
  export let actions;
  export let resourceSpecifications;
  export let units;
  export let commitment: Commitment;
  export let onDelete;
  export let onUpdate;

  let isEditing = false;

  let loadingOverlay = false;
  // Input
  let commitmentForm: CommitmentForm;
</script>

{#if loadingOverlay}
  <Loader />
{/if}

<div
  class="{isEditing
    ? 'bg-gray-200'
    : 'bg-white'} overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-2 my-4"
>
  {#if isEditing}
    <div
      class="px-4 py-5 sm:px-6 h-full flex flex-col justify-between items-center"
    >
      <div
        use:clickOutside
        class="grid grid-cols-1 gap-y-6 gap-x-4"
        on:click_outside={() => commitmentForm.closeDropdown()}
      >
        <CommitmentForm
          bind:commitment
          bind:this={commitmentForm}
          {actions}
          {agents}
          {units}
          {resourceSpecifications}
          handleSubmit={() => {
            isEditing = false;
            onUpdate();
          }}
          handleCancel={onDelete}
          cancelText="Delete"
        />
      </div>
    </div>
  {:else}
    <div class="px-4 py-5 sm:px-6 flex justify-between">
      <h3>{commitment.description || "No description"}</h3>
      <button
        type="button"
        on:click={() => (isEditing = true)}
        class="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-black  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <!-- Heroicon name: solid/plus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>
    </div>
    <div class="px-4 py-5 sm:p-4">
      <ul class="flex flex-wrap justify-center">
        <li>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {commitment.action.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {commitment.quantity}
            {commitment.unit.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {commitment.resourceSpecification.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        </li>
      </ul>
    </div>
  {/if}
</div>
