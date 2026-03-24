import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RootApp from "./RootApp";
import { resetAppStore } from "./store/app-store";

afterEach(() => {
  window.history.replaceState({}, "", "/");
  window.location.hash = "";
  vi.unstubAllGlobals();
  resetAppStore();
});

describe("RootApp", () => {
  it("renders the landing page at the root hash and links into the app shell", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith("/problems")) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 1,
                slug: "two-sum",
                title: "Two Sum",
                difficulty: "easy",
                topic: "Arrays",
              },
            ],
          } as Response;
        }

        if (url.endsWith("/problems/1")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: 1,
              slug: "two-sum",
              title: "Two Sum",
              difficulty: "easy",
              topic: "Arrays",
              description: "Solve Two Sum.",
              examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
              constraints: ["2 <= nums.length"],
              starterTemplate: "function twoSum(nums, target) { return []; }",
              hints: ["Use a map."],
              sampleTests: [{ input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" }],
            }),
          } as Response;
        }

        throw new Error(`Unexpected fetch URL: ${url}`);
      }),
    );

    render(<RootApp />);

    expect(screen.getByRole("heading", { name: /Interview practice with immediate AI feedback/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /Start practicing/i }));
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /Codev top bar/i })).toBeInTheDocument();
    });
  });
});
