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
  agent_type: string;
  email: string;
}

export interface NewAgent {
  name: string;
  agentType: AgentType;
}

export interface AgentRelation {
  id: string;
  subject: Agent,
  object: Agent,
  agentRelationType: string;
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
}

export interface Process {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  agents: Agent[];
  dueDate: Date | undefined;
  startDate: Date | undefined;
  commitments: Commitment[];
}

export interface NewProcess {
  title: string;
  description: string;
  labels: string[];
  agents: string[];
  dueDate: Date | undefined;
  startDate: Date | undefined;
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

export interface UpdateProcess {
  id: string;
  title: string;
  description: string;
  labels: string[];
  agents: string[];
}

export interface Action {
  id: string;
  name: string;
  inputOutput: string;
}

export interface Unit {
  id: string;
  label: string;
}

export interface Commitment {
  id: string;
  description: string;
  action: Action;
  actionId: string;
  quantity: number;
  unit: Unit;
  unitId: string;
  resourceSpecification: ResourceSpecification;
  resourceSpecificationId: string;
  dueAt: Date | undefined;
  processId: string;
  assignedAgentId: string | undefined;
  assignedAgent: Agent | undefined;
}

export interface NewCommitment {
  actionId: string | undefined;
  description: string | undefined;
  resourceSpecificationId: string | undefined;
  assignedAgentId: string | undefined;
  quantity: number;
  unitId: string | undefined;
  dueAt: Date | undefined;
  processId: string;
}

export interface ResourceSpecification {
  id: string;
  name: string;
  uniqueName: string;
}

export interface NewResourceSpecification {
  name: string;
}

export interface UpdateCommitment {
  id: string;
  description: string;
  quantity: number;
  unitId: string | undefined;
  actionId: string | undefined;
  resourceSpecificationId: string | undefined;
  assignedAgentId: string | undefined;
  dueAt: Date | undefined;
}
