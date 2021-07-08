<script context="module" lang="ts">
  import { getAgents } from "./_api";
  import type { Load } from "@sveltejs/kit";

  // see https://kit.svelte.dev/docs#loading
  export const load: Load = async ({ fetch }) => {
    const res = await getAgents(fetch);

    if (res.ok) {
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        const errorMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(errorMessage);
        return {
          props: { agents: [], errorMessage },
        };
      }
      const { agents } = data;

      return {
        props: { agents, errorMessage: undefined },
      };
    }

    const { message } = await res.json();

    return {
      props: { errorMessage: message },
    };
  };

</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import { createAgent } from "./_api";

  interface Agent {
    id: String;
    name: String;
    uniqueName: String;
    email: String;
  }

  export let agents: Agent[];
  let filteredAgents: Agent[] = agents;

  let name = "";
  let searchQuery = "";
  export let errorMessage: String | undefined;

  function search({ currentTarget: { value: searchValue } }) {
    filteredAgents = agents.filter((agent: Agent) =>
      Object.values(agent).some((agentValue: String | undefined) => {
        let stringToSearch: String;
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
    try {
      const response = await createAgent(name);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        errorMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        setTimeout(() => (errorMessage = undefined), 10000);
        console.error(errorMessage);
        return;
      }

      const { createAgent: created } = data;
      agents = [created, ...agents];
      filteredAgents = agents;
      name = "";
    } catch (error) {
      errorMessage = error.toString();
    }
  }

</script>

<svelte:head>
  <title>Organizing work</title>
</svelte:head>

<Flash {errorMessage} />

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
                        <span class="sr-only">Actions</span>
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
