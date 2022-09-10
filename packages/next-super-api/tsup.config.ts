import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/loader-page.ts",
    "src/client/index.tsx",
  ],
  external: ["next/server", "next", "react", "@tanstack/react-query"],
  format: ["cjs", "esm"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  target: "esnext",
});
