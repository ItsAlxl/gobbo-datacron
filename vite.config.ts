import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		tailwindcss()
	],
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
});