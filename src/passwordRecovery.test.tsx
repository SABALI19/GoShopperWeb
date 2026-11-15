import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";

const { forgot, reset } = vi.hoisted(() => ({ forgot: vi.fn(), reset: vi.fn() }));
vi.mock("./auth/AuthProvider", () => ({ useAuth: () => ({ forgot, reset, verifyEmail: vi.fn(), signIn: vi.fn(), register: vi.fn(), verifyPhone: vi.fn(), resend: vi.fn() }) }));

function CurrentPath() { return <output>{useLocation().pathname}</output>; }

beforeEach(() => { forgot.mockReset().mockResolvedValue(undefined); reset.mockReset().mockResolvedValue(undefined); });

it("requests a reset email and routes back to the admin sign-in when recovery started there", async () => {
  render(<MemoryRouter initialEntries={["/admin/login"]}><Routes>
    <Route path="/admin/login" element={<AuthPage mode="in" />} />
    <Route path="/forgot-password" element={<><AuthPage mode="in" /><CurrentPath /></>} />
  </Routes></MemoryRouter>);

  fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
  fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "admin@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

  await waitFor(() => expect(forgot).toHaveBeenCalledWith("admin@example.com"));
  expect(await screen.findByText(/reset instructions will arrive by email/i)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/admin/login");
});

it("submits the reset token and new password, then offers sign-in", async () => {
  render(<MemoryRouter initialEntries={["/reset-password?token=one-time-token&returnTo=%2Fadmin%2Flogin"]}><Routes>
    <Route path="/reset-password" element={<><AuthPage mode="in" /><CurrentPath /></>} />
    <Route path="/admin/login" element={<CurrentPath />} />
  </Routes></MemoryRouter>);

  fireEvent.change(screen.getByPlaceholderText("New password (at least 10 characters)"), { target: { value: "a-secure-new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

  await waitFor(() => expect(reset).toHaveBeenCalledWith("one-time-token", "a-secure-new-password"));
  fireEvent.click(await screen.findByRole("button", { name: "Continue to sign in" }));
  await waitFor(() => expect(screen.getByText("/admin/login")).toBeTruthy());
});
