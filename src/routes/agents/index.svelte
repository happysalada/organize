<script context="module" lang="ts">
  import { query } from "$lib/api";
  import type { FlashType } from "$lib/types";
  let flashMessage = undefined;
  let flashType: FlashType = "ERROR";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ fetch }) {
    const res = await query(
      fetch,
      `{
        agents {id, name, uniqueName, email }
      }`
    );

    if (res.ok) {
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        const flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(flashMessage);
        return {
          props: { agents: [], flashMessage, flashType },
        };
      }
      const { agents } = data;

      return {
        props: { agents, flashMessage, flashType },
      };
    }

    const { message } = await res.json();

    return {
      props: { flashMessage: message, flashType },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import { createAgent, deleteAgent } from "$lib/api";
  import type { Agent } from "$lib/types";

  export let agents: Agent[];
  let filteredAgents: Agent[] = agents;

  let name = "";
  let searchQuery = "";
  let loadingOverlay = false;

  function search({ currentTarget: { value: searchValue } }) {
    filteredAgents = agents.filter((agent: Agent) =>
      Object.values(agent).some((agentValue: string | undefined) => {
        let stringToSearch: string;
        if (!agentValue) {
          return false;
        } else {
          stringToSearch = agentValue.toLocaleLowerCase();
        }
        return stringToSearch.includes(searchValue);
      })
    );
  }

  async function handleSubmit() {
    loadingOverlay = true;
    try {
      const promise = createAgent(name);
      name = "";
      const response = await promise;
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      }

      const { createAgent: created } = data;
      agents = [created, ...agents];
      filteredAgents = agents;
    } catch (error) {
      flashMessage = error.toString();
      flashType = "ERROR";
    }
    loadingOverlay = false;
  }

  async function handleDelete(uniqueName: String) {
    loadingOverlay = true;
    try {
      const response = await deleteAgent(uniqueName);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      } else if (data.deleteAgent == 0) {
        flashMessage = "Deletion failed";
        flashType = "ERROR";
        return;
      }

      agents = agents.filter((agent) => agent.uniqueName != uniqueName);
      filteredAgents = agents;
    } catch (error) {
      flashMessage = error.toString();
      flashType = "ERROR";
    }
    loadingOverlay = false;
  }
</script>

<svelte:head>
  <title>Organizing work</title>
</svelte:head>

<Flash message={flashMessage} type={flashType} />

<div class="max-w-7xl my-4 mx-auto px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    <div class="my-8">
      <label for="email" class="block text-sm font-medium text-gray-700"
        >Search</label
      >
      <div class="mt-1">
        <input
          type="text"
          name="search"
          id="search"
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="type a title, a description, or a label"
          on:input={search}
          bind:value={searchQuery}
        />
      </div>
    </div>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <form class="mb-1" on:submit|preventDefault={handleSubmit}>
          <input
            class="p-4 text-lg focus:outline-none focus:ring focus:ring-indigo-500 w-full"
            name="name"
            bind:value={name}
            aria-label="Create Agent"
            placeholder="+ tap to create a new agent"
          />
        </form>

        {#if loadingOverlay}
          <Loader />
        {/if}

        <div class="flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div
              class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
            >
              <div
                class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
              >
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Plans</span>
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Labels</span>
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Resource specifications</span>
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each filteredAgents as agent, index (agent.id)}
                      <tr class={index % 2 == 0 ? "bg-white" : "bg-gray-50"}>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {agent.name}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {agent.email || ""}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <a
                            href="agents/{agent.uniqueName}/plans"
                            class="text-indigo-600 hover:text-indigo-900"
                            >Plans</a
                          >
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <a
                            href="agents/{agent.uniqueName}/labels"
                            class="text-indigo-600 hover:text-indigo-900"
                            >Labels</a
                          >
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <a
                            href="agents/{agent.uniqueName}/resourceSpecifications"
                            class="text-indigo-600 hover:text-indigo-900"
                            >Resource specifications</a
                          >
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <button
                            on:click={() => handleDelete(agent.uniqueName)}
                            type="button"
                            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    {/each}

                    <!-- More people... -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- More items... -->
      </ul>
    </div>
  </div>
</div>
