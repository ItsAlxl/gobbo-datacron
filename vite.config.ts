import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	base: "/gobbo-datacron/",
	plugins: [
		tailwindcss()
	],
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
});