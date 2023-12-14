import { defineConfig } from "vite";
import { resolve } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals";

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
				input: {
					main: resolve(__dirname, "index.html"),
					index: resolve(__dirname, "src/main.ts"),
					"action-table": resolve(__dirname, "src/action-table.ts"),
					"action-table-filters": resolve(__dirname, "src/action-table-filters.ts"),
					"action-table-switch": resolve(__dirname, "src/action-table-switch.ts"),
				},
				output: [
					{
						entryFileNames: `[name].js`,
						assetFileNames: `action-table.[ext]`,
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
