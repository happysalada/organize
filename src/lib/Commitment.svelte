<script lang="ts">
  import DropdownFilterSingleInput from "./DropdownFilterSingleInput.svelte";
  import DatePicker from "@beyonk/svelte-datepicker/src/components/DatePicker.svelte";
  import type { Action, Agent, Unit } from "$lib/types";
  // Actions
  export let actions: Action[];
  export let actionId: string | undefined;
  export let description: string | undefined;
  let actionDropdown: DropdownFilterSingleInput;
  // Agents
  export let agents: Agent[];
  export let agentId: string | undefined;
  export let quantity = 0;
  let agentDropdown: DropdownFilterSingleInput;
  // Units
  export let units: Unit[];
  export let unitId: string | undefined;
  let unitDropdown: DropdownFilterSingleInput;
  // dueAt
  export let dueAt: Date | undefined;

  export let processId: string | undefined;
  export let handleCreate;

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
</script>

<DropdownFilterSingleInput
  label="Action"
  placeholder="work"
  description=""
  list={actions}
  filteredList={actions}
  text={(el) => el.name}
  bind:selected={actionId}
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
      bind:value={description}
      placeholder="Start from the begining"
    />
  </div>
</div>

<DropdownFilterSingleInput
  label="Assign to"
  placeholder=""
  description=""
  list={agents}
  filteredList={agents}
  text={(el) => el.name}
  bind:selected={agentId}
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
        bind:value={quantity}
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
    bind:selected={unitId}
    bind:this={unitDropdown}
  />
</div>
<div>
  <DatePicker bind:selected={dueAt}>
    {#if dueAt}
      <p>Due date {dayjs(dueAt).fromNow()}</p>
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
    on:click={() => {
      processId = undefined;
    }}
  >
    Cancel
  </button>
  <button
    class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    on:click|preventDefault={handleCreate}
  >
    Save
  </button>
</div>
