import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function inspectSource(file, text, registry) {
  const issues = [];
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const report = (node, message) =>
    issues.push(
      `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${message}`,
    );
  const exceptions = registry.legacyRoleExceptions.filter((e) => e.path === file);
  const counts = new Map();
  const checkNative = (node, tag) => {
    if (Object.hasOwn(registry.nativeOwners, tag) && registry.nativeOwners[tag] !== file)
      report(
        node,
        `Use the approved ${tag} from ${registry.nativeOwners[tag] || "a registered shared component (none approved yet)"}; see UI-STANDARDS.json.`,
      );
  };
  const checkPackage = (node, specifier) => {
    if (
      !specifier.startsWith(".") &&
      !specifier.startsWith("@/") &&
      !specifier.startsWith("node:")
    ) {
      const parts = specifier.split("/");
      const packageName = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
      if (!registry.packageApprovals[packageName])
        report(
          node,
          `Unapproved package import ${packageName}; register its purpose and adapter in UI-STANDARDS.json.`,
        );
    }
    for (const [name, approval] of Object.entries(registry.packageApprovals)) {
      const bindings = ts.isImportDeclaration(node) ? node.importClause?.namedBindings : undefined;
      const approvedHelpers =
        specifier === name &&
        ts.isImportDeclaration(node) &&
        !node.importClause?.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 &&
        bindings.elements.every((e) =>
          approval.allowedNamedImports?.includes((e.propertyName || e.name).text),
        );
      if (
        (specifier === name || specifier.startsWith(`${name}/`)) &&
        approval.owner !== "*" &&
        approval.owner !== file &&
        !approvedHelpers
      )
        report(node, `Import ${name} only in its approved adapter ${approval.owner}.`);
    }
  };
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      checkNative(node, node.tagName.getText(source));
      for (const attr of node.attributes.properties) {
        if (ts.isJsxAttribute(attr) && attr.name.text === "role" && attr.initializer) {
          const init = ts.isJsxExpression(attr.initializer)
            ? attr.initializer.expression
            : attr.initializer;
          const role = init && ts.isStringLiteral(init) ? init.text : null;
          if (registry.customWidgetRoles.includes(role)) {
            const entry = exceptions.find((e) => e.roles.includes(role));
            const count = (counts.get(role) || 0) + 1;
            counts.set(role, count);
            const approvedWidget = registry.components.some(
              (c) => c.path === file && c.status === "approved" && c.allowedRoles?.includes(role),
            );
            if (!approvedWidget && (!entry || count > entry.maxOccurrences))
              report(
                node,
                `Custom role="${role}" requires an approved shared widget and registry review.`,
              );
          }
        }
      }
    }
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))
        checkPackage(node, node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source);
      const first = node.arguments[0];
      if (first && ts.isStringLiteral(first)) {
        if (
          callee === "createElement" ||
          callee.endsWith(".createElement") ||
          callee.endsWith(".createElementNS")
        )
          checkNative(
            node,
            callee.endsWith(".createElementNS") &&
              node.arguments[1] &&
              ts.isStringLiteral(node.arguments[1])
              ? node.arguments[1].text
              : first.text,
          );
        if (callee === "import" || callee === "require") checkPackage(node, first.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (
    (file.endsWith("/screen.tsx") || file.endsWith("/page.tsx")) &&
    !text.includes(registry.screenRules.referenceComment)
  )
    issues.push(
      `${file}: Add the UI-STANDARDS.json reference comment. Rules apply to every screen.`,
    );
  return issues;
}

export function inspectRegistry(registry, packageJson, exists) {
  const issues = [];
  if (registry.version !== 1) issues.push("Unsupported UI registry version.");
  const seen = new Set();
  for (const component of registry.components) {
    if (
      !component.name ||
      !component.useFor ||
      !component.accessibility ||
      !["approved", "legacy-reference"].includes(component.status)
    )
      issues.push(`Incomplete UI approval: ${component.path}`);
    if (seen.has(component.path)) issues.push(`Duplicate UI registration: ${component.path}`);
    seen.add(component.path);
    if (!exists(component.path))
      issues.push(`Registered component does not exist: ${component.path}`);
  }
  for (const [tag, owner] of Object.entries(registry.nativeOwners))
    if (owner && !registry.components.some((c) => c.path === owner && c.status === "approved"))
      issues.push(`Native ${tag} owner must be an approved component: ${owner}`);
  for (const dep of Object.keys(packageJson.dependencies || {}))
    if (!registry.packageApprovals[dep])
      issues.push(`New runtime package ${dep} requires review and an entry in UI-STANDARDS.json.`);
  for (const [dep, approval] of Object.entries(registry.packageApprovals)) {
    if (!packageJson.dependencies?.[dep]) issues.push(`Stale package approval: ${dep}`);
    if (
      !approval.reason ||
      !approval.kind ||
      !approval.owner ||
      (approval.owner !== "*" && !seen.has(approval.owner))
    )
      issues.push(`Invalid package approval: ${dep}`);
  }
  for (const entry of registry.legacyRoleExceptions)
    if (
      !exists(entry.path) ||
      !entry.reason ||
      !Number.isInteger(entry.maxOccurrences) ||
      entry.maxOccurrences < 1
    )
      issues.push(`Invalid legacy exception: ${entry.path}`);
  return issues;
}

export function checkProject(root) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const registry = JSON.parse(read("UI-STANDARDS.json"));
  const exists = (p) => fs.existsSync(path.join(root, p));
  const issues = inspectRegistry(registry, JSON.parse(read("package.json")), exists);
  function files(dir) {
    return fs
      .readdirSync(path.join(root, dir), { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  }
  for (const file of ["app", "features", "components"]
    .flatMap(files)
    .filter((f) => /\.[jt]sx?$/.test(f))) {
    if (
      file.startsWith("components/") &&
      file.endsWith(".tsx") &&
      !registry.components.some((c) => c.path === file)
    )
      issues.push(`${file}: New shared components must be registered in UI-STANDARDS.json.`);
    issues.push(...inspectSource(file, read(file), registry));
  }
  if (!read("tailwind.config.ts").includes("./features/**/*.{ts,tsx}"))
    issues.push("Tailwind must scan feature modules.");
  return issues;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = checkProject(process.cwd());
  if (issues.length) {
    console.error(issues.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      "UI standards passed: registry, approved controls, adapters, screen references and dependencies.",
    );
}
