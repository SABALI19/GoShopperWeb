import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthPage } from "./AuthPage";
import { CustomerWelcomePage } from "./components/CustomerWelcomePage";
import Header from "./components/Header";
import { getAppDownloadUrl } from "./utils/appDownloadUrl";
import App from "./App";

const auth = vi.hoisted(() => ({
  ready: true,
  user: null as null | { id: string; firstName: string; lastName: string; email: string; phone: string; role: "customer" | "supermarket" | "rider" | "admin"; approvalStatus: string; emailVerified: boolean; phoneVerified: boolean },
  register: vi.fn(),
  verifyEmail: vi.fn(),
  signIn: vi.fn(),
  getToken: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("./auth/AuthProvider", () => ({ useAuth: () => auth }));
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value, title }: { value: string; title: string }) => <svg data-testid="app-download-qr" data-value={value} aria-label={title} />,
}));

const customer = { id: "customer-1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phone: "+2348012345678", role: "customer" as const, approvalStatus: "approved", emailVerified: true, phoneVerified: true };

function LocationText() {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}|{String(location.state?.from || "")}</output>;
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.ready = true;
  auth.user = null;
  auth.register.mockResolvedValue({ verification: { emailSent: true, phoneCodeSent: true } });
  auth.verifyEmail.mockResolvedValue(undefined);
  auth.signIn.mockResolvedValue(customer);
});
afterEach(cleanup);

describe("customer signup and download flow", () => {
  it("registers the normal signup form with the customer role", async () => {
    render(<MemoryRouter initialEntries={["/sign-up"]}><AuthPage mode="up" role="customer" /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("First name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByPlaceholderText("Phone number"), { target: { value: "08012345678" } });
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "safe-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(auth.register).toHaveBeenCalledWith("customer", expect.objectContaining({ email: "ada@example.com" })));
  });

  it("routes the normal app signup URL to customer registration", () => {
    render(<MemoryRouter initialEntries={["/sign-up"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Start your customer journey." })).toBeTruthy();
  });

  it.each([
    ["rider", "/register/rider"],
    ["supermarket", "/register/supermarket"],
  ] as const)("routes %s application entry to its fixed signup role", async (role, path) => {
    render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: `Start your ${role} journey.` })).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("First name"), { target: { value: "Applicant" } });
    fireEvent.change(screen.getByPlaceholderText("Phone number"), { target: { value: "08012345678" } });
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: `${role}@example.com` } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "safe-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(auth.register).toHaveBeenCalledWith(role, expect.any(Object)));
  });

  it("keeps header customer signup separate from supermarket and rider applications", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("link", { name: "Create a customer account" }).getAttribute("href")).toBe("/sign-up");
    expect(screen.getByRole("link", { name: "Apply as a supermarket" }).getAttribute("href")).toBe("/register/supermarket");
    expect(screen.getByRole("link", { name: "Apply as a delivery partner" }).getAttribute("href")).toBe("/register/rider");
  });

  it.each(["supermarket", "rider"] as const)("keeps %s registration on its existing role", async (role) => {
    render(<MemoryRouter><AuthPage mode="up" role={role} /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("First name"), { target: { value: "Sam" } });
    fireEvent.change(screen.getByPlaceholderText("Phone number"), { target: { value: "08012345678" } });
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "sam@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "safe-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(auth.register).toHaveBeenCalledWith(role, expect.any(Object)));
  });

  it("continues a verified customer to sign-in and then to the welcome route", async () => {
    render(<MemoryRouter initialEntries={["/verify-email?token=verification-token&returnTo=%2Fwelcome%2Fcustomer"]}>
      <Routes>
        <Route path="/verify-email" element={<AuthPage mode="in" />} />
        <Route path="/sign-in" element={<><AuthPage mode="in" /><LocationText /></>} />
        <Route path="/welcome/customer" element={<p>Customer welcome destination</p>} />
      </Routes>
    </MemoryRouter>);
    await screen.findByText("Your email is verified. Sign in to finish setting up your Go-Shopper account.");
    fireEvent.click(screen.getByRole("button", { name: "Continue to sign in" }));
    fireEvent.change(screen.getByPlaceholderText("Email address or phone number"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "safe-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Customer welcome destination")).toBeTruthy();
  });

  it.each([
    ["rider", "/register/rider"],
    ["supermarket", "/register/supermarket"],
  ] as const)("preserves the %s application form destination through email verification", async (_role, path) => {
    render(<MemoryRouter initialEntries={[`/verify-email?token=verification-token&returnTo=${encodeURIComponent(path)}`]}>
      <Routes>
        <Route path="/verify-email" element={<AuthPage mode="in" />} />
        <Route path="/sign-in" element={<><AuthPage mode="in" /><LocationText /></>} />
        <Route path={path} element={<p>Application form destination</p>} />
      </Routes>
    </MemoryRouter>);
    await screen.findByText("Your email is verified. Sign in to continue to your application form.");
    fireEvent.click(screen.getByRole("button", { name: "Continue to sign in" }));
    expect(screen.getByTestId("current-location").textContent).toBe(`/sign-in|${path}`);
    fireEvent.change(screen.getByPlaceholderText("Email address or phone number"), { target: { value: "applicant@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "safe-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Application form destination")).toBeTruthy();
  });

  it("renders the QR code and button with the same configured URL", () => {
    const downloadUrl = "https://expo.dev/accounts/goshopper/projects/go-shopper/builds/preview-build";
    render(<MemoryRouter><CustomerWelcomePage appDownloadUrl={downloadUrl} /></MemoryRouter>);
    expect(screen.getByTestId("app-download-qr").getAttribute("data-value")).toBe(downloadUrl);
    expect(screen.getByRole("link", { name: "Download Go-Shopper App" }).getAttribute("href")).toBe(downloadUrl);
  });

  it("shows a clear fallback when the download URL is missing or unsafe", () => {
    expect(getAppDownloadUrl(undefined)).toBeNull();
    expect(getAppDownloadUrl("http://localhost:8080/app.apk")).toBeNull();
    render(<MemoryRouter><CustomerWelcomePage appDownloadUrl="" /></MemoryRouter>);
    expect(screen.getByText(/app download link is not configured yet/i)).toBeTruthy();
    expect(screen.queryByTestId("app-download-qr")).toBeNull();
    expect(screen.queryByRole("link", { name: "Download Go-Shopper App" })).toBeNull();
  });

  it("allows only customer accounts through the customer welcome route", async () => {
    auth.user = customer;
    render(<MemoryRouter initialEntries={["/welcome/customer"]}><App /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Order from your favourite stores today with Go-Shopper!" })).toBeTruthy();
    cleanup();
    auth.user = { ...customer, role: "supermarket" };
    render(<MemoryRouter initialEntries={["/welcome/customer"]}><App /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Order from your favourite stores today with Go-Shopper!" })).toBeNull());
  });

  it("keeps the existing admin dashboard role route protected and available", async () => {
    auth.user = { ...customer, role: "admin" };
    render(<MemoryRouter initialEntries={["/admin"]}><App /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Admin dashboard" })).toBeTruthy();
    cleanup();
    auth.user = customer;
    render(<MemoryRouter initialEntries={["/admin"]}><App /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Admin dashboard" })).toBeNull());
  });
});
