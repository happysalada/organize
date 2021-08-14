<script lang="ts">
  import Loader from "$lib/Loader.svelte";
  import Commitment from "$lib/Commitment.svelte";
  import ProcessForm from "$lib/ProcessForm.svelte";
  import clickOutside from "$lib/clickOutside";
  import type { Process } from "$lib/types";
  import { createCommitment } from "$lib/api";
  export let agents;
  export let actions;
  export let resourceSpecifications;
  export let units;
  export let labels;
  export let process: Process;
  export let flashMessage;
  export let flashType;
  export let agentUniqueName;
  export let onDelete;
  export let onUpdate;

  let inputActions = actions.filter(
    ({ inputOutput }) => inputOutput == "INPUT"
  );
  let outputActions = actions.filter(
    ({ inputOutput }) => inputOutput == "OUTPUT"
  );

  let isEditing = false;
  let createInput = false;
  let createOutput = false;

  let loadingOverlay = false;
  const newCommitment = {
    actionId: undefined,
    agentUniqueName: undefined,
    resourceSpecificationId: undefined,
    unitId: undefined,
    description: "",
    quantity: 0,
    dueAt: undefined,
    processId: process.id,
  };
  // Input
  let inputCommitment = Object.assign({ inputOutput: "INPUT" }, newCommitment);
  let inputComponent: Commitment;
  // Output
  let outputCommitment = Object.assign(
    { inputOutput: "OUTPUT" },
    newCommitment
  );
  let outputComponent: Commitment;

  async function handleCreate(commitment) {
    loadingOverlay = true;
    try {
      const response = await createCommitment(commitment);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      }
      const { createPlan: created } = data;
      process.commitments = [...process.commitments, created];
      process = process;
      commitment = Object.assign({}, newCommitment);
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }
</script>

{#if loadingOverlay}
  <Loader />
{/if}

<div
  class="{createInput
    ? 'bg-gray-200'
    : 'bg-white'} overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-2"
>
  <div
    class="px-4 py-5 sm:px-6 h-full flex flex-col justify-between items-center"
  >
    <h3 class="">Inputs</h3>
    <div class="py-5">
      {#if createInput}
        <div
          use:clickOutside
          class="grid grid-cols-1 gap-y-6 gap-x-4"
          on:click_outside={() => inputComponent.closeDropdown()}
        >
          <Commitment
            bind:this={inputComponent}
            bind:commitment={inputCommitment}
            actions={inputActions}
            {agents}
            {units}
            {resourceSpecifications}
            handleSubmit={() => {
              handleCreate(inputCommitment);
              createInput = false;
            }}
            handleCancel={() => (createInput = false)}
          />
        </div>
      {:else}
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          on:click={() => {
            createInput = true;
          }}
        >
          Add Input
        </button>
      {/if}
    </div>
  </div>
</div>

{#if isEditing}
  <ProcessForm
    {labels}
    {agents}
    bind:process
    {agentUniqueName}
    onSubmit={() => {
      isEditing = false;
      onUpdate();
    }}
    onCancel={onDelete}
  />
{:else}
  <div
    class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-2"
  >
    <div class="px-4 py-5 sm:px-6 flex justify-between">
      <h3>{process.title}</h3>
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
    {#if process.description}
      <div class="px-4 py-2 sm:p-4 text-sm text-center">
        <p>{process.description}</p>
      </div>
    {/if}
    {#if process.labels.length > 0}
      <div class="px-4 py-5 sm:p-4">
        <ul class="flex flex-wrap justify-center">
          {#each process.labels as label (label.id)}
            <li>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{label.color ||
                  'gray'}-100 text-{label.color || 'gray'}-800"
              >
                {label.name}
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
          {/each}
        </ul>
      </div>
    {/if}
    {#if process.agents.length > 0}
      <div class="px-4 py-5 sm:p-4">
        <ul class="flex flex-wrap justify-center">
          {#each process.agents as agent (agent.id)}
            <li>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {agent.name}
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
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

<div
  class="{createOutput
    ? 'bg-gray-200'
    : 'bg-white'} overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-2"
>
  <div
    class="px-4 py-5 sm:px-6 h-full flex flex-col justify-between items-center"
  >
    <h3 class="">Outputs</h3>
    <div class="py-5">
      {#if createOutput}
        <div
          use:clickOutside
          class="grid grid-cols-1 gap-y-6 gap-x-4"
          on:click_outside={() => outputComponent.closeDropdown()}
        >
          <Commitment
            bind:this={outputComponent}
            bind:commitment={outputCommitment}
            actions={outputActions}
            {agents}
            {units}
            {resourceSpecifications}
            handleSubmit={() => {
              handleCreate(outputCommitment);
              createOutput = false;
            }}
            handleCancel={() => (createOutput = false)}
          />
        </div>
      {:else}
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          on:click={() => (createOutput = true)}
        >
          Add Output
        </button>
      {/if}
    </div>
  </div>
</div>
