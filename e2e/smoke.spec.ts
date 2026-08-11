import { expect, test, type Page } from "@playwright/test";

/**
 * Public-site + admin-gate smoke tests.
 * Independent of production credentials — no real logins.
 */

async function dismissCookieOrOverlays(page: Page) {
  // Best-effort: ignore if nothing to dismiss.
  await page.keyboard.press("Escape").catch(() => undefined);
}

test.describe("public site smoke", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.ok() || response?.status() === 304).toBeTruthy();

    await expect(page.locator("body")).toBeVisible();
    // Brand signal in chrome or hero (CMS logo alt / company name / site copy).
    await expect(
      page.getByRole("banner").or(page.locator("header")).first(),
    ).toBeVisible();
    await expect(page.getByText(/Synergy/i).first()).toBeVisible();
  });

  test("main navigation links work", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissCookieOrOverlays(page);

    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary).toBeVisible();

    // Mega-menu opens on hover; avoid hover interception with a DOM click.
    const services = primary.locator('a[href="/services"]').first();
    await expect(services).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/services\/?$/),
      services.evaluate((el: HTMLAnchorElement) => el.click()),
    ]);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Contact is a header CTA (not always inside Primary nav).
    const contactCta = page.locator('header a[href="/contact"]').first();
    await expect(contactCta).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/contact\/?$/),
      contactCta.evaluate((el: HTMLAnchorElement) => el.click()),
    ]);
  });

  test("contact page loads", async ({ page }) => {
    const response = await page.goto("/contact", { waitUntil: "domcontentloaded" });
    expect(response?.ok() || response?.status() === 304).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();
  });

  test("contact form validation works", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    const name = page.locator("#name");
    const email = page.locator("#email");
    const message = page.locator("#message");
    const submit = page.getByRole("button", { name: /send message/i });

    await expect(name).toHaveAttribute("required", "");
    await expect(email).toHaveAttribute("required", "");
    await expect(message).toHaveAttribute("required", "");

    // Empty submit must not succeed (HTML constraint validation).
    await submit.click();
    await expect(page.getByText(/message received/i)).toHaveCount(0);
    expect(await name.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(
      true,
    );

    await name.fill("Playwright Tester");
    await email.fill("not-an-email");
    await message.fill("Hello from e2e validation check.");
    await submit.click();
    await expect(page.getByText(/message received/i)).toHaveCount(0);
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

    // Valid shape: browser constraints pass (we do not assert API success —
    // avoids writing spam or depending on Admin SDK in CI).
    await email.fill("playwright-e2e@example.com");
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
    expect(await name.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
    expect(await message.evaluate((el: HTMLTextAreaElement) => el.validity.valid)).toBe(
      true,
    );
  });

  test("newsletter form validation works", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const email = page.locator('footer input[type="email"], footer input[name="email"]').first();
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("required", "");

    const form = email.locator("xpath=ancestor::form[1]");
    const subscribe = form.getByRole("button", { name: /subscribe/i });

    await subscribe.click();
    await expect(page.getByText(/thanks for subscribing/i)).toHaveCount(0);
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(
      true,
    );

    await email.fill("not-valid");
    await subscribe.click();
    await expect(page.getByText(/thanks for subscribing/i)).toHaveCount(0);
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

    await email.fill("playwright-newsletter@example.com");
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
  });

  test("mobile navigation opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissCookieOrOverlays(page);

    const menuButton = page.locator('header button[aria-controls="mobile-nav"]');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Wait until the client Navbar has hydrated (React props attached).
    await page.waitForFunction(() => {
      const el = document.querySelector('header button[aria-controls="mobile-nav"]');
      if (!el) return false;
      return Object.keys(el).some((key) => key.startsWith("__reactProps"));
    });

    // dispatchEvent avoids Playwright's hover/force click toggling open→closed.
    await menuButton.dispatchEvent("click");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const drawer = page.locator("#mobile-nav");
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("role", "dialog");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("unknown route displays custom 404", async ({ page }) => {
    const response = await page.goto("/this-route-should-not-exist-e2e", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);

    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to homepage/i })).toBeVisible();
  });
});

test.describe("admin gate smoke", () => {
  test("admin login page loads", async ({ page }) => {
    const response = await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    expect(response?.ok() || response?.status() === 304).toBeTruthy();

    // Wait until session check finishes (or form is already shown).
    await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("protected admin route rejects unauthenticated access", async ({ page }) => {
    // Clear any stale cookies from other tests/browsers in this context.
    await page.context().clearCookies();

    await page.goto("/admin/messages", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/admin\/login/);
    expect(page.url()).toMatch(/[?&]next=/);

    await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
