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

export async function getPlans(
  fetch: (info: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: "{plans {id, title, description } }",
    }),
  });
}

export async function createPlan(title) {
  return await fetch(`${base}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_plan($plan: NewPlan!) {
        createPlan(plan: $plan) { id, title, description }
      }`,
      variables: {
        plan: {
          title,
        },
      },
    }),
  });
}

export async function api(request: Request<Locals>, data?: { title: String }) {
  // user must have a cookie set
  if (!request.locals.userid) {
    return { status: 401 };
  }

  const res = await fetch(`${base}/graphql`, {
    method: request.method,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation create_plan($plan: NewPlan!) {
        createPlan(newPlan: $plan) { id, title, description }
      }`,
      variables: {
        plan: {
          title: data.title,
        },
      },
    }),
  });

  // if the request came from a <form> submission, the browser's default
  // behaviour is to show the URL corresponding to the form's "action"
  // attribute. in those cases, we want to redirect them back to the
  // /todos page, rather than showing the response
  if (
    res.ok &&
    request.method !== "GET" &&
    request.headers.accept !== "application/json"
  ) {
    return {
      status: 303,
      headers: {
        location: "/plans",
      },
    };
  }

  return {
    status: res.status,
    body: await res.json(),
  };
}
