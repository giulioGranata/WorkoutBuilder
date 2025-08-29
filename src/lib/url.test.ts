// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { getParamInt, setParam } from "./url";

describe("url helpers", () => {
  it("getParamInt returns numbers and null appropriately", () => {
    const u1 = new URL("https://example.com/?bias=90");
    const u2 = new URL("https://example.com/");
    const u3 = new URL("https://example.com/?bias=abc");

    expect(getParamInt(u1, "bias")).toBe(90);
    expect(getParamInt(u2, "bias")).toBeNull();
    expect(getParamInt(u3, "bias")).toBeNull();
  });

  it("setParam updates URL and calls history.replaceState", () => {
    const u = new URL("https://example.com/");
    const spy = vi.spyOn(history, "replaceState").mockImplementation(() => {});
    setParam(u, "bias", 110);
    expect(u.searchParams.get("bias")).toBe("110");
    expect(spy).toHaveBeenCalledWith(null, "", u.toString());
    spy.mockRestore();
  });
});
