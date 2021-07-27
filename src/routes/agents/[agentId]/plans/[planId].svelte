<script context="module" lang="ts">
  import { getLabels, getAgents, getPlan, updatePlan } from "$lib/api";
  import type { Agent, Label, Plan, FlashType } from "$lib/types";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentId = page.params.agentId;
    const planId = page.params.planId;
    let flashMessage: string | undefined;
    let flashType: FlashType;
    let labels: Label[] = [];
    let agents: Agent[] = [];
    let plan: Plan;
    const labelResponse = await getLabels(fetch, agentId);

    if (labelResponse.ok) {
      const { data, errors } = await labelResponse.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
      } else {
        labels = data.labels;
      }
    } else {
      const { message } = await labelResponse.json();
      flashMessage = message;
    }

    const agentResponse = await getAgents(fetch);

    if (agentResponse.ok) {
      const { data, errors } = await agentResponse.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
      } else {
        agents = data.agents;
      }
    } else {
      const { message } = await agentResponse.json();
      flashMessage = message;
    }

    const planResponse = await getPlan(fetch, planId);

    if (planResponse.ok) {
      const { data, errors } = await planResponse.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
      } else {
        plan = data.plan;
      }
    } else {
      const { message } = await agentResponse.json();
      flashMessage = message;
    }

    return {
      props: { labels, agents, plan, flashMessage, flashType, agentId, planId },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import DropdownFilterInput from "$lib/DropdownFilterInput.svelte";
  import clickOutside from "$lib/clickOutside";
  import type { Process } from "$lib/types";
  import { createProcess, deleteProcess } from "$lib/api";

  export let labels: Label[];
  export let agents: Agent[];
  export let plan: Plan;
  export let agentId: string;
  export let planId: string;

  let planTitle = plan.title;
  let planDescription = plan.description;
  let processes: Process[] = plan.processes || [];
  let modalOpen = false;
  let creatingNewProcess = false;
  let processTitle = "";
  let processDescription = "";
  let agentDropdown: DropdownFilterInput;
  let agentUlid = agents.filter(({ uniqueName }) => uniqueName == agentId)[0]
    .id;
  let processAgents: string[] = [agentUlid];
  let labelDropdown: DropdownFilterInput;
  let processLabels: string[] = [];
  let processDueDate: Date | undefined;
  let processStartDate: Date | undefined;
  let loadingOverlay = false;

  export let flashMessage: string | undefined;
  export let flashType: FlashType;

  function filter<T>(array: Array<T>, searchValue: string): Array<T> {
    return array.filter((element: T) =>
      Object.values(element).some((elementValue: string) => {
        let content: string;
        if (!elementValue) {
          return false;
        } else {
          content = elementValue.toLocaleLowerCase();
        }
        return content.includes(searchValue);
      })
    );
  }

  async function handleUpdatePlan() {
    try {
      const response = await updatePlan({
        id: planId,
        title: planTitle,
        description: planDescription,
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      }
      if (data.updatePlan == 0) {
        flashMessage = "Failed to update";
        flashType = "ERROR";
        return;
      }
      flashMessage = "Update successful";
      flashType = "SUCCESS";
    } catch (error) {
      flashMessage = error.toString();
      flashType = "ERROR";
    }
  }

  async function handleCreateProcess() {
    loadingOverlay = true;
    try {
      const response = await createProcess({
        title: processTitle,
        description: processDescription,
        labels: processLabels,
        startDate: processStartDate,
        dueDate: processDueDate,
        agentId,
        planId,
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      }

      const { createProcess: created } = data;
      processes = [...processes, created];
      processTitle = "";
      processDescription = "";
      processLabels = [];
      processStartDate = undefined;
      processDueDate = undefined;
      creatingNewProcess = false;
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }

  async function handleDeleteProcess(processId) {
    loadingOverlay = true;
    try {
      const response = await deleteProcess(processId);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      } else if (data.deleteProcess == 0) {
        flashMessage = "Deletion failed";
        flashType = "ERROR";
        return;
      }

      processes = processes.filter((process) => process.id != processId);
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }
</script>

<svelte:head>
  <title>Organizing work</title>
</svelte:head>

<Flash message={flashMessage} type={flashType} />

{#if modalOpen}
  <div
    class="fixed z-10 inset-0 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!--
      Background overlay, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      />

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true">&#8203;</span
      >

      <!--
      Modal panel, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        To: "opacity-100 translate-y-0 sm:scale-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100 translate-y-0 sm:scale-100"
        To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    -->

      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6"
        use:clickOutside
        on:click_outside={() => (modalOpen = false)}
      >
        <!-- <div class="space-y-6">
          <div class="bg-white px-4 py-5 sm:rounded-lg sm:p-6">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1 flex flex-col space-y-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  Create a process
                </h3>

                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add label
                </button>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <form class="space-y-6" action="#" method="POST">
                  <div class="grid grid-cols-3 gap-6">
                    <div class="col-span-3 sm:col-span-2">
                      <label
                        for="processTitle"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Title
                      </label>
                      <div class="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="processTitle"
                          id="processTitle"
                          class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                          placeholder="Keep calm and carry on"
                          bind:value={processTitle}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <div class="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Always start at the beginning"
                        bind:value={processDescription}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="flex justify-center">
            <button
              type="button"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              on:click={() => (modalOpen = false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              on:click|preventDefault={handleCreateProcess}
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
          </div>
        </div> -->
      </div>
    </div>
  </div>
{/if}

<div class="max-w-7xl my-4 mx-auto px-4 sm:px-6 lg:px-8 ">
  <div class="max-w-2xl mx-auto">
    <form class="space-y-8 divide-y divide-gray-200">
      <div class="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Edit a plan
            </h3>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <label
                for="title"
                class="block text-sm font-medium text-gray-700"
              >
                Plan title
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="title"
                  id="title"
                  class="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  bind:value={planTitle}
                  placeholder="Change the world"
                />
              </div>
            </div>

            <div class="sm:col-span-6">
              <label
                for="description"
                class="block text-sm font-medium text-gray-700"
              >
                Plan description
              </label>
              <div class="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  bind:value={planDescription}
                  placeholder="Start from the begining"
                />
              </div>
            </div>

            {#if loadingOverlay}
              <Loader />
            {/if}

            {#each processes as process (process.id)}
              <div
                class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-3 sm:col-start-2"
              >
                <div class="px-4 py-5 sm:px-6 flex justify-between">
                  <h3>{process.title}</h3>
                  <button
                    type="button"
                    on:click={() => handleDeleteProcess(process.id)}
                    class="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <!-- Heroicon name: solid/plus -->
                    <svg
                      class="h-5 w-5 transform rotate-45"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd"
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
              </div>
            {/each}
            {#if creatingNewProcess}
              <div
                class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 sm:col-span-3 sm:col-start-2"
              >
                <div class="px-4 py-5 sm:px-6 bg-gray-100">
                  <label
                    for="processTitle"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Process title
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="processTitle"
                      id="processTitle"
                      class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      placeholder="Keep calm and carry on"
                      bind:value={processTitle}
                    />
                  </div>
                </div>
                <div class="px-4 py-5 sm:p-6 text-sm bg-gray-100">
                  <label
                    for="description"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Process description
                  </label>
                  <div class="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Always start at the beginning"
                      bind:value={processDescription}
                    />
                  </div>
                </div>

                <div
                  use:clickOutside
                  on:click_outside={() => agentDropdown.closeDropdown()}
                >
                  <DropdownFilterInput
                    label="In scope of"
                    placeholder={agentId}
                    description="Can be a Person, an organization, a team or a project"
                    list={agents}
                    filteredList={agents}
                    text={(el) => el.name}
                    bind:selectedList={processAgents}
                    bind:this={agentDropdown}
                  />
                </div>

                <div
                  use:clickOutside
                  on:click_outside={() => labelDropdown.closeDropdown()}
                >
                  <DropdownFilterInput
                    label="Labels"
                    placeholder="Love"
                    description={undefined}
                    list={labels}
                    filteredList={labels}
                    text={(el) => el.name}
                    color={(el) => el.color}
                    bind:selectedList={processLabels}
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
                      class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      on:click={() => (creatingNewProcess = false)}
                    >
                      Cancel
                    </button>
                    <button
                      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      on:click|preventDefault={handleCreateProcess}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            {:else}
              <div class="sm:col-span-6 flex justify-center">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  on:click={() => {
                    creatingNewProcess = true;
                  }}
                >
                  Add process
                </button>
              </div>
            {/if}
          </div>
        </div>

        <div class="pt-5">
          <div class="flex justify-center">
            <button
              type="button"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              on:click|preventDefault={handleUpdatePlan}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
