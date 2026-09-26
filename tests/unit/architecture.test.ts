import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
function files(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    );
}
function source(file: string) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}
function imports(file: string) {
  return source(file)
    .statements.filter(ts.isImportDeclaration)
    .map((node) => (node.moduleSpecifier as ts.StringLiteral).text);
}
describe("architecture boundaries", () => {
  it("keeps routes as composition-only server components", () => {
    for (const file of files("app").filter((file) => file.endsWith("/page.tsx"))) {
      const text = fs.readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/use client|useEffect|useState|apiFetch|mock-data/);
      expect(text.split("\n").length, file).toBeLessThan(35);
    }
  });
  it("keeps HTTP clients outside presentation", () => {
    const screens = files("features").filter(
      (file) =>
        file.endsWith("/screen.tsx") ||
        (file.includes("device-management/components/") && file.endsWith(".tsx")),
    );
    for (const file of screens)
      expect(
        imports(file).filter((name) => /lib\/api$|lib\/http|\/api\//.test(name)),
        file,
      ).toEqual([]);
  });
  it("keeps JSX out of state controllers", () => {
    for (const file of files("features").filter(
      (file) => file.endsWith("/hooks.ts") || (file.includes("/hooks/") && file.endsWith(".ts")),
    )) {
      let jsx = false;
      function visit(node: ts.Node) {
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))
          jsx = true;
        ts.forEachChild(node, visit);
      }
      visit(source(file));
      expect(jsx, file).toBe(false);
    }
  });
  it("never reintroduces the legacy device upload action", () => {
    const code = files("features/device-management")
      .map((file) => fs.readFileSync(file, "utf8"))
      .join("\n");
    expect(code).not.toContain("/home-care/devices/upload");
  });
});
