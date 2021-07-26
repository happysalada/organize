<script context="module" lang="ts">
  import { getPlans } from "$lib/api";

  // see https://kit.svelte.dev/docs#loading
  export async function load({ page, fetch }) {
    const agentId = page.params.agentId;
    const res = await getPlans(fetch, agentId);

    if (res.ok) {
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        const flashMessage = errors
          .map(({ message }) => message.toString())
          .join("\n");
        console.error(flashMessage);
        return {
          props: { plans: [], flashMessage, flashType: "ERROR", agentId },
        };
      }
      const { plans } = data;

      return {
        props: { plans, flashMessage: undefined, agentId },
      };
    }

    const { message } = await res.json();

    return {
      props: { flashMessage: message, flashType: "ERROR", agentId },
    };
  }
</script>

<script lang="ts">
  import Flash from "$lib/Flash.svelte";
  import Loader from "$lib/Loader.svelte";
  import type { Plan, FlashType } from "$lib/types";
  import { createPlan } from "$lib/api";

  export let plans: Plan[];
  export let agentId: string;
  let filteredPlans: Plan[] = plans;

  let title = "";
  let searchQuery = "";
  let loadingOverlay = false;
  export let flashMessage: string | undefined;
  export let flashType: FlashType;

  function search({ currentTarget: { value: searchValue } }) {
    filteredPlans = plans.filter((plan: Plan) =>
      Object.values(plan).some((planValue: string) => {
        let stringToSearch: string;
        if (!planValue) {
          return false;
        } else {
          stringToSearch = planValue.toLocaleLowerCase();
        }
        return stringToSearch.includes(searchValue);
      })
    );
  }
  async function handleSubmit() {
    loadingOverlay = true;
    try {
      const promise = createPlan({ title, agentId });
      title = "";
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

      const { createPlan: created } = data;
      plans = [created, ...plans];
      filteredPlans = plans;
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
            bind:value={title}
            aria-label="Create Plan"
            placeholder="+ tap to create a new plan"
          />
        </form>

        {#if loadingOverlay}
          <Loader />
        {/if}

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
              <div class="w-full">
                <a href="/agents/{agentId}/plans/{plan.id}">
                  <div class="w-full flex justify-between">
                    <h4 class="text-lg font-bold">{plan.title}</h4>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
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
                  </div>
                </a>
                <p class="mt-1">
                  {plan.description ? plan.description : ""}
                </p>
              </div>
            </div>
          </li>
        {/each}

        <!-- More items... -->
      </ul>
    </div>
  </div>
</div>
