import { steps } from "./generated/steps.js";

export { steps };

// Own keys only, so ids like "constructor" can't reach Object.prototype.
export const getSteps = (id: string): readonly string[] => (Object.hasOwn(steps, id) ? (steps[id] ?? []) : []);
