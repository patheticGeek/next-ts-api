import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/loader-client.ts",
    "src/loader-api.ts",
    "src/client/index.ts",
    "src/api.ts"
  ],
  external: ["next/server", "next", "react"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "esnext",
});
