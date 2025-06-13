import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), cloudflare()],
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
	build: {
		rollupOptions: {
			input: {
				main: 'index.html',
				widget: 'src/widget.tsx'
			},
			output: {
				entryFileNames: (chunkInfo) => {
					return chunkInfo.name === 'widget' ? 'widget.js' : '[name]-[hash].js'
				}
			}
		}
	}
});
