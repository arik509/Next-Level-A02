import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    "api/index": "api/index.ts",
  },
  format: ["esm"],
  outDir: "dist",
  target: "node18",
  clean: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  bundle: true,
});