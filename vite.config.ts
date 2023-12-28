import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools } from "remix-development-tools/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [remixDevTools(), remix(), tsconfigPaths(), svgr()]
});
