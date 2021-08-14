<script context="module" lang="ts">
  import { query, updatePlan } from "$lib/api";
  import type {
    Action,
    Agent,
    Label,
    Plan,
    FlashType,
    ResourceSpecification,
    Unit,
  } from "$lib/types";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentUniqueName = page.params.agentUniqueName;
    const planId = page.params.planId;
    let flashMessage: string | undefined;
    let flashType = "ERROR";
    let labels: Label[] = [];
    let agents: Agent[] = [];
    let actions: Action[] = [];
    let units: Unit[] = [];
    let resourceSpecifications: ResourceSpecification[] = [];
    let plan: Plan;
    const response = await query(
      fetch,
      `{
        labels(agentUniqueName: "${agentUniqueName}") {
          id, name, color, uniqueName
        }
        resourceSpecifications(agentUniqueName: "${agentUniqueName}") {
          id, name, uniqueName
        }
        agents {id, name, uniqueName, email }
        plan(planId: "${planId}") {
          id, title, description, processes {
            id, title, description,
            labels {
              id, name, color
            }
            agents {
              id, name, uniqueName
            }
            commitments {
              id, description
              action {
                id, name
              }
              resourceSpecification {
                id, name
              }
              unit {
                id, label
              }
            }
          }
        } 
        actions { id, name, inputOutput }
        units { id, label }
      }`
    );

    if (response.ok) {
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(flashMessage);
      } else {
        ({ labels, agents, resourceSpecifications, plan, actions, units } =
          data);
      }
    } else {
      const { message } = await response.json();
      flashMessage = message;
    }

    return {
      props: {
        labels,
        agents,
        resourceSpecifications,
        plan,
        flashMessage,
        flashType,
        agentUniqueName,
        planId,
        actions,
        units,
      },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import ProcessComponent from "$lib/Process.svelte";
  import ProcessForm from "$lib/ProcessForm.svelte";
  import type { Process } from "$lib/types";
  import { createProcess, updateProcess, deleteProcess } from "$lib/api";

  export let labels: Label[];
  export let agents: Agent[];
  export let actions: Action[];
  export let units: Unit[];
  export let resourceSpecifications: ResourceSpecification[];
  export let plan: Plan;
  export let agentUniqueName: string;
  export let planId: string;

  let mainAgent = agents.filter(
    ({ uniqueName }) => uniqueName == agentUniqueName
  )[0];

  // Plan
  let planTitle = plan.title;
  let planDescription = plan.description;
  let processes: Process[] = plan.processes || [];
  // Process
  let creatingNewProcess = false;
  const initialNewProcess = {
    title: "",
    description: "",
    labels: [],
    agents: [mainAgent],
    startDate: undefined,
    dueDate: undefined,
    planId,
  };
  let newProcess = Object.assign({}, initialNewProcess);

  let loadingOverlay = false;
  export let flashMessage: string | undefined;
  export let flashType: FlashType;

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
    let createParams = {
      ...newProcess,
      labels: newProcess.labels.map(({ id }) => id),
      agents: newProcess.agents.map(({ id }) => id),
    };
    try {
      const response = await createProcess(createParams);
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
      newProcess = Object.assign({}, initialNewProcess);
      creatingNewProcess = false;
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }

  async function handleDeleteProcess(processId: string) {
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
      newProcess = Object.assign({}, initialNewProcess);
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }

  async function handleUpdateProcess(process: Process) {
    loadingOverlay = true;
    let updateParams = {
      ...process,
      labels: process.labels.map(({ id }) => id),
      agents: process.agents.map(({ id }) => id),
    };
    try {
      const response = await updateProcess(updateParams);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      } else if (data.updateProcess == 0) {
        flashMessage = "update failed";
        flashType = "ERROR";
        return;
      }
      let updatedProcessIndex = processes.findIndex(
        ({ id }) => id == process.id
      );
      processes[updatedProcessIndex] = process;
      newProcess = Object.assign({}, initialNewProcess);
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

<div class="max-w-7xl my-4 mx-auto px-4 sm:px-6 lg:px-8 ">
  <div class="max-w-4xl mx-auto">
    <form class="space-y-8 divide-y divide-gray-200">
      <div class="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 text-center">
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
              <ProcessComponent
                {agents}
                {actions}
                {units}
                {labels}
                {resourceSpecifications}
                bind:process
                {agentUniqueName}
                {flashMessage}
                {flashType}
                onDelete={() => handleDeleteProcess(process.id)}
                onUpdate={() => handleUpdateProcess(process)}
              />
            {/each}

            {#if creatingNewProcess}
              <ProcessForm
                {agents}
                {labels}
                {agentUniqueName}
                bind:process={newProcess}
                onSubmit={handleCreateProcess}
                onCancel={() => (creatingNewProcess = false)}
              />
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
