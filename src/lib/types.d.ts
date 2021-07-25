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

export interface Label {
  id: string;
  name: string;
  uniqueName: string;
  color: string;
  agentId: string;
}

export interface NewLabel {
  name: string;
  color: string;
  agentId: string;
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
  labels: string[];
  dueDate: Date | undefined;
  startDate: Date | undefined;
  agentId: string;
  planId: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  imageId: string | undefined;
  processes: Process[];
}

export interface NewPlan {
  title: string;
  agentId: string;
}

export interface UpdatePlan {
  id: string;
  title: string;
  description: string;
}

export type FlashType = "ERROR" | "SUCCESS";
