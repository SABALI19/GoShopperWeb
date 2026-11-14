export function getAppDownloadUrl(value: string | undefined): string | null {
  const configured = value?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return null;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local")) return null;
    if (hostname.endsWith(".example") || hostname.endsWith(".example.com") || hostname === "example.com") return null;
    return configured;
  } catch {
    return null;
  }
}
