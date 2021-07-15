/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
  userid: string;
}

declare namespace svelte.JSX {
  interface HTMLProps<T> {
    onclick_outside?: (e: CustomEvent) => void;
  }
}

export interface Agent {
  id: string;
  name: string;
  uniqueName: string;
  email: string;
}

export interface Process {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  dueDate: Date | undefined;
  startDate: Date | undefined;
}

export interface NewProcess {
  title: string;
  description: string;
  labels: Label[];
  dueDate: Date | undefined;
  startDate: Date | undefined;
  agentId: string;
}

export interface Label {
  color: string;
  title: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  imageId: string | undefined;
}
