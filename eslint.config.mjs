import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "coverage/**",
  ]),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      // Request effects synchronize external systems; compiler-only recommendations
      // are not architecture gates while the application uses explicit hooks.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["app/**/page.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/api", "@/lib/http/*", "@/lib/mock-data"],
              message:
                "Routes compose feature screens; API access belongs in feature services/hooks.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "features/**/screen.tsx",
      "features/**/components.tsx",
      "features/device-management/components/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/api/*", "@/lib/api", "@/lib/http/*"],
              message: "Presentation components use feature hooks, never API clients.",
            },
          ],
        },
      ],
    },
  },
]);
