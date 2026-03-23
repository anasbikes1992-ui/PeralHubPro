import { test, expect } from "../playwright-fixture";

const routes = [
  { path: "/", name: "Home" },
  { path: "/property", name: "Property" },
  { path: "/stays", name: "Stays" },
  { path: "/vehicles", name: "Vehicles" },
  { path: "/events", name: "Events" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/auth", name: "Auth" },
];

test.describe("Smoke tests — app boots without runtime errors", () => {
  for (const route of routes) {
    test(`${route.name} page (${route.path}) renders without errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on("pageerror", (err) => {
        errors.push(err.message);
      });

      await page.goto(route.path, { waitUntil: "networkidle" });

      // Page should not be blank
      const body = await page.locator("body").innerHTML();
      expect(body.length).toBeGreaterThan(100);

      // No "useState" null errors
      const useStateErrors = errors.filter((e) => e.includes("useState"));
      expect(useStateErrors).toHaveLength(0);

      // No uncaught runtime errors at all
      expect(errors).toHaveLength(0);
    });
  }
});
