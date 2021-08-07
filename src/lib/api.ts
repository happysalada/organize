import type {
  NewProcess,
  NewLabel,
  NewPlan,
  NewResourceSpecification,
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

export async function createPlan({ title, agentUniqueName }: NewPlan) {
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
          agentUniqueName,
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

export async function createLabel({ name, color, agentUniqueName }: NewLabel) {
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
          agentUniqueName,
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
        createProcess(newProcess: $newProcess) {
          id, title, description,
          labels { id, name, color }
          agents { id, name, uniqueName }
        }
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

export async function updateProcess(updateProcess: UpdateProcess) {
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
        updateProcess,
      },
    }),
  });
}

export async function createResourceSpecification({
  name,
  agentUniqueName,
}: NewResourceSpecification) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_resource_specification($newResourceSpecification: NewResourceSpecification!) {
        createResourceSpecification(newResourceSpecification: $newResourceSpecification) { id, name, uniqueName }
      }`,
      variables: {
        newResourceSpecification: {
          name,
          agentUniqueName,
        },
      },
    }),
  });
}

export async function deleteResourceSpecification(uniqueName: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_resource_specification($uniqueName: String!) {
        deleteResourceSpecification(uniqueName: $uniqueName)
      }`,
      variables: {
        uniqueName,
      },
    }),
  });
}
