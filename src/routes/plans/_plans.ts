interface Label {
  color: String,
  title: String,
};

interface Plan {
  id: String,
  title: String,
  description: String,
  labels: Array<Label>
}

const plans: Array<Plan> = [
  {
    id: "6796116a-10c1-44bf-a472-24feb9792ec5",
    title: "Plan",
    description:
      "Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has.",
    labels: [
      { color: "red", title: "Important" },
      { color: "blue", title: "livelihood" },
      { color: "green", title: "vibrant" },
    ],
  },
  {
    id: "0218f7cf-81dd-4cc6-93c5-fecc42113fa5",
    title: "TODO",
    description:
      "You must be the change that you wish to see in the world",
    labels: [
      { color: "purple", title: "Love" },
      { color: "pink", title: "Care" },
      { color: "indigo", title: "Disco" },
    ],
  },
  {
    id: "9a2a3add-ad03-4677-99a0-84efa39b983e",
    title: "Disco deck",
    description:
      "Live as if you were to die tomorrow, learn as if you were to live forever.",
    labels: [
      { color: "yellow", title: "Tech" },
      { color: "gray", title: "Review" },
    ],
  },
];

export default plans;
export type { Plan, Label};
