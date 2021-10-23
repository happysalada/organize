<script lang="ts">
  import DropdownFilterSingleInput from "./DropdownFilterSingleInput.svelte";
  import "es6-object-assign/auto.js";
  import DatePicker from "@beyonk/svelte-datepicker/src/components/DatePicker.svelte";
  import type {
    Action,
    Agent,
    NewCommitment,
    ResourceSpecification,
    Unit,
  } from "$lib/types";
  export let commitment: NewCommitment;
  // Actions
  export let actions: Action[];
  let actionDropdown: DropdownFilterSingleInput;
  // Resource specification
  export let resourceSpecifications: ResourceSpecification[];
  let resourceSpecificationDropdown: DropdownFilterSingleInput;
  // Agents
  export let agents: Agent[];
  let agentDropdown: DropdownFilterSingleInput;
  // Units
  export let units: Unit[];
  let unitDropdown: DropdownFilterSingleInput;

  export let handleSubmit;
  export let handleCancel;
  export let cancelText: string;

  export const closeDropdown = () => {
    actionDropdown.closeDropdown();
    agentDropdown.closeDropdown();
    unitDropdown.closeDropdown();
  };

  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  // prevent error on page reload
  if (dayjs) {
    dayjs.extend(relativeTime);
  }

  const validations = (commitment) => ({
    action: {
      condition() {
        return commitment.actionId !== undefined
      },
      message: "This commitment needs an action, please select one with the dropdown"
    },
    resourceSpecification: {
      condition() {
        return commitment.resourceSpecificationId !== undefined
      },
      message: "This commitment needs a resource type, please select one with the dropdown"
    },
    unit: {
      condition() {
        return commitment.unitId !== undefined
      },
      message: "This commitment needs a unit, please select one with the dropdown"
    },
    quantity: {
      condition() {
        return commitment.quantity !== 0
      },
      message: "This commitment needs a quantity, please input one"
    }
  });

  $: allValid = Object.values(validations(commitment)).map(validation => validation.condition()).every(bool => bool)
  $: errors = Object.values(validations(commitment)).filter(validation => !validation.condition()).map(validation => validation.message)
  
  let renderError = false;

  const validate = function(): boolean {
    renderError = true;
    return allValid
  };
</script>

{#if renderError && !allValid }
<div class="rounded-md bg-red-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <!-- Heroicon name: solid/x-circle -->
      <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        Oops, we found an error
      </h3>
      <div class="mt-2 text-sm text-red-700">
        <ul role="list" class="list-disc pl-5 space-y-1">
          {#each errors as errorMessage}
          <li>
            {errorMessage}
          </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>
{/if}

<DropdownFilterSingleInput
  label="Action"
  placeholder="work"
  description=""
  list={actions}
  filteredList={actions}
  text={(el) => el.name}
  bind:selected={commitment.actionId}
  bind:this={actionDropdown}
/>

<div>
  <label for="description" class="block text-sm font-medium text-gray-700">
    Description
  </label>
  <div class="mt-1">
    <textarea
      id="inputDescription"
      name="inputDescription"
      rows="3"
      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
      bind:value={commitment.description}
      placeholder="Start from the begining"
    />
  </div>
</div>

<DropdownFilterSingleInput
  label="Resource type"
  placeholder="document"
  description=""
  list={resourceSpecifications}
  filteredList={resourceSpecifications}
  text={(el) => el.name}
  bind:selected={commitment.resourceSpecificationId}
  bind:this={resourceSpecificationDropdown}
/>

<DropdownFilterSingleInput
  label="Assign to"
  placeholder=""
  description=""
  list={agents}
  filteredList={agents}
  text={(el) => el.name}
  selected={commitment.assignedAgentId}
  bind:this={agentDropdown}
/>

<div class="flex justify-center">
  <div class="">
    <label for="inputQuantity" class="block text-sm font-medium text-gray-700">
      Quantity
    </label>
    <div class="mt-1 flex rounded-md shadow-sm">
      <input
        type="number"
        name="inputQuantity"
        id="inputQuantity"
        class="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
        bind:value={commitment.quantity}
        placeholder="Change the world"
      />
    </div>
  </div>
  <DropdownFilterSingleInput
    label="Unit"
    placeholder="hour"
    description=""
    list={units}
    filteredList={units}
    text={(el) => el.label}
    bind:selected={commitment.unitId}
    bind:this={unitDropdown}
  />
</div>
<div>
  <DatePicker bind:selected={commitment.dueAt}>
    {#if commitment.dueAt}
      <p>Due date {dayjs(commitment.dueAt).fromNow()}</p>
      <button
        class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        on:click|preventDefault
      >
        Edit due date
      </button>
    {:else}
      <button
        class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        on:click|preventDefault
      >
        Add due date
      </button>
    {/if}
  </DatePicker>
</div>
<div class="flex justify-center">
  <button
    type="button"
    class="bg-red-500 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    on:click|preventDefault={handleCancel}
  >
    {cancelText}
  </button>
  <button
    class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    on:click|preventDefault={(e) => validate() && handleSubmit(e)}
  >
    Save
  </button>
</div>
