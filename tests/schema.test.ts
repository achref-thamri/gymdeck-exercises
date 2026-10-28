import { describe, expect, expectTypeOf, test } from "vitest";
import type { z } from "zod";

import { exerciseFileSchema, exerciseSchema } from "../src/schema.js";
import type { Exercise, MuscleGroup } from "../src/types.js";
import { validExercise } from "./fixtures.js";

const issues = (value: unknown): string[] => {
    const result = exerciseFileSchema.safeParse(value);
    return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
};

describe("exerciseSchema", () => {
    test("matches the public Exercise type exactly", () => {
        expectTypeOf<z.infer<typeof exerciseSchema>>().toEqualTypeOf<Exercise>();
    });

    test("exposes read-only data", () => {
        expectTypeOf<Exercise["steps"]>().toEqualTypeOf<readonly string[]>();
        expectTypeOf<Exercise["muscles"]["secondary"]>().toEqualTypeOf<readonly MuscleGroup[]>();
    });

    test("accepts a valid exercise", () => {
        expect(issues(validExercise())).toEqual([]);
    });

    test("accepts optional tips, source and the editor $schema key", () => {
        const exercise = {
            $schema: "../schema.json",
            ...validExercise({ tips: ["Keep your feet flat."], source: { name: "free-exercise-db", id: "Bench" } }),
        };
        expect(issues(exercise)).toEqual([]);
    });

    test("keeps legacy ids made of letters, digits, underscores, dots and dashes", () => {
        expect(issues(validExercise({ id: "3_4_Sit-Up" }))).toEqual([]);
    });

    test.each(["has space", "nested/path", "-leading-dash", ""])("rejects the id %j", (id) => {
        expect(issues(validExercise({ id }))).toHaveLength(1);
    });

    test("rejects unknown muscles and equipment", () => {
        const exercise = { ...validExercise(), muscles: { primary: "neck", secondary: [] }, equipment: ["sled"] };
        expect(issues(exercise).map((issue) => issue.split(":")[0])).toEqual(["muscles.primary", "equipment.0"]);
    });

    test("rejects the primary muscle listed again as secondary", () => {
        const exercise = validExercise({ muscles: { primary: "chest", secondary: ["chest"] } });
        expect(issues(exercise)).toEqual(["muscles.secondary: must not repeat the primary muscle"]);
    });

    test("rejects duplicate secondary muscles and equipment", () => {
        const exercise = validExercise({
            muscles: { primary: "chest", secondary: ["triceps", "triceps"] },
            equipment: ["dumbbell", "dumbbell"],
        });
        expect(issues(exercise)).toEqual([
            "muscles.secondary: must not contain duplicates",
            "equipment: must not contain duplicates",
        ]);
    });

    test("rejects bodyweight combined with other equipment", () => {
        expect(issues(validExercise({ equipment: ["bodyweight", "bench"] }))).toEqual([
            "equipment: bodyweight means no equipment, so it must be the only item",
        ]);
    });

    test("rejects no equipment", () => {
        expect(issues(validExercise({ equipment: [] }))).toHaveLength(1);
    });

    test("requires at least two steps", () => {
        expect(issues(validExercise({ steps: ["Do the thing."] }))).toHaveLength(1);
    });

    test("rejects empty tips", () => {
        expect(issues(validExercise({ tips: [] }))).toHaveLength(1);
    });

    test.each([
        ["name", { name: " Bench press" }],
        ["steps.1", { steps: ["Lie down.", ""] }],
        ["tips.0", { tips: ["Breathe out. "] }],
    ])("rejects blank or padded text in %s", (path, overrides) => {
        expect(issues(validExercise(overrides)).map((issue) => issue.split(":")[0])).toEqual([path]);
    });

    test("rejects unknown keys so typos don't pass silently", () => {
        expect(issues({ ...validExercise(), tip: "Old field name" })).toHaveLength(1);
    });
});
