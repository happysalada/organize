<script context="module" lang="ts">
  import { query, updatePlan } from "$lib/api";
  import type {
    Action,
    Agent,
    Label,
    Plan,
    ResourceSpecification,
    Unit,
  } from "$lib/types";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentUniqueName = page.params.agentUniqueName;
    const planId = page.params.planId;
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
              id, description, quantity, actionId,
              resourceSpecificationId, unitId, assignedAgentId
              action {
                id, name, inputOutput
              }
              resourceSpecification {
                id, name
              }
              unit {
                id, label
              }
              assignedAgent {
                id, name
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
        const flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(flashMessage);
        return {
          props: { flashMessage },
        };
      } else {
        ({ labels, agents, resourceSpecifications, plan, actions, units } =
          data);

        return {
          props: {
            labels,
            agents,
            resourceSpecifications,
            plan,
            agentUniqueName,
            planId,
            actions,
            units,
          },
        };
      }
    } else {
      const { message } = await response.json();
      return {
        props: {
          flashMessage: message,
        },
      };
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { zoom } from "d3-zoom";
  import { select } from "d3-selection";

  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import ProcessComponent from "$lib/Process.svelte";
  import ProcessForm from "$lib/ProcessForm.svelte";
  import type { Process, Commitment, FlashType } from "$lib/types";
  import { createProcess, updateProcess, deleteProcess } from "$lib/api";
  import { inputs, outputs } from "$lib/process";

  export let labels: Label[] = [];
  export let agents: Agent[] = [];
  export let actions: Action[] = [];
  export let units: Unit[] = [];
  export let resourceSpecifications: ResourceSpecification[] = [];
  export let plan: Plan;
  export let agentUniqueName: string;
  export let planId: string;
  export let flashMessage = undefined;
  export let flashType: FlashType = "ERROR";

  let mainAgent = agents.filter(
    ({ uniqueName }) => uniqueName == agentUniqueName
  )[0];

  // Plan
  let planTitle = plan.title;
  let planDescription = plan.description;
  let processes: Process[] = plan.processes || [];

  // svg
  let svg;
  let width = 0;
  let height = 0;
  let g;
  let x = 0;
  let y = 0;
  let k = 1;
  let layoutUnit = 200;
  let objectUnit = 100;

  onMount(() => {
    ({ width, height } = svg.getBoundingClientRect());
    // TODO use for responsive
    // console.log("resize()", width, height);
    select(svg).call(
      zoom().on("zoom", ({ transform }) => {
        ({ k, x, y } = transform);
      })
    );
  });

  function commitmentToNode(
    commitment: Commitment,
    commitmentIndex: number,
    processX: number,
    processY: number,
    processIndex: number
  ): any {
    let xOffset = commitment.action.inputOutput === "INPUT" ? 1 : 3;
    const commitmentX = xOffset + processIndex * 3;
    const commitmentY = 1 + commitmentIndex;
    const label = commitment.action.inputOutput === "INPUT" ? "I" : "O";
    const links =
      commitment.action.inputOutput === "INPUT"
        ? [
            {
              source: { x: commitmentX, y: commitmentY },
              target: { x: processX, y: processY },
              label: "Input of",
            },
          ]
        : [
            {
              source: { x: processX, y: processY },
              target: { x: commitmentX, y: commitmentY },
              label: "Output of",
            },
          ];
    return {
      id: commitment.id,
      title: commitment.description,
      x: commitmentX,
      y: commitmentY,
      label,
      links,
    };
  }
  $: maxHeight = processes.reduce((max, process) => {
    return Math.max(max, inputs(process).length, outputs(process).length);
  }, 1);
  $: nodes = processes.reduce((all, process, processIndex) => {
    const processX = 2 + processIndex * 3;
    const processY = (maxHeight + 1) / 2;
    const inputNodes = inputs(process).map((commitment, commitmentIndex) =>
      commitmentToNode(
        commitment,
        commitmentIndex,
        processX,
        processY,
        processIndex
      )
    );
    const outputNodes = outputs(process).map((commitment, commitmentIndex) =>
      commitmentToNode(
        commitment,
        commitmentIndex,
        processX,
        processY,
        processIndex
      )
    );
    return [
      ...all,
      ...inputNodes,
      ...outputNodes,
      {
        id: process.id,
        title: process.title,
        label: "P",
        x: 2 + processIndex * 3,
        y: (maxHeight + 1) / 2,
        links: [],
      },
    ];
  }, []);
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
      // newProcess = Object.assign({}, initialNewProcess);
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }

  async function handleUpdateProcess(process: Process) {
    loadingOverlay = true;
    let updateParams = {
      id: process.id,
      title: process.title,
      description: process.description,
      dueDate: process.dueDate,
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

            <div class="sm:col-span-6">
              <svg
                bind:this={svg}
                class="w-full"
                xmlns="http://www.w3.org/2000/svg"
                version="1.2"
                baseProfile="tiny"
                viewBox="0 0 {layoutUnit * processes.length * 4} {layoutUnit *
                  maxHeight *
                  2}"
              >
                <g
                  bind:this={g}
                  style="transform:translate({x}px, {y}px) scale({k})"
                  stroke="black"
                >
                  {#each nodes as { title, x, y, label, id, links } (id)}
                    <g stroke-opacity="0.8" stroke-width="3">
                      {#each links as { source, target, label }}
                        <line
                          x1={source.x * layoutUnit}
                          y1={source.y * layoutUnit}
                          x2={target.x * layoutUnit}
                          y2={target.y * layoutUnit}
                        >
                          <title>{label}</title>
                        </line>
                      {/each}
                    </g>
                    <rect
                      x={x * layoutUnit}
                      y={y * layoutUnit}
                      width={objectUnit}
                      height={objectUnit}
                      fill="white"
                      stroke-width="4"
                      rx="15"
                      transform="translate(-{objectUnit / 2}, -{objectUnit /
                        2})"
                    >
                      <title>{title}</title>
                    </rect>
                    {#if label === "P"}
                      <path
                        class="cursor-pointer"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        stroke="currentColor"
                        fill="white"
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        transform="translate({x * layoutUnit +
                          objectUnit / 5}, {y * layoutUnit - objectUnit / 8})"
                        on:click={() => {
                          console.log("clicked");
                        }}
                      />
                      <path
                        class="cursor-pointer"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        stroke="currentColor"
                        fill="none"
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        transform="translate({x * layoutUnit -
                          objectUnit / 2.3}, {y * layoutUnit - objectUnit / 8})"
                        on:click={() => {
                          console.log("clicked");
                        }}
                      />
                    {/if}
                    <text
                      x={x * layoutUnit}
                      y={y * layoutUnit}
                      stroke-witdh="3"
                      text-anchor="middle"
                      font-size="1em"
                      dy="15"
                      transform="translate(0,-10)"
                      >{label}
                    </text>
                  {/each}
                </g>
              </svg>
            </div>

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
                cancelText="Cancel"
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
