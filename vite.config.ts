import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
// Public backend config (safe to ship in the browser). Fallbacks ensure the
// published build never ships without them if .env is missing at build time.
const FALLBACK_SUPABASE_URL = "https://emrvmqvgcquzccikxdaf.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcnZtcXZnY3F1emNjaWt4ZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODE4OTgsImV4cCI6MjA5MTk1Nzg5OH0.0RGzCefz4iamw-J-3yyg17VhZUvlotH4e8ezTyuLrLc";
const FALLBACK_PROJECT_ID = "emrvmqvgcquzccikxdaf";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const url = env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_KEY;
  const projectId = env.VITE_SUPABASE_PROJECT_ID || FALLBACK_PROJECT_ID;
  return {
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(key),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(projectId),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  };
});
