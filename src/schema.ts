import { z } from "zod";

import { EQUIPMENT, LEVELS, MECHANICS, MUSCLES } from "./vocabulary.js";

// Some older ids use capitals and underscores (e.g. "3_4_Sit-Up"), so this allows more than kebab-case.
// New exercises should still use kebab-case ids.
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

const text = z
    .string()
    .min(1, "must not be empty")
    .refine((value) => value === value.trim(), "must not start or end with whitespace");

const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length;
const unique = <T extends z.ZodType<string>>(item: T) =>
    z.array(item).refine(isUnique, "must not contain duplicates").readonly();

const muscle = z.enum(MUSCLES);

export const exerciseSchema = z.strictObject({
    id: z.string().regex(ID_PATTERN, "must be letters, digits, '_', '.' or '-', starting with a letter or digit"),
    name: text,
    muscles: z
        .strictObject({ primary: muscle, secondary: unique(muscle) })
        .refine((muscles) => !muscles.secondary.includes(muscles.primary), {
            message: "must not repeat the primary muscle",
            path: ["secondary"],
        }),
    equipment: unique(z.enum(EQUIPMENT))
        .refine((items) => items.length > 0, "must list at least one item")
        .refine(
            (items) => !items.includes("bodyweight") || items.length === 1,
            "bodyweight means no equipment, so it must be the only item"
        ),
    mechanic: z.enum(MECHANICS),
    level: z.enum(LEVELS),
    steps: z.array(text).min(2, "must have at least two steps").readonly(),
    tips: z.array(text).min(1, "remove the field instead of leaving it empty").readonly().exactOptional(),
    source: z.strictObject({ name: text, id: text }).exactOptional(),
});

// The shape of a file in exercises/. `$schema` only points editors at schema.json.
export const exerciseFileSchema = exerciseSchema.extend({
    $schema: z.string().exactOptional(),
});
