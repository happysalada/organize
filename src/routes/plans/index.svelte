<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";

  // see https://kit.svelte.dev/docs#loading
  export const load: Load = async ({ fetch }) => {
    const res = await fetch("/plans.json");

    if (res.ok) {
      const plans = await res.json();

      return {
        props: { plans },
      };
    }

    const { message } = await res.json();

    return {
      error: new Error(message),
    };
  };

</script>

<script lang="ts">
  import PlanComponent from "$lib/Plan.svelte";
  import type { Plan, Label } from "./_plans.js";
  export let plans;
  let filteredPlans = plans;

  function search({ currentTarget: { value: searchValue } }) {
    filteredPlans = plans.filter((plan: Plan) =>
      Object.values(plan).some((planValue: Array<Label> | String) => {
        let stringToSearch;
        if (Array.isArray(planValue)) {
          stringToSearch = planValue
            .map((label) => Object.values(label).join(" ").toLocaleLowerCase())
            .join(" ");
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

<div class="max-w-7xl my-4 mx-auto px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    <div class="grid w-full justify-items-center">
      <button
        type="button"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create
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
        />
      </div>
    </div>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        {#each filteredPlans as plan (plan.id)}
          <li class="px-4 py-4 sm:px-6">
            <PlanComponent {plan} />
          </li>
        {/each}

        <!-- More items... -->
      </ul>
    </div>
  </div>
</div>
