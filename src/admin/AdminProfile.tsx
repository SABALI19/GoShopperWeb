import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth, type WebUser } from "../auth/AuthProvider";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export type AdminProfileData = Partial<WebUser> & {
  id?: string;
  phone?: string;
  role?: string;
  approvalStatus?: string;
  isSuspended?: boolean;
  avatarUrl?: string;
  lastLoginAt?: string | null;
};

export function useAdminProfile() {
  const { user, getToken } = useAuth();
  const query = useQuery({
    queryKey: ["admin", "profile", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 0,
    queryFn: async () => {
      if (!API) throw new Error("VITE_API_URL is not configured.");
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Sign in again.");
      const response = await fetch(`${API}/api/users/me`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error?.message || `Profile request failed (${response.status})`);
      if (!body?.user) throw new Error("Your profile is unavailable.");
      return body.user as AdminProfileData;
    },
  });

  return { ...query, profile: (query.data ?? user ?? null) as AdminProfileData | null };
}

export function AdminProfile({ placement }: { placement: "sidebar" | "header" }) {
  const { profile, isLoading, isError } = useAdminProfile();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();
  const initials = getInitials(name, profile?.email);
  const accountStatus = typeof profile?.isSuspended === "boolean"
    ? profile.isSuspended ? "Suspended" : "Active"
    : profile?.approvalStatus;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    try { await signOut(); } catch { /* The local session is cleared even if the server logout request fails. */ }
    queryClient.clear();
    navigate("/admin/login", { replace: true });
  };

  return <div ref={rootRef} className={`admin-profile admin-profile--${placement}`}>
    <button type="button" className="admin-profile-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <Avatar profile={profile} initials={initials} loading={isLoading} />
      <span className="admin-profile-summary"><strong>{name || (isLoading ? "Loading profile…" : "Profile")}</strong><small>{profile?.role ? humanRole(profile.role) : "Administrator"}</small></span>
      <span aria-hidden="true" className="admin-profile-chevron">⌄</span>
    </button>
    {open ? <section className="admin-profile-card" role="dialog" aria-label="Administrator profile">
      <div className="admin-profile-card-heading"><Avatar profile={profile} initials={initials} loading={isLoading} /><div><strong>{name || "Profile"}</strong>{profile?.role ? <small>{humanRole(profile.role)}</small> : null}</div></div>
      {profile?.email ? <ProfileDetail label="Email" value={profile.email} /> : null}
      {profile?.role ? <ProfileDetail label="Role" value={humanRole(profile.role)} /> : null}
      {profile?.phone ? <ProfileDetail label="Phone" value={profile.phone} /> : null}
      {accountStatus ? <ProfileDetail label="Account status" value={accountStatus} /> : null}
      {profile?.lastLoginAt ? <ProfileDetail label="Last login" value={new Date(profile.lastLoginAt).toLocaleString()} /> : null}
      {isError ? <p className="admin-profile-note">Profile details could not be refreshed. Showing the signed-in account details available to this page.</p> : null}
      {isLoading ? <span className="admin-profile-note">Loading account details…</span> : null}
      <button type="button" className="admin-profile-signout" onClick={() => void handleSignOut()}>Sign out</button>
    </section> : null}
  </div>;
}

function Avatar({ profile, initials, loading }: { profile: AdminProfileData | null; initials: string; loading: boolean }) {
  return profile?.avatarUrl
    ? <img className="admin-avatar admin-avatar-image" src={profile.avatarUrl} alt={`${profile.firstName || "Admin"} avatar`} />
    : <span className={`admin-avatar ${loading ? "is-loading" : ""}`} aria-label={nameForAvatar(profile)}>{initials}</span>;
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return <div className="admin-profile-detail"><small>{label}</small><span>{value}</span></div>;
}

function getInitials(name?: string, email?: string) {
  const parts = name?.split(/\s+/).filter(Boolean) ?? [];
  if (parts.length) return parts.slice(0, 2).map(part => part[0].toUpperCase()).join("");
  return email?.[0]?.toUpperCase() || "?";
}

function nameForAvatar(profile: AdminProfileData | null) {
  return [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || profile?.email || "Administrator profile";
}

function humanRole(role: string) {
  return role.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}
