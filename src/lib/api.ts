import type {
  NewAgent,
  NewCommitment,
  NewLabel,
  NewPlan,
  NewProcess,
  NewResourceSpecification,
  UpdateCommitment,
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

export async function createAgent({name, agentType}: NewAgent) {
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
          agentType
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
          commitments { id }
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

export async function createCommitment(newCommitment: NewCommitment) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_commitment($newCommitment: NewCommitment!) {
        createCommitment(newCommitment: $newCommitment) {
          id, description, quantity, actionId,
          resourceSpecificationId, unitId, assignedAgentId
          action {
            id, name, inputOutput
          }
          resourceSpecification {
            id, name
          }
          unit {
            id, label
          }
          assignedAgent {
            id, name
          }
        }
      }`,
      variables: {
        newCommitment,
      },
    }),
  });
}

export async function deleteCommitment(id: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_commitment($id: String!) {
        deleteCommitment(id: $id)
      }`,
      variables: {
        id,
      },
    }),
  });
}

export async function updateCommitment(updateCommitment: UpdateCommitment) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation update_commitment($updateCommitment: UpdateCommitment!) {
        updateCommitment(updateCommitment: $updateCommitment)
      }`,
      variables: {
        updateCommitment,
      },
    }),
  });
}

export async function createRelationship() {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_relationship($relationship: NewRelationship!) {
        createRelationship(newRelationship: $relationship) { id }
      }`,
      variables: {
        relationship: { },
      },
    }),
  });
}

export async function deleteRelationship(id: String) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation delete_relationship($id: String!) {
        deleteAgent(id: $id)
      }`,
      variables: {
        id,
      },
    }),
  });
}

