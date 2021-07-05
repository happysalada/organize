<script context="module" lang="ts">
  import { enhance } from "$lib/form";
  import type { Load } from "@sveltejs/kit";

  // see https://kit.svelte.dev/docs#loading
  export const load: Load = async ({ fetch }) => {
    const res = await fetch("/plans.json");

    if (res.ok) {
      const {
        data: { plans },
      } = await res.json();

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
  export let plans: Plan[];
  let filteredPlans: Plan[] = plans;

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
        <form
          class=""
          action="/graphql"
          method="post"
          use:enhance={{
            result: async (res, form) => {
              const created = await res.json();
              plans = [...plans, created];

              form.reset();
            },
          }}
        >
          <input
            class="p-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent w-full"
            name="title"
            aria-label="Create plan"
            placeholder="+ tap to create a new plan"
          />
        </form>

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
