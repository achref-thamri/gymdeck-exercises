import { expect, test, vi } from "vitest";

vi.mock("../src/generated/steps.js", () => ({ steps: { squat: ["Stand tall.", "Sit down."] } }));

const { getSteps } = await import("../src/steps.js");

test("returns the steps for a known id", () => {
    expect(getSteps("squat")).toEqual(["Stand tall.", "Sit down."]);
});

test.each(["missing", "constructor", "__proto__"])("returns no steps for %j", (id) => {
    expect(getSteps(id)).toEqual([]);
});
