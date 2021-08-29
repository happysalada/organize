import type { Process, Commitment } from "$lib/types";
export function inputs(process: Process): Commitment[] {
  return process.commitments.filter(
    (commitment) => commitment.action.inputOutput === "INPUT"
  );
}

export function outputs(process: Process): Commitment[] {
  return process.commitments.filter(
    (commitment) => commitment.action.inputOutput === "OUTPUT"
  );
}
