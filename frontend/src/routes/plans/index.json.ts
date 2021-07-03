import plans from './_plans'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export function get() {
  return {
    body: JSON.stringify(plans),
  }
}
