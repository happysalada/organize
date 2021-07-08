import type { Request } from "@sveltejs/kit";
import type { Locals } from "$lib/types";

/*
	This module is used by the /todos.json and /todos/[uid].json
	endpoints to make calls to api.svelte.dev, which stores todos
	for each user. The leading underscore indicates that this is
	a private module, _not_ an endpoint — visiting /todos/_api
	will net you a 404 response.

	(The data on the todo app will expire periodically; no
	guarantees are made. Don't use it to organise your life.)
*/

const base = "http://127.0.0.1:8080";

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

export async function createAgent(name) {
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
