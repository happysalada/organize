<script>
  export let plan;
  const { title, description, labels } = plan;
  import Label from "./Label.svelte";

</script>

<div class="sm:flex">
  <div class="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
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
  </div>
  <div>
    <h4 class="text-lg font-bold">{title}</h4>
    <p class="mt-1">
      {description}
    </p>
    <div class="my-4">
      {#each labels as { title, color }}
        <Label {title} {color} />
      {/each}
    </div>
  </div>
</div>
