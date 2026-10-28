import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { exerciseFileSchema } from "./schema.js";
import type { Exercise } from "./types.js";

// Code-point order, so generated output is identical on every machine and locale.
export const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export type ExerciseFile = {
    name: string;
    contents: string;
};

// Carries every problem found, so one run shows everything that needs fixing.
export class ExerciseValidationError extends Error {
    readonly problems: string[];

    constructor(problems: string[]) {
        super(`${String(problems.length)} problem(s) in exercises:\n${problems.join("\n")}`);
        this.name = "ExerciseValidationError";
        this.problems = problems;
    }
}

const parseFile = (file: ExerciseFile, problems: string[]): Exercise | undefined => {
    let json: unknown;
    try {
        json = JSON.parse(file.contents);
    } catch (error) {
        problems.push(`${file.name}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
        return undefined;
    }

    const result = exerciseFileSchema.safeParse(json);
    if (!result.success) {
        for (const issue of result.error.issues) {
            problems.push(`${file.name}: ${[...issue.path, issue.message].join(": ")}`);
        }
        return undefined;
    }

    const { $schema: _schema, ...exercise } = result.data;
    if (`${exercise.id}.json` !== file.name) {
        problems.push(`${file.name}: id "${exercise.id}" must match the file name`);
        return undefined;
    }
    return exercise;
};

// Validates each file on its own, then the rules that span files. Throws if anything is wrong.
export const validateExercises = (files: readonly ExerciseFile[]): Exercise[] => {
    if (files.length === 0) throw new ExerciseValidationError(["no exercise files found"]);

    const problems: string[] = [];
    const exercises: Exercise[] = [];
    const fileByName = new Map<string, string>();

    for (const file of [...files].sort((a, b) => compareStrings(a.name, b.name))) {
        const exercise = parseFile(file, problems);
        if (!exercise) continue;

        const key = exercise.name.toLowerCase();
        const existing = fileByName.get(key);
        if (existing) {
            problems.push(`${file.name}: name "${exercise.name}" is already used by ${existing}`);
            continue;
        }
        fileByName.set(key, file.name);
        exercises.push(exercise);
    }

    if (problems.length > 0) throw new ExerciseValidationError(problems);
    return exercises.sort((a, b) => compareStrings(a.id, b.id));
};

export const loadExercises = async (dir: string): Promise<Exercise[]> => {
    const names = (await readdir(dir)).filter((name) => name.endsWith(".json"));
    const files = await Promise.all(
        names.map(async (name) => ({ name, contents: await readFile(join(dir, name), "utf8") }))
    );
    return validateExercises(files);
};
