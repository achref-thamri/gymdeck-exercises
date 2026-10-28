import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts", "src/steps.ts"],
    // CommonJS too, so Jest setups that don't transform node_modules (like jest-expo) can load it.
    format: ["esm", "cjs"],
    platform: "neutral",
    dts: true,
    copy: [{ from: "src/generated/exercises.json", to: "dist" }],
    // Fail the build if package.json exports don't match what was built.
    publint: true,
    attw: { profile: "node16" },
});
