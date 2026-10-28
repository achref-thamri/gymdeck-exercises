# Exercises

[![CI](https://github.com/achref-thamri/gymdeck-exercises/actions/workflows/ci.yml/badge.svg)](https://github.com/achref-thamri/gymdeck-exercises/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@achref-thamri/exercises)](https://www.npmjs.com/package/@achref-thamri/exercises)

An open library of ~500 strength exercises: names, step-by-step instructions, target muscles, equipment and form tips. Every entry is validated in CI and shipped as typed data with no runtime dependencies. It powers the [Gymdeck](https://github.com/achref-thamri) workout app.

## Install

```sh
npm install @achref-thamri/exercises
```

## Usage

```ts
import { exercises, MUSCLES, type ExerciseSummary } from "@achref-thamri/exercises";

const chest = exercises.filter((exercise) => exercise.muscles.primary === "chest");
```

Steps are most of the data, so they ship in a separate entry. Load it only where you show instructions:

```ts
import { getSteps } from "@achref-thamri/exercises/steps";

getSteps("db-bench-press"); // ["Lie on a flat bench…", …]
```

The full data set is also available as plain JSON at `@achref-thamri/exercises/exercises.json`, and the file schema at `@achref-thamri/exercises/schema.json`.

## Data format

Each exercise is one file in [`exercises/`](exercises), named after its id:

```json
{
    "$schema": "../schema.json",
    "id": "db-bench-press",
    "name": "Dumbbell bench press",
    "muscles": { "primary": "chest", "secondary": ["triceps", "shoulders"] },
    "equipment": ["dumbbell", "bench"],
    "mechanic": "compound",
    "level": "beginner",
    "steps": ["Lie on a flat bench…", "Lower the dumbbells…"],
    "tips": ["Lower until elbows sit just below the bench."]
}
```

| Field       | Rules                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| `id`        | Permanent and matches the file name. New ids use kebab-case.                                 |
| `name`      | Unique, ignoring case.                                                                       |
| `muscles`   | One primary and any secondary muscles from [`MUSCLES`](src/vocabulary.ts), no repeats.       |
| `equipment` | Everything needed at once, from [`EQUIPMENT`](src/vocabulary.ts). `bodyweight` stands alone. |
| `mechanic`  | `compound` or `isolation`.                                                                   |
| `level`     | `beginner`, `intermediate` or `expert`.                                                      |
| `steps`     | At least two.                                                                                |
| `tips`      | Optional short form cues.                                                                    |
| `source`    | Optional credit for where the text came from.                                                |

Editors that understand `$schema` autocomplete fields and flag mistakes as you type.

## Contributing

1. Add or edit a file in `exercises/`.
2. Run `npm test`. It validates every file and reports all problems at once.
3. Open a pull request.

Ids are never renamed or removed, because apps store them in workout history. [`exercise-ids.json`](exercise-ids.json) records every id ever published, and the build fails if one goes missing.

## Versioning

[Semantic versioning](https://semver.org): new exercises, new optional fields and new vocabulary values are minor releases. Renaming or removing a field or value is a major release.

To release, bump the version in a pull request (`npm version minor --no-git-tag-version`). After it merges, tag the merge commit (`git tag v1.1.0 && git push origin v1.1.0`). CI stages the release on npm with [provenance](https://docs.npmjs.com/generating-provenance-statements), and a maintainer approves it with 2FA (`npm stage approve <id>` or on npmjs.com) to make it public.

## License

[MIT](LICENSE)
