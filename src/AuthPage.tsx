import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Header from "./components/Header";
import SiteFooter from "./components/SiteFooter";

export function AuthPage({ mode, role = "supermarket" }: { mode: "in" | "up"; role?: "customer" | "supermarket" | "rider" }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const resetToken = params.get("token") || "";
  const requestedReturnTo = params.get("returnTo");
  const registrationContinuation = requestedReturnTo === "/welcome/customer" || requestedReturnTo === "/register/supermarket" || requestedReturnTo === "/register/rider" ? requestedReturnTo : undefined;
  const emailVerification = pathname === "/verify-email";
  const recovery = pathname === "/forgot-password";
  const resetting = pathname === "/reset-password";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!emailVerification || !resetToken) return;
    setBusy(true);
    void auth.verifyEmail(resetToken)
      .then(() => setNotice(registrationContinuation === "/welcome/customer"
        ? "Your email is verified. Sign in to finish setting up your Go-Shopper account."
        : registrationContinuation
          ? "Your email is verified. Sign in to continue to your application form."
          : "Email verified. You can now sign in or continue your application."))
      .catch((e) => setError(e instanceof Error ? e.message : "Verification link is invalid or expired."))
      .finally(() => setBusy(false));
  }, [auth.verifyEmail, emailVerification, resetToken, registrationContinuation]);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      if (recovery) {
        await auth.forgot(email);
        setNotice("If an account exists and email delivery is available, reset instructions will arrive by email.");
      } else if (resetting) {
        await auth.reset(resetToken, password);
        setNotice("Password updated. Sign in with the new password.");
      } else if (mode === "in") {
        const user = await auth.signIn(email, password);
        const destination = user.role === "admin" ? "/admin"
          : user.role === "supermarket" ? user.approvalStatus === "approved" ? "/supermarket" : "/application/status"
            : user.role === "rider" ? user.approvalStatus === "approved" ? "/rider" : "/application/status" : "/";
        navigate(typeof location.state?.from === "string" ? location.state.from : destination);
      } else {
        const result = await auth.register(role, { firstName, lastName, email, phone, password });
        setVerifying(true);
        setNotice(`${result.verification.emailSent ? "Verification email accepted for delivery." : "Email delivery is not configured or is unavailable; request a resend when the service is ready."} ${result.verification.phoneCodeSent ? "SMS code accepted for delivery." : "SMS delivery is not configured or is unavailable; request a resend when the service is ready."}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete request.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await auth.verifyPhone(email, code);
      setNotice("Phone verified. Check your email and open the verification link before signing in.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const signupFields = mode === "up" && !verifying && !emailVerification && !recovery && !resetting;
  const form = <form className={mode === "up" ? "auth-form" : "grid gap-4"} onSubmit={(event) => { event.preventDefault(); void (verifying ? verify() : submit()); }}>
    {signupFields ? <div className="form-grid auth-signup-fields">
      <label>First name<input required autoComplete="given-name" placeholder="Enter your first name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
      <label>Last name<input autoComplete="family-name" placeholder="Enter your last name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
      <label>Phone number<input required type="tel" autoComplete="tel" placeholder="Enter your phone number" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
      <label>Email address<input required type="email" autoCapitalize="none" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="wide">Password<input required type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    </div> : null}
    {verifying ? (mode === "up" ? <label className="auth-field">SMS verification code<input required inputMode="numeric" placeholder="Enter the code sent to your phone" value={code} onChange={(event) => setCode(event.target.value)} /></label> : <input required placeholder="SMS verification code" value={code} onChange={(event) => setCode(event.target.value)} />) : null}
    {mode === "in" && !emailVerification && !verifying ? <>
      <input required type="text" autoCapitalize="none" placeholder="Email address or phone number" value={email} onChange={(event) => setEmail(event.target.value)} />
      {!recovery ? <input required type="password" placeholder={resetting ? "New password" : "Password"} value={password} onChange={(event) => setPassword(event.target.value)} /> : null}
    </> : null}
    {notice ? <p role="status">{notice}</p> : null}
    {error ? (mode === "up" ? <div className="alert" role="alert">{error}</div> : <p role="alert">{error}</p>) : null}
    {emailVerification && notice && !error ? <button type="button" className="button" onClick={() => navigate("/sign-in", registrationContinuation ? { state: { from: registrationContinuation } } : undefined)}>Continue to sign in</button> : null}
    {!emailVerification ? <button className="button" disabled={busy}>{busy ? "Please wait..." : verifying ? "Verify phone" : recovery ? "Send reset link" : resetting ? "Reset password" : mode === "in" ? "Sign in" : "Create account"}</button> : null}
    {mode === "in" && !recovery && !resetting ? <button type="button" onClick={() => navigate("/forgot-password")}>Forgot password?</button> : null}
    {verifying ? <button type="button" onClick={() => void auth.resend(email)}>Resend verification</button> : null}
    <p>{mode === "in" ? <>Need an account? <Link to="/sign-up">Register</Link></> : <>Already registered? <Link to="/sign-in">Sign in</Link></>}</p>
  </form>;

  if (mode === "up") {
    return <><Header /><main className="form-page auth-signup-page">
      <Link to="/" aria-label="Back to Go-Shopper" className="mb-6 inline-flex items-center justify-center rounded-md bg-brand-orange p-4 text-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
      </Link>
      <div className="form-intro">
        <span className="eyebrow">{role === "customer" ? "Customer registration" : role === "rider" ? "Delivery rider application" : "Supermarket partner application"}</span>
        <h1>{verifying ? "Verify your details" : emailVerification ? "Verify your email" : `Start your ${role} journey.`}</h1>
        <p>{role === "customer" ? "Create your Go-Shopper account to get started." : "Create your account first. After verification, you can complete your application for review."}</p>
      </div>
      <section className="application-form auth-signup-card">{form}</section>
    </main><SiteFooter /></>;
  }

  return <><header className="bg-brand-ink px-5 py-4 sm:px-8"><Link to="/" className="brand">Go-Shopper</Link></header><main className="auth"><div className="auth-aside"><Link to="/" aria-label="Back to Go-Shopper" className="mb-8 inline-flex items-center justify-center rounded-md bg-brand-orange p-4 text-white"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg></Link><span className="eyebrow">Welcome to Go-Shopper</span><h1>{emailVerification ? "Verify your email" : recovery ? "Forgot password" : resetting ? "Reset your password" : "Good to have you back."}</h1><p>Sign in or create an account to submit and follow your application.</p></div><div className="auth-box">{form}</div></main><SiteFooter /></>;
}
