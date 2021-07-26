<script context="module" lang="ts">
  import { getLabels } from "$lib/api";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentId = page.params.agentId;
    const res = await getLabels(fetch, agentId);

    if (res.ok) {
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        const flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(flashMessage);
        return {
          props: { labels: [], agentId, flashMessage, flashType: "ERROR" },
        };
      }
      const { labels } = data;

      return {
        props: { labels, agentId },
      };
    }

    const { message } = await res.json();

    return {
      props: { agentId, flashMessage: message, flashType: "ERROR" },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import { createLabel, deleteLabel } from "$lib/api";
  import type { Label, FlashType } from "$lib/types";
  import clickOutside from "$lib/clickOutside";
  import { colors } from "$lib/configuration";

  export let labels: Label[];
  export let agentId: string;
  let filteredLabels: Label[] = labels;

  let name = "";
  let color = "";
  let searchQuery = "";
  let dropdownOpen = false;
  export let flashMessage: string | undefined;
  export let flashType: FlashType;

  function search({ currentTarget: { value: searchValue } }) {
    filteredLabels = labels.filter((label: Label) =>
      Object.values(label).some((labelValue: String | undefined) => {
        let stringToSearch: String;
        if (!labelValue) {
          return false;
        } else {
          stringToSearch = labelValue.toLocaleLowerCase();
        }
        return stringToSearch.includes(searchValue);
      })
    );
  }

  async function handleSubmit() {
    try {
      const response = await createLabel({ name, color, agentId });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        flashType = "ERROR";
        console.error(flashMessage);
        return;
      }

      const { createLabel: created } = data;
      labels = [created, ...labels];
      filteredLabels = labels;
      name = "";
    } catch (error) {
      flashMessage = error.toString();
    }
  }

  async function handleDelete(uniqueName: String) {
    try {
      const response = await deleteLabel(uniqueName);
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

      labels = labels.filter((label) => label.uniqueName != uniqueName);
      filteredLabels = labels;
    } catch (error) {
      flashMessage = error.toString();
      flashType = "ERROR";
    }
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
    <div class="bg-white shadow sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <div class="flex h-full space-x-0.5">
          <div
            class="w-1/3 flex items-center justify-center bg-{color ||
              'gray'}-500 relative cursor-pointer"
            use:clickOutside
            on:click_outside={() => (dropdownOpen = false)}
            on:click|preventDefault={() => (dropdownOpen = !dropdownOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            {#if dropdownOpen}
              <ul
                class="absolute w-full -bottom-16 h-full overflow-visible z-10 mt-1  bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                tabindex="-1"
                role="listbox"
                aria-labelledby="listbox-label"
                aria-activedescendant="listbox-option-3"
              >
                {#each colors as availableColor}
                  <li
                    class="bg-{availableColor}-500 cursor-pointer select-none relative py-2 pl-3 pr-9 h-12"
                    id="listbox-option-0"
                    role="option"
                    on:click={() => {
                      color = availableColor;
                    }}
                  />
                {/each}

                <!-- More items... -->
              </ul>
            {/if}
          </div>
          <form class="mb-1 w-2/3" on:submit|preventDefault={handleSubmit}>
            <input
              class="p-4 text-lg focus:outline-none w-full border-b-4 border-indigo-500 border-opacity-0 focus:border-opacity-100"
              name="name"
              bind:value={name}
              aria-label="Create Label"
              placeholder="+ tap to create a new label"
            />
          </form>
        </div>

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
                    {#each filteredLabels as label, index (label.uniqueName)}
                      <tr class={index % 2 == 0 ? "bg-white" : "bg-gray-50"}>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {label.name}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm bg-{label.color ||
                            'gray'}-500"
                        />
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <button
                            on:click={() => handleDelete(label.uniqueName)}
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
