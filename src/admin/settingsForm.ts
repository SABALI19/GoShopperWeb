export type SettingsDraft = {
  multiStoreCheckoutMinimumNaira: string;
  deliveryFeeNaira: string;
  serviceFeeNaira: string;
};

export type SettingsPayload = {
  multiStoreCheckoutMinimumKobo: number;
  deliveryFeeKobo: number;
  serviceFeeKobo: number;
};

type ParseResult = { payload?: SettingsPayload; errors: Partial<Record<keyof SettingsDraft, string>> };

const fields = [
  ["multiStoreCheckoutMinimumNaira", "multiStoreCheckoutMinimumKobo", "Multi-store checkout minimum", 1, 100_000_000],
  ["deliveryFeeNaira", "deliveryFeeKobo", "Delivery fee", 0, 1_000_000_000],
  ["serviceFeeNaira", "serviceFeeKobo", "Service fee", 0, 1_000_000_000],
] as const;

export function parseSettingsDraft(draft: SettingsDraft): ParseResult {
  const errors: ParseResult["errors"] = {};
  const payload = {} as SettingsPayload;

  for (const [draftKey, payloadKey, label, minimum, maximum] of fields) {
    const raw = draft[draftKey].trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
      errors[draftKey] = `${label} must be a valid naira amount with up to two decimal places.`;
      continue;
    }
    const [naira, fraction = ""] = raw.split(".");
    const kobo = Number(naira) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(kobo) || kobo < minimum || kobo > maximum) {
      errors[draftKey] = `${label} must be between ${minimum === 0 ? "₦0.00" : "₦0.01"} and ${formatNaira(maximum)}.`;
      continue;
    }
    payload[payloadKey] = kobo;
  }

  return Object.keys(errors).length ? { errors } : { payload, errors };
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
