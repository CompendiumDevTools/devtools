import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "./dist",
		target: "ESNext",
		polyfillDynamicImport: false,
		lib: {
			entry: "src/content.ts",
			formats: ["cjs"],
			fileName: () => "content.js",
		},
	},
	base: "./",
});
