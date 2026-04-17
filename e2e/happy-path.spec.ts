import { test, expect } from "@playwright/test";

test("challenge selector renders on initial load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /챌린지/ })).toBeVisible();
});

test("selecting a challenge transitions to game scene", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /작은 오두막/ }).click();
  await expect(page.getByText(/ch-001/)).toBeVisible();
});

test("all 5 challenges appear", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /작은 오두막/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /회색 창고/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /2층 주택/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /탑/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /ㄱ자 별장/ })).toBeVisible();
});
