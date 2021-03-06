<script lang="ts">
  export let label: string;
  export let placeholder: string;
  export let description: string | undefined;
  export let text = (el: any) => el.id;
  export let color = (_: any) => "indigo";
  let input = "";
  let dropdownOpen = false;
  export let list: any[];
  export let filteredList: any[];
  export let selectedList: any[];
  export const closeDropdown = () => (dropdownOpen = false);
  let hashmap = list.reduce((acc, element) => {
    acc[element.id] = element;
    return acc;
  }, {});

  function filter<T>(array: Array<T>, searchValue: string): Array<T> {
    return array.filter((element: T) =>
      Object.values(element).some((elementValue: string) => {
        let content: string;
        if (!elementValue) {
          return false;
        } else {
          content = elementValue.toLocaleLowerCase();
        }
        return content.includes(searchValue);
      })
    );
  }

  function handleSelection({ currentTarget }) {
    const {
      dataset: { elementId },
    } = currentTarget;
    if (selectedList.find(({ id }) => id == elementId)) {
      selectedList = selectedList.filter((id) => id != elementId);
    } else {
      selectedList = [...selectedList, hashmap[elementId]];
    }
  }
</script>

<div class="px-4 py-5 sm:px-6 bg-gray-100">
  <label for="processAgents" class="block text-sm font-medium text-gray-700">
    {label}
  </label>
  <div class="mt-1 relative flex rounded-md shadow-sm">
    <input
      type="text"
      name="processAgents"
      id="processAgents"
      class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
      {placeholder}
      bind:value={input}
      on:input={() => {
        dropdownOpen = true;
        filteredList = filter(list, input);
      }}
    />
    <span
      class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
      on:click={() => (dropdownOpen = !dropdownOpen)}
    >
      <!-- Heroicon name: solid/selector -->
      <svg
        class="h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
  </div>
  <ul class="flex flex-wrap">
    {#each selectedList as selected (selected.id)}
      <li
        class="cursor-pointer"
        on:click={() =>
          (selectedList = selectedList.filter((id) => id != selected.id))}
      >
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{color(
            hashmap[selected.id]
          )}-100 text-{color(hashmap[selected.id])}-800"
        >
          {text(hashmap[selected.id])}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      </li>
    {/each}
  </ul>
  {#if dropdownOpen}
    <ul
      class="absolute z-10 mt-1  bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
      tabindex="-1"
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-3"
    >
      {#each filteredList as element (element.id)}
        <li
          class="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
          id={element.id}
          role="option"
          data-element-id={element.id}
          on:click={handleSelection}
        >
          <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
          <span class="font-normal block truncate">
            {text(element)}
          </span>
          {#if selectedList.find(({ id }) => id == element.id)}
            <span
              class="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <!-- Heroicon name: solid/check -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          {/if}
        </li>
      {/each}

      <!-- More items... -->
    </ul>
  {/if}

  {#if description}
    <p class="mt-2 text-sm text-gray-500" id="email-description">
      {description}
    </p>
  {/if}
</div>
