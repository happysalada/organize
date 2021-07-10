<script context="module" lang="ts">
  import { getPlans } from "$lib/api";
  import type { Load } from "@sveltejs/kit";

  // see https://kit.svelte.dev/docs#loading
  export const load: Load = async ({ page, fetch }) => {
    const agentId = page.params.id;
    const res = await getPlans(fetch, agentId);

    if (res.ok) {
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        const errorMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(errorMessage);
        return {
          props: { plans: [], errorMessage },
        };
      }
      const { plans } = data;

      return {
        props: { plans, errorMessage: undefined },
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

  interface Label {
    color: String;
    title: String;
  }

  interface Plan {
    id: String;
    title: String;
    description: String;
    imageId: String | undefined;
    labels: Array<Label>;
  }

  export let plans: Plan[];
  let filteredPlans: Plan[] = plans;

  let searchQuery = "";
  export let errorMessage: String | undefined;

  function search({ currentTarget: { value: searchValue } }) {
    filteredPlans = plans.filter((plan: Plan) =>
      Object.values(plan).some((planValue: Array<Label> | String) => {
        let stringToSearch: String;
        if (Array.isArray(planValue)) {
          stringToSearch = planValue
            .map((label) => Object.values(label).join(" ").toLocaleLowerCase())
            .join(" ");
        } else if (!planValue) {
          return false;
        } else {
          stringToSearch = planValue.toLocaleLowerCase();
        }
        return stringToSearch.includes(searchValue);
      })
    );
  }

</script>

<svelte:head>
  <title>Organizing work</title>
</svelte:head>

<Flash {errorMessage} />

<div class="max-w-7xl my-4 mx-auto px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    <div class="w-full grid justify-items-center">
      <button
        type="button"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create plan
      </button>
    </div>
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
        {#each filteredPlans as plan (plan.id)}
          <li class="px-4 py-4 sm:px-6">
            <div class="sm:flex">
              <div class="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                {#if plan.imageId}
                  <svg
                    class="h-32 w-full sm:w-32 border border-gray-300 bg-white text-gray-300"
                    preserveAspectRatio="none"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 200 200"
                    aria-hidden="true"
                  >
                    <path
                      vector-effect="non-scaling-stroke"
                      stroke-width="1"
                      d="M0 0l200 200M0 200L200 0"
                    />
                  </svg>
                {/if}
              </div>
              <div>
                <h4 class="text-lg font-bold">{plan.title}</h4>
                <p class="mt-1">
                  {plan.description ? plan.description : ""}
                </p>
                <div class="my-4">
                  {#each plan.labels || [] as { title, color }}
                    <span
                      class="inline-flex items-center mx-0.5 px-2.5 py-0.5 rounded-md text-sm font-medium bg-{color}-100 text-{color}-800"
                    >
                      {title}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </li>
        {/each}

        <!-- More items... -->
      </ul>
    </div>
  </div>
</div>
