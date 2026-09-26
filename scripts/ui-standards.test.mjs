import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { inspectSource, inspectRegistry, checkProject } from "./check-ui.mjs";
const registry = JSON.parse(
  fs.readFileSync(new URL("../UI-STANDARDS.json", import.meta.url), "utf8"),
);
const inspect = (text, file = "features/example/widget.tsx") => inspectSource(file, text, registry);

test("rejects raw dropdowns and createElement alternatives", () => {
  assert.equal(inspect("const x = <select><option>One</option></select>").length, 1);
  assert.equal(inspect('const x = React.createElement("select")').length, 1);
});
test("accepts approved composition and primitive ownership", () => {
  assert.deepEqual(
    inspect(
      'import Select from "@/components/ui/Select"; const x = <Select><option>One</option></Select>',
    ),
    [],
  );
  assert.deepEqual(inspect("const x = <select />", "components/ui/Select.tsx"), []);
});
test("requires a screen reference", () => {
  assert.equal(
    inspect("export default function Screen() { return <div /> }", "features/example/screen.tsx")
      .length,
    1,
  );
});
test("blocks custom widgets including expression-valued roles", () => {
  assert.equal(inspect('const x = <div role={"combobox"} />').length, 1);
});
test("legacy exceptions cannot expand their instance count", () => {
  const code =
    '// UI standard: UI-STANDARDS.json\nconst x = <><div role="dialog" /><div role="dialog" /></>';
  assert.equal(inspect(code, "features/patient/profile/screen.tsx").length, 1);
});
test("supports a reviewed new shared widget", () => {
  const changed = structuredClone(registry);
  changed.components.push({
    name: "Combobox",
    path: "components/ui/Combobox.tsx",
    status: "approved",
    useFor: "Search",
    accessibility: "Keyboard and labelled options",
    allowedRoles: ["combobox"],
  });
  assert.deepEqual(
    inspectSource("components/ui/Combobox.tsx", 'const x = <div role="combobox" />', changed),
    [],
  );
});
test("vendor components cannot bypass their adapter", () => {
  assert.equal(inspect('import Phone from "react-phone-number-input"').length, 1);
  assert.equal(inspect('const Phone = import("react-phone-number-input")').length, 1);
  assert.deepEqual(
    inspect('import { isValidPhoneNumber as valid } from "react-phone-number-input"'),
    [],
  );
  assert.equal(inspect('import { default as Phone } from "react-phone-number-input"').length, 1);
});
test("new dependencies and missing shared files fail registry review", () => {
  const deps = Object.fromEntries(Object.keys(registry.packageApprovals).map((key) => [key, "1"]));
  const errors = inspectRegistry(
    registry,
    { dependencies: { ...deps, "another-dropdown": "1" } },
    () => false,
  );
  assert.ok(errors.some((e) => e.includes("another-dropdown")));
  assert.ok(errors.some((e) => e.includes("does not exist")));
});
test("the complete project follows its registered UI boundaries", () => {
  assert.deepEqual(checkProject(process.cwd()), []);
});

test("unregistered vendor imports fail even without a runtime dependency entry", () => {
  assert.equal(inspect('import Select from "another-dropdown"').length, 1);
  assert.equal(inspect('const x = document.createElementNS("html", "select")').length, 1);
});
