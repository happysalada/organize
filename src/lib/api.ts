import type { NewProcess, NewLabel, NewPlan, UpdatePlan } from "$lib/types";
import { variables } from "$lib/env";
const base = variables.apiUrl;

export async function getAgents(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: "{agents {id, name, uniqueName, email } }",
    }),
  });
}

export async function createAgent(name: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_agent($agent: NewAgent!) {
        createAgent(newAgent: $agent) { id, name, uniqueName, email}
      }`,
      variables: {
        agent: {
          name,
        },
      },
    }),
  });
}

export async function deleteAgent(uniqueName: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_agent($uniqueName: String!) {
        deleteAgent(uniqueName: $uniqueName)
      }`,
      variables: {
        uniqueName,
      },
    }),
  });
}

export async function getPlans(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>,
  agentId: String
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{plans(agentId: "${agentId}") {id, title, description } }`,
    }),
  });
}

export async function getPlan(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>,
  planId: String
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{plan(planId: "${planId}") {id, title, description, processes { id, title, description, labels { id, name, color} } } }`,
    }),
  });
}

export async function createPlan({ title, agentId }: NewPlan) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_plan($newPlan: NewPlan!) {
        createPlan(newPlan: $newPlan) { id, title, description }
      }`,
      variables: {
        newPlan: {
          title,
          agentId,
        },
      },
    }),
  });
}

export async function updatePlan({ id, title, description }: UpdatePlan) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation update_plan($updatePlan: UpdatePlan!) {
        updatePlan(updatePlan: $updatePlan)
      }`,
      variables: {
        updatePlan: {
          id,
          title,
          description,
        },
      },
    }),
  });
}

export async function getLabels(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>,
  agentId: String
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{labels(agentId: "${agentId}") {id, name, color, uniqueName } }`,
    }),
  });
}

export async function createLabel({ name, color, agentId }: NewLabel) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_label($newLabel: NewLabel!) {
        createLabel(newLabel: $newLabel) { name, uniqueName, color }
      }`,
      variables: {
        newLabel: {
          name,
          color,
          agentId,
        },
      },
    }),
  });
}

export async function deleteLabel(uniqueName: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_label($uniqueName: String!) {
        deleteLabel(uniqueName: $uniqueName)
      }`,
      variables: {
        uniqueName,
      },
    }),
  });
}

export async function createProcess(newProcess: NewProcess) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_process($newProcess: NewProcess!) {
        createProcess(newProcess: $newProcess) { id, title, description, labels { id, name, color } }
      }`,
      variables: {
        newProcess,
      },
    }),
  });
}

export async function deleteProcess(processId: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_process($processId: String!) {
        deleteProcess(processId: $processId)
      }`,
      variables: {
        processId,
      },
    }),
  });
}
