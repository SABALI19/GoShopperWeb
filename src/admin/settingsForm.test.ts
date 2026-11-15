import { describe, expect, it, vi } from "vitest";
import { parseSettingsDraft } from "./settingsForm";
import { savePlatformSettings } from "./SettingsPage";

const validDraft = {
  multiStoreCheckoutMinimumNaira: "9000.00",
  deliveryFeeNaira: "150.25",
  serviceFeeNaira: "5",
};

describe("admin settings save", () => {
  it("converts naira to integer kobo and sends only accepted setting keys", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test");
    const parsed = parseSettingsDraft(validDraft);
    expect(parsed.errors).toEqual({});
    expect(parsed.payload).toEqual({ multiStoreCheckoutMinimumKobo: 900_000, deliveryFeeKobo: 15_025, serviceFeeKobo: 500 });
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ settings: parsed.payload }) });

    await savePlatformSettings("admin-token", parsed.payload!, fetcher);

    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/api/admin/settings", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ multiStoreCheckoutMinimumKobo: 900_000, deliveryFeeKobo: 15_025, serviceFeeKobo: 500 }),
    }));
  });

  it("rejects invalid naira precision inline and shows backend validation failures", async () => {
    expect(parseSettingsDraft({ ...validDraft, deliveryFeeNaira: "12.345" }).errors.deliveryFeeNaira)
      .toMatch(/up to two decimal places/);

    vi.stubEnv("VITE_API_URL", "https://api.example.test");
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: { message: "Delivery fee must be a whole number of kobo." } }) });
    await expect(savePlatformSettings("admin-token", { multiStoreCheckoutMinimumKobo: 900_000, deliveryFeeKobo: 1_200, serviceFeeKobo: 0 }, fetcher))
      .rejects.toThrow("Delivery fee must be a whole number of kobo.");
  });
});
