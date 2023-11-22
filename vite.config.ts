import { defineConfig } from "vite";
import { resolve, parse } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals";
import packageJson from "./package.json";

// TODO: auto remove console.log from build
// TODO: improve how docs are generated

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		esbuild: {
			drop: mode === "production" ? ["console", "debugger"] : [],
		},
		build: {
			sourcemap: true,
			modulePreload: {
				polyfill: false,
			},
			rollupOptions: {
				// Grabs file name from package.json for dist
				output: [
					{
						entryFileNames: () => `${parse(packageJson.main).name}.js`,
						dir: "dist",
					},
				],
				plugins: [
					minifyHTML.default({
						options: {
							shouldMinify(template) {
								return template.parts.some((part) => {
									// Matches Polymer templates that are not tagged
									return part.text.includes("<style") || part.text.includes("<div");
								});
							},
						},
					}),
				],
			},
		},
	};
});
