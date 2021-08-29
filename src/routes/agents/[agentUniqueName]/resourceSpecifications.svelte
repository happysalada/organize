<script context="module" lang="ts">
  import { query } from "$lib/api";
  import type { FlashType } from "$lib/types";
  let flashMessage = undefined;
  let flashType: FlashType = "ERROR";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentUniqueName = page.params.agentUniqueName;
    const res = await query(
      fetch,
      `{
        resourceSpecifications(agentUniqueName: "${agentUniqueName}") {
          id, name, uniqueName
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
          props: {
            resourceSpecifications: [],
            agentUniqueName,
            flashMessage,
            flashType,
          },
        };
      }
      const { resourceSpecifications } = data;

      return {
        props: {
          resourceSpecifications,
          agentUniqueName,
          flashMessage,
          flashType,
        },
      };
    }

    const { message } = await res.json();

    return {
      props: { agentUniqueName, flashMessage: message, flashType },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import {
    createResourceSpecification,
    deleteResourceSpecification,
  } from "$lib/api";
  import type { ResourceSpecification } from "$lib/types";

  export let resourceSpecifications: ResourceSpecification[] = [];
  export let agentUniqueName: string;
  export let flashMessage;
  export let flashType;
  let list = resourceSpecifications;
  let filtered: ResourceSpecification[] = list;

  let name = "";
  let searchQuery = "";
  let loadingOverlay = false;

  function search({ currentTarget: { value: searchValue } }) {
    filtered = list.filter((el: ResourceSpecification) =>
      Object.values(el).some((value: String | undefined) => {
        let stringToSearch: String;
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
    if (name === "") return;
    loadingOverlay = true;
    try {
      const response = await createResourceSpecification({
        name,
        agentUniqueName,
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

      const { createResourceSpecification: created } = data;
      list = [created, ...list];
      filtered = list;
      name = "";
    } catch (error) {
      flashMessage = error.toString();
    }
    loadingOverlay = false;
  }

  async function handleDelete(uniqueName: String) {
    loadingOverlay = true;
    try {
      const response = await deleteResourceSpecification(uniqueName);
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      } else if (data.deleteLabel == 0) {
        flashMessage = "Deletion failed";
        flashType = "ERROR";
        return;
      }

      list = list.filter((el) => el.uniqueName != uniqueName);
      filtered = list;
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
    <div class="bg-white shadow sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <div class="flex h-full space-x-0.5">
          <form class="mb-1 w-2/3" on:submit|preventDefault={handleSubmit}>
            <input
              class="p-4 text-lg focus:outline-none w-full border-b-4 border-indigo-500 border-opacity-0 focus:border-opacity-100"
              name="name"
              bind:value={name}
              aria-label="Create a Resource Specification"
              placeholder="+ tap to create a new resource specification"
            />
          </form>
        </div>

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
                        Color
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each filtered as element, index (element.uniqueName)}
                      <tr class={index % 2 == 0 ? "bg-white" : "bg-gray-50"}>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {element.name}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm bg-gray'-500"
                        />
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <button
                            on:click={() => handleDelete(element.uniqueName)}
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
