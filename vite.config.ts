import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		port: parseInt(process.env.PORT || "4321"),
		host: "0.0.0.0",
	},
	preview: {
		port: parseInt(process.env.PORT || "4321"),
		host: "0.0.0.0",
	},
});
