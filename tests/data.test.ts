import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadExercises } from "../src/load.js";

const root = new URL("../", import.meta.url);

describe("exercises/", () => {
    test("every file is valid and no locked id was removed", async () => {
        const exercises = await loadExercises(fileURLToPath(new URL("exercises/", root)));
        const locked = JSON.parse(await readFile(new URL("exercise-ids.json", root), "utf8")) as string[];
        const ids = new Set(exercises.map((exercise) => exercise.id));

        expect(locked.filter((id) => !ids.has(id))).toEqual([]);
        expect(exercises.length).toBeGreaterThanOrEqual(locked.length);
    });
});
