# Optimized DesignMD QA Pipeline
1. [Context] Read `design.md` and identify the specific section for the target component.
2. [Audit] Call @ux-audit using ONLY that section's requirements.
3. [Testing] Call @astro-qa to ensure Astro's hydration logic doesn't break the UI/UX states.
4. [Verification] Execute `npm run test` via the Bash MCP server to confirm functional parity.
