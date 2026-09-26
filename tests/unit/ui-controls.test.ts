import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

describe("approved UI controls", () => {
  it("does not accidentally submit forms unless explicitly requested", () => {
    expect(renderToStaticMarkup(createElement(Button, null, "Cancel"))).toContain('type="button"');
    const submit = renderToStaticMarkup(
      createElement(Button, { type: "submit", variant: "primary", disabled: true }, "Save"),
    );
    expect(submit).toContain('type="submit"');
    expect(submit).toContain('disabled=""');
    expect(submit).toContain("btn-primary");
  });
  it("preserves native dropdown values, validation and accessible descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        { name: "country", defaultValue: "CA", required: true, "aria-describedby": "country-help" },
        createElement("option", { value: "US" }, "United States"),
        createElement("option", { value: "CA" }, "Canada"),
      ),
    );
    expect(html).toContain('name="country"');
    expect(html).toContain('required=""');
    expect(html).toContain('aria-describedby="country-help"');
    expect(html).toMatch(/<option value="CA" selected="">Canada/);
  });
  it("keeps checkbox semantics without text-field sizing", () => {
    const html = renderToStaticMarkup(
      createElement(Input, { type: "checkbox", defaultChecked: true, "aria-label": "Confirm" }),
    );
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked=""');
    expect(html).toContain("accent-brand-600");
    expect(html).not.toContain('class="input');
  });
  it("forwards multiline field validation and layout props", () => {
    const html = renderToStaticMarkup(
      createElement(Textarea, {
        name: "reason",
        rows: 4,
        maxLength: 500,
        required: true,
        className: "mt-2",
      }),
    );
    expect(html).toContain('rows="4"');
    expect(html).toContain('maxLength="500"');
    expect(html).toContain("mt-2");
  });
});
