import { api } from "./_api";
import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";

// POST /plans.json
export const post: RequestHandler<Locals, FormData> = async (request) => {
  const response = await api(request, {
    // because index.svelte posts a FormData object,
    // request.body is _also_ a (readonly) FormData
    // object, which allows us to get form data
    // with the `body.get(key)` method
    title: request.body.get("title"),
  });

  return response;
};
