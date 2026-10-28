import type { Exercise } from "../src/types.js";

export const validExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
    id: "db-bench-press",
    name: "Dumbbell bench press",
    muscles: { primary: "chest", secondary: ["triceps", "shoulders"] },
    equipment: ["dumbbell", "bench"],
    mechanic: "compound",
    level: "beginner",
    steps: ["Lie on a flat bench holding the dumbbells over your chest.", "Lower them, then press back up."],
    ...overrides,
});
