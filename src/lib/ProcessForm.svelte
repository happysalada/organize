<script lang="ts">
  import DropdownFilterMultipleInput from "$lib/DropdownFilterMultipleInput.svelte";
  import clickOutside from "$lib/clickOutside";
  export let process;
  export let agents;
  export let labels;
  export let onSubmit;
  export let onCancel;
  export let cancelText;

  let agentDropdown: DropdownFilterMultipleInput;
  let labelDropdown: DropdownFilterMultipleInput;
</script>

<div
  class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-start-3 sm:col-span-2 "
>
  <div class="px-4 py-5 sm:px-6 bg-gray-100">
    <label for="processTitle" class="block text-sm font-medium text-gray-700">
      Process title
    </label>
    <div class="mt-1 flex rounded-md shadow-sm">
      <input
        type="text"
        name="processTitle"
        id="processTitle"
        class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
        placeholder="Keep calm and carry on"
        bind:value={process.title}
      />
    </div>
  </div>
  <div class="px-4 py-5 sm:p-6 text-sm bg-gray-100">
    <label for="description" class="block text-sm font-medium text-gray-700">
      Process description
    </label>
    <div class="mt-1">
      <textarea
        id="description"
        name="description"
        rows="3"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
        placeholder="Always start at the beginning"
        bind:value={process.description}
      />
    </div>
  </div>

  <div use:clickOutside on:click_outside={() => agentDropdown.closeDropdown()}>
    <DropdownFilterMultipleInput
      label="In scope of"
      placeholder="an agent"
      description="Can be a Person, an organization, a team or a project"
      list={agents}
      filteredList={agents}
      text={(el) => el.name}
      bind:selectedList={process.agents}
      bind:this={agentDropdown}
    />
  </div>

  <div use:clickOutside on:click_outside={() => labelDropdown.closeDropdown()}>
    <DropdownFilterMultipleInput
      label="Labels"
      placeholder="Love"
      description={undefined}
      list={labels}
      filteredList={labels}
      text={(el) => el.name}
      color={(el) => el.color}
      bind:selectedList={process.labels}
      bind:this={labelDropdown}
    />
  </div>

  <div class="px-4 py-5 sm:px-6 bg-gray-100">
    <button
      type="button"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Add due date
    </button>
  </div>

  <div class="px-4 py-5 sm:px-6 bg-gray-100">
    <div class="flex justify-center">
      <button
        type="button"
        class="bg-red-500 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        on:click|preventDefault={onCancel}
      >
        {cancelText}
      </button>
      <button
        class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        on:click|preventDefault={onSubmit}
      >
        Save
      </button>
    </div>
  </div>
</div>
