// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readFtp, writeFtp } from "./storage";

describe("storage helpers", () => {
  it("returns null when window is undefined", () => {
    const original = (globalThis as any).window;
    // @ts-ignore
    delete (globalThis as any).window;
    expect(readFtp()).toBeNull();
    (globalThis as any).window = original;
  });

  it("persists and reads numeric FTP values", () => {
    writeFtp(250);
    expect(localStorage.getItem("wg:ftp")).toBe("250");
    expect(readFtp()).toBe(250);
  });

  it("ignores non-numeric stored values", () => {
    localStorage.setItem("wg:ftp", "abc");
    expect(readFtp()).toBeNull();
  });
});
