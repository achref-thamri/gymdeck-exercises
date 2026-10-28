import type { Equipment, Level, Mechanic, MuscleGroup } from "./vocabulary.js";

export type { Equipment, Level, Mechanic, MuscleGroup };

// Where the text came from, for credit. Not used for lookups.
export type ExerciseSource = {
    name: string;
    id: string;
};

export type Exercise = {
    // Permanent: apps store it in workout history, so it is never renamed or removed.
    id: string;
    name: string;
    muscles: {
        primary: MuscleGroup;
        secondary: readonly MuscleGroup[];
    };
    // Everything needed at once. Bodyweight moves list only "bodyweight".
    equipment: readonly Equipment[];
    mechanic: Mechanic;
    level: Level;
    steps: readonly string[];
    tips?: readonly string[];
    source?: ExerciseSource;
};

// What the main entry ships. Steps are most of the data, so they live in the separate `steps` entry.
export type ExerciseSummary = Omit<Exercise, "steps">;
