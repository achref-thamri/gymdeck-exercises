// Validates exercises/*.json and writes everything derived from them:
// - src/generated/catalog.ts and steps.ts, compiled into the package by tsdown
// - src/generated/exercises.json, the full data set, copied into the package as-is
// - schema.json, for editor autocomplete in exercise files
// - exercise-ids.json, the append-only list of ids apps may have stored
// CI runs this and fails if the committed schema.json or exercise-ids.json changed.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { renderCatalog, renderSteps, updateIdLock } from "../src/build.js";
import { ExerciseValidationError, loadExercises } from "../src/load.js";
import { exerciseFileSchema } from "../src/schema.js";

const root = new URL("../", import.meta.url);
const path = (relative: string): URL => new URL(relative, root);
const json = (value: unknown): string => `${JSON.stringify(value, null, 4)}\n`;

const readIdLock = async (): Promise<string[]> => {
    try {
        return z.array(z.string()).parse(JSON.parse(await readFile(path("exercise-ids.json"), "utf8")));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
    }
};

try {
    const exercises = await loadExercises(fileURLToPath(path("exercises/")));

    const lock = updateIdLock(
        await readIdLock(),
        exercises.map((exercise) => exercise.id)
    );
    if (lock.removed.length > 0) {
        throw new ExerciseValidationError(
            lock.removed.map((id) => `${id}.json: removed, but ids are permanent because apps store them`)
        );
    }

    await mkdir(path("src/generated/"), { recursive: true });
    await Promise.all([
        writeFile(path("src/generated/catalog.ts"), renderCatalog(exercises)),
        writeFile(path("src/generated/steps.ts"), renderSteps(exercises)),
        writeFile(path("src/generated/exercises.json"), json(exercises)),
        writeFile(path("schema.json"), json(z.toJSONSchema(exerciseFileSchema, { io: "input" }))),
        writeFile(path("exercise-ids.json"), json(lock.ids)),
    ]);
    console.log(`Generated ${String(exercises.length)} exercises.`);
} catch (error) {
    if (!(error instanceof ExerciseValidationError)) throw error;
    console.error(error.message);
    process.exitCode = 1;
}
