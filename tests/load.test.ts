import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { ExerciseValidationError, loadExercises, validateExercises, type ExerciseFile } from "../src/load.js";
import { validExercise } from "./fixtures.js";

const file = (value: unknown, name = `${(value as { id: string }).id}.json`): ExerciseFile => ({
    name,
    contents: JSON.stringify(value),
});

const problemsOf = (files: ExerciseFile[]): string[] => {
    try {
        validateExercises(files);
    } catch (error) {
        if (error instanceof ExerciseValidationError) return error.problems;
        throw error;
    }
    return [];
};

describe("validateExercises", () => {
    test("returns exercises sorted by id without the $schema key", () => {
        const squat = validExercise({ id: "squat", name: "Squat" });
        const bench = validExercise({ id: "bench", name: "Bench" });
        const result = validateExercises([file({ $schema: "../schema.json", ...squat }), file(bench)]);
        expect(result).toEqual([bench, squat]);
    });

    test("reports a file whose name does not match its id", () => {
        expect(problemsOf([file(validExercise(), "other.json")])).toEqual([
            'other.json: id "db-bench-press" must match the file name',
        ]);
    });

    test("reports invalid JSON with the file name", () => {
        const problems = problemsOf([{ name: "broken.json", contents: "{ nope" }]);
        expect(problems).toHaveLength(1);
        expect(problems[0]).toMatch(/^broken\.json: invalid JSON/);
    });

    test("reports schema problems with the field path", () => {
        expect(problemsOf([file(validExercise({ steps: ["Only one."] }))])).toEqual([
            "db-bench-press.json: steps: must have at least two steps",
        ]);
    });

    test("reports problems from every file, not only the first", () => {
        const problems = problemsOf([
            file(validExercise({ id: "a", name: "A", steps: [] })),
            file(validExercise({ id: "b", name: " B" })),
        ]);
        expect(problems.map((problem) => problem.split(":")[0])).toEqual(["a.json", "b.json"]);
    });

    test("rejects two exercises with the same name, ignoring case", () => {
        const problems = problemsOf([
            file(validExercise({ id: "a", name: "Push-up" })),
            file(validExercise({ id: "b", name: "push-up" })),
        ]);
        expect(problems).toEqual(['b.json: name "push-up" is already used by a.json']);
    });

    test("rejects ids that differ only by case, since they collide on macOS and Windows", () => {
        const problems = problemsOf([
            file(validExercise({ id: "Bench", name: "Bench A" })),
            file(validExercise({ id: "bench", name: "Bench B" })),
        ]);
        expect(problems).toEqual(['bench.json: id "bench" differs only by case from Bench.json']);
    });

    test("rejects an empty list", () => {
        expect(problemsOf([])).toEqual(["no exercise files found"]);
    });
});

describe("loadExercises", () => {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), "exercises-"));
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    test("reads every .json file in the folder and skips other files", async () => {
        const exercise = validExercise();
        await writeFile(join(dir, `${exercise.id}.json`), JSON.stringify(exercise));
        await writeFile(join(dir, ".DS_Store"), "");
        expect(await loadExercises(dir)).toEqual([exercise]);
    });
});
