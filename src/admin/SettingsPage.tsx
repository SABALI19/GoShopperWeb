import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { parseSettingsDraft, type SettingsDraft, type SettingsPayload } from "./settingsForm";

type PlatformSettings = SettingsPayload & { source?: string; updatedAt?: string | null };

async function requestSettings<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const api = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  if (!api) throw new Error("VITE_API_URL is not configured.");
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status})`);
  return body as T;
}

export async function savePlatformSettings(token: string, payload: SettingsPayload, fetcher: typeof fetch = fetch) {
  const api = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  if (!api) throw new Error("VITE_API_URL is not configured.");
  const response = await fetcher(`${api}/api/admin/settings`, {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status})`);
  return body as { settings: PlatformSettings };
}

export default function SettingsPage() {
  const { getToken } = useAuth();
  const client = useQueryClient();
  const [draft, setDraft] = useState<SettingsDraft>({ multiStoreCheckoutMinimumNaira: "", deliveryFeeNaira: "", serviceFeeNaira: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SettingsDraft, string>>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Sign in again.");
      return requestSettings<{ settings: PlatformSettings }>("/api/admin/settings", token);
    },
  });

  useEffect(() => {
    const settings = settingsQuery.data?.settings;
    if (!settings) return;
    setDraft({
      multiStoreCheckoutMinimumNaira: formatNairaInput(settings.multiStoreCheckoutMinimumKobo),
      deliveryFeeNaira: formatNairaInput(settings.deliveryFeeKobo),
      serviceFeeNaira: formatNairaInput(settings.serviceFeeKobo),
    });
  }, [settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: async (payload: SettingsPayload) => {
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Sign in again.");
      return savePlatformSettings(token, payload);
    },
    onSuccess: async () => {
      setMessage({ type: "success", text: "Settings saved successfully." });
      await client.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (error) => setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save settings." }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const result = parseSettingsDraft(draft);
    setFieldErrors(result.errors);
    if (!result.payload) return;
    mutation.mutate(result.payload);
  };

  return <>
    <div className="admin-page-heading"><div><span>PLATFORM CONTROL</span><h1>Platform settings</h1><p>Manage checkout thresholds and platform fees. Amounts are entered in naira and stored in kobo.</p></div></div>
    {settingsQuery.isLoading ? <div className="admin-state"><span className="admin-spinner" />Loading settings…</div> : null}
    {settingsQuery.error ? <div className="admin-state admin-error"><strong>Could not load settings</strong><span>{settingsQuery.error.message}</span><button className="admin-button admin-button--outline" onClick={() => void settingsQuery.refetch()}>Try again</button></div> : null}
    {settingsQuery.data ? <form className="admin-panel admin-settings-panel" onSubmit={submit} noValidate>
      <div className="admin-settings-fields">
        <NairaField label="Multi-store checkout minimum" field="multiStoreCheckoutMinimumNaira" hint="Combined merchandise subtotal across multiple stores. Delivery and service fees are excluded." draft={draft} setDraft={setDraft} error={fieldErrors.multiStoreCheckoutMinimumNaira} />
        <NairaField label="Estimated delivery fee" field="deliveryFeeNaira" draft={draft} setDraft={setDraft} error={fieldErrors.deliveryFeeNaira} />
        <NairaField label="Service fee" field="serviceFeeNaira" draft={draft} setDraft={setDraft} error={fieldErrors.serviceFeeNaira} />
      </div>
      <p className="admin-footnote">Current source: {settingsQuery.data.settings.source || "database"}. Changes are stored in kobo.</p>
      {message ? <div role={message.type === "error" ? "alert" : "status"} className={`admin-inline-message ${message.type === "error" ? "admin-inline-message--error" : "admin-inline-message--success"}`}>{message.text}</div> : null}
      <button className="admin-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save settings"}</button>
    </form> : null}
  </>;
}

function NairaField({ label, field, hint, draft, setDraft, error }: {
  label: string; field: keyof SettingsDraft; hint?: string; draft: SettingsDraft;
  setDraft: (draft: SettingsDraft) => void; error?: string;
}) {
  const id = `settings-${field}`;
  return <label className="admin-field" htmlFor={id}>{label}{hint ? <small>{hint}</small> : null}<span className={`admin-money-input ${error ? "has-error" : ""}`}><b>₦</b><input id={id} name={field} type="text" inputMode="decimal" value={draft[field]} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} /></span>{error ? <small id={`${id}-error`} className="admin-field-error">{error}</small> : null}</label>;
}

function formatNairaInput(kobo: number) {
  return (kobo / 100).toFixed(2);
}
