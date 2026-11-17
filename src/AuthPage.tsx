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
  const signInPath = requestedReturnTo === "/admin/login" ? "/admin/login" : "/sign-in";
  const registrationContinuation = requestedReturnTo === "/welcome/customer" || requestedReturnTo === "/register/supermarket" || requestedReturnTo === "/register/rider" ? requestedReturnTo : undefined;
  const emailVerification = pathname === "/verify-email";
  const recovery = pathname === "/forgot-password";
  const resetting = pathname === "/reset-password";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetComplete, setResetComplete] = useState(false);

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
        if (!resetToken) throw new Error("This reset link is missing its token. Request a new password reset link.");
        await auth.reset(resetToken, password);
        setNotice("Password updated. Sign in with the new password.");
        setResetComplete(true);
      } else if (mode === "in") {
        const user = await auth.signIn(email, password);
        const destination = user.role === "admin" ? "/admin"
          : user.role === "supermarket" ? user.approvalStatus === "approved" ? "/supermarket" : "/application/status"
            : user.role === "rider" ? user.approvalStatus === "approved" ? "/rider" : "/application/status" : "/";
        navigate(typeof location.state?.from === "string" ? location.state.from : destination);
      } else {
        const result = await auth.register(role, { firstName, lastName, email, phone, password });
        setVerificationPending(true);
        setNotice(result.verification.emailSent
          ? `A verification link was sent to ${email}. Open it to verify your account, then sign in.`
          : "Your account was created, but the verification email could not be sent. Configure Brevo SMTP, then request another email below.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete request.");
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    setBusy(true);
    setError("");
    try {
      await auth.resend(email);
      setNotice("If the account exists and still needs email verification, a fresh link will be sent. Check your inbox and spam folder.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resend the verification email.");
    } finally {
      setBusy(false);
    }
  };

  const signupFields = mode === "up" && !verificationPending && !emailVerification && !recovery && !resetting;
  const form = <form className={mode === "up" ? "auth-form" : "grid gap-4"} onSubmit={(event) => { event.preventDefault(); void submit(); }}>
    {signupFields ? <div className="form-grid auth-signup-fields">
      <label>First name<input required autoComplete="given-name" placeholder="Enter your first name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
      <label>Last name<input autoComplete="family-name" placeholder="Enter your last name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
      <label>Phone number<input required type="tel" autoComplete="tel" placeholder="Enter your phone number" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
      <label>Email address<input required type="email" autoCapitalize="none" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="wide">Password<input required type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    </div> : null}
    {mode === "in" && !emailVerification ? <>
      {!resetComplete ? <input required type={recovery ? "email" : "text"} autoCapitalize="none" autoComplete="email" placeholder={recovery ? "Email address" : "Email address or phone number"} value={email} onChange={(event) => setEmail(event.target.value)} /> : null}
      {!recovery && !resetComplete ? resetting ? <input required minLength={10} type="password" autoComplete="new-password" placeholder="New password (at least 10 characters)" value={password} onChange={(event) => setPassword(event.target.value)} /> : <span className="auth-password-field"><input required type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="auth-password-toggle" aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)}><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/>{passwordVisible ? <path strokeLinecap="round" d="m4 4 16 16"/> : null}</svg></button></span> : null}
    </> : null}
    {notice ? <p role="status">{notice}</p> : null}
    {error ? (mode === "up" ? <div className="alert" role="alert">{error}</div> : <p role="alert">{error}</p>) : null}
    {emailVerification && notice && !error ? <button type="button" className="button" onClick={() => navigate("/sign-in", registrationContinuation ? { state: { from: registrationContinuation } } : undefined)}>Continue to sign in</button> : null}
    {!emailVerification && !resetComplete && !verificationPending ? <button className="button" disabled={busy || (resetting && !resetToken)}>{busy ? "Please wait..." : recovery ? "Send reset link" : resetting ? "Reset password" : mode === "in" ? "Sign in" : "Create account"}</button> : null}
    {resetComplete ? <button type="button" className="button" onClick={() => navigate(signInPath, { replace: true })}>Continue to sign in</button> : null}
    {mode === "in" && !recovery && !resetting ? <button type="button" onClick={() => navigate(`/forgot-password?returnTo=${encodeURIComponent(pathname === "/admin/login" ? "/admin/login" : "/sign-in")}`)}>Forgot password?</button> : null}
    {verificationPending || (mode === "in" && !recovery && !resetting && !emailVerification) ? <button type="button" className={verificationPending ? "button" : "text-link"} disabled={busy || !/^\S+@\S+\.\S+$/.test(email.trim())} onClick={() => void resendVerification()}>{busy ? "Please wait..." : "Resend verification email"}</button> : null}
    {mode === "in" && pathname === "/admin/login" ? null : <p>{mode === "in" ? <>Need an account? <Link to="/sign-up">Register</Link></> : <>Already registered? <Link to="/sign-in">Sign in</Link></>}</p>}
    {mode === "in" && (recovery || resetting) && !resetComplete ? <p><Link to={signInPath}>Back to sign in</Link></p> : null}
  </form>;

  if (mode === "up") {
    return <><Header /><main className="form-page auth-signup-page">
      <Link to="/" aria-label="Back to Go-Shopper" className="mb-6 inline-flex items-center justify-center rounded-md bg-brand-orange p-4 text-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
      </Link>
      <div className="form-intro">
        <span className="eyebrow">{role === "customer" ? "Customer registration" : role === "rider" ? "Delivery rider application" : "Supermarket partner application"}</span>
        <h1>{verificationPending || emailVerification ? "Verify your email" : `Start your ${role} journey.`}</h1>
        <p>{role === "customer" ? "Create your Go-Shopper account to get started." : "Create your account first. After verification, you can complete your application for review."}</p>
      </div>
      <section className="application-form auth-signup-card">{form}</section>
    </main><SiteFooter /></>;
  }

  return <><header className="bg-brand-ink px-5 py-4 sm:px-8"><Link to="/" className="brand">Go-Shopper</Link></header><main className="auth"><div className="auth-aside"><Link to="/" aria-label="Back to Go-Shopper" className="mb-8 inline-flex items-center justify-center rounded-md bg-brand-orange p-4 text-white"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg></Link><span className="eyebrow">Welcome to Go-Shopper</span><h1>{emailVerification ? "Verify your email" : recovery ? "Forgot password" : resetting ? "Reset your password" : "Good to have you back."}</h1><p>Sign in or create an account to submit and follow your application.</p></div><div className="auth-box">{form}</div></main><SiteFooter /></>;
}
