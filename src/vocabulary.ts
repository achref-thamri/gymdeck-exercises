// The closed lists every exercise is checked against. Adding a value is a minor release;
// renaming or removing one breaks consumers and is a major release.

export const MUSCLES = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "quads",
    "hamstrings",
    "glutes",
    "calves",
    "abs",
] as const;

export const EQUIPMENT = [
    "bodyweight",
    "dumbbell",
    "barbell",
    "kettlebell",
    "cable",
    "band",
    "pullup-bar",
    "bench",
    "chest-press-machine",
    "pec-deck",
    "lat-pulldown",
    "seated-row-machine",
    "shoulder-press-machine",
    "leg-press",
    "leg-extension",
    "leg-curl",
    "smith-machine",
    "hip-thrust-machine",
    "calf-raise-machine",
] as const;

export const MECHANICS = ["compound", "isolation"] as const;

export const LEVELS = ["beginner", "intermediate", "expert"] as const;

export type MuscleGroup = (typeof MUSCLES)[number];
export type Equipment = (typeof EQUIPMENT)[number];
export type Mechanic = (typeof MECHANICS)[number];
export type Level = (typeof LEVELS)[number];
