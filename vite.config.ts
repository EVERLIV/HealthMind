import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Plugin to add version info to HTML
const versionPlugin = () => ({
  name: 'version-plugin',
  transformIndexHtml(html: string) {
    const timestamp = new Date().toISOString();
    return html.replace(
      '<meta name="msapplication-navbutton-color" content="#059669" />',
      `<meta name="msapplication-navbutton-color" content="#059669" />
    <meta name="version" content="2.0.0" />
    <meta name="build-timestamp" content="${timestamp}" />`
    );
  }
});

export default defineConfig({
  plugins: [
    react(),
    versionPlugin(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      external: ['chart.js', 'react-chartjs-2']
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify("2.0.0"),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
