// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
	input: "src/index.ts", // Entry point of your app
	output: {
		file: "dist/bundle.js", // Output bundle file
		format: "cjs", // CommonJS format
	},
	plugins: [
		nodeResolve({
			extensions: [".js", ".ts"],
		}),
		typescript(),
	],
	external: [
		/* add external modules here if any, like 'express' */
	],
};
