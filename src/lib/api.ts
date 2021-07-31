import type {
  NewProcess,
  NewLabel,
  NewPlan,
  UpdatePlan,
  UpdateProcess,
} from "$lib/types";
import { variables } from "$lib/env";
const base = variables.apiUrl;

export async function query(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>,
  query: string
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
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

export async function updateProcess({
  id,
  title,
  description,
  labels,
}: UpdateProcess) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation update_process($updateProcess: UpdateProcess!) {
        updateProcess(updateProcess: $updateProcess)
      }`,
      variables: {
        updateProcess: {
          id,
          title,
          description,
          labels,
        },
      },
    }),
  });
}
