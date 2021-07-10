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

export async function createPlan(title: String, agentId: String) {
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
