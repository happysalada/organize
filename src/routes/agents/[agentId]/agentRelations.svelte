<script context="module" lang="ts">
  import { query } from "$lib/api";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentId = page.params.agentId;
    const res = await query(
      fetch,
      `{
        agentRelations(agentId: "${agentId}") {
          id,  agentRelationType
          subject { id, name },
          object {id, name },
        }
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
          props: { agents: [], flashMessage },
        };
      }
      const { agentRelations } = data;

      return {
        props: { agentRelations },
      };
    }

    const { message } = await res.json();

    return {
      props: { flashMessage: message },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import { createRelationship, deleteRelationship } from "$lib/api";
  import type { FlashType, AgentRelation } from "$lib/types";

  export let agentRelations: AgentRelation[];
  export let flashMessage = undefined;
  export let flashType: FlashType = "ERROR";
  let filtered: AgentRelation[] = agentRelations;

  let name = "";
  let searchQuery = "";
  let loadingOverlay = false;

  function search({ currentTarget: { value: searchValue } }) {
    filtered = agentRelations.filter((relation: AgentRelation) =>
      Object.values(relation).some((value: string | undefined) => {
        let stringToSearch: string;
        if (!value) {
          return false;
        } else {
          stringToSearch = value.toLocaleLowerCase();
        }
        return stringToSearch.includes(searchValue);
      })
    );
  }

  async function handleSubmit() {
    loadingOverlay = true;
    try {
      const promise = createRelationship();
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

      const { createCreateRelationship: created } = data;
      agentRelations = [created, ...agentRelations];
      filtered = agentRelations;
    } catch (error) {
      flashMessage = error.toString();
      flashType = "ERROR";
    }
    loadingOverlay = false;
  }

  async function handleDelete(id: String) {
    loadingOverlay = true;
    try {
      const response = await deleteRelationship(id);
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

      agentRelations = agentRelations.filter((relation) => relation.id != id);
      filtered = agentRelations;
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
  <div class="max-w-4xl mx-auto">
    <div class="my-8">
      <label for="search" class="block text-sm font-medium text-gray-700"
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
            aria-label="Create relation"
            placeholder="+ tap to create a new relation"
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
                        Relation
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each filtered as relation, index (relation.id)}
                      <tr class={index % 2 == 0 ? "bg-white" : "bg-gray-50"}>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {relation.subject.name}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {relation.agentRelationType}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {relation.object.name}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <button
                            on:click={() => handleDelete(relation.id)}
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
