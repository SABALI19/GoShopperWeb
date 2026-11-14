import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { AuthPage } from "./AuthPage";
import Header from "./components/Header";
import { CustomerWelcomePage } from "./components/CustomerWelcomePage";
import SiteFooter from "./components/SiteFooter";
import LandingPage from "./components/LandingPage";

type AppRecord = { id: string; reference: string; type: "supermarket" | "rider"; status: string; data: Record<string, any>; feedback: string; reviewerNotes: string; history: { status: string; message: string; createdAt: string }[]; createdAt: string };
const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) throw new Error("VITE_API_URL is not configured. Add the public backend URL to onboarding-web/.env.");
  return fetch(`${apiUrl}${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...init?.headers } }).then(async (r) => { const body = await r.json().catch(() => null); if (!r.ok) throw new Error(body?.error?.message || `Request failed (${r.status})`); return body as T; });
}
function Home() { return <><Header overlay/><LandingPage/><SiteFooter/></>; }
const roleRoutes: Record<string,string> = { admin: "/admin", supermarket: "/supermarket", rider: "/rider" };
function Protected({children,expectedRole}:{children:ReactNode;expectedRole?:string}) { const path=useLocation().pathname; const {ready,user}=useAuth(); const role=user?.role||""; if(!ready)return null; if(!user)return path.startsWith("/register/")?<AuthPage mode="up" role={path.endsWith("rider")?"rider":"supermarket"}/>:<Navigate to="/sign-in" state={{from:path}} replace/>; if(expectedRole&&role!==expectedRole)return <Navigate to="/" replace/>; if((role==="supermarket"||role==="rider")&&user.approvalStatus!=="approved"&&!path.startsWith("/application")&&!path.startsWith("/register/"))return <Navigate to="/application/status" replace/>; const dest=roleRoutes[role]; if(dest&&path!==dest&&user.approvalStatus==="approved")return <Navigate to={dest} replace/>; return <>{children}</>; }
function RoleWorkspace({role}:{role:"admin"|"supermarket"|"rider"}){
  const title=role==="admin"?"Admin dashboard":role==="supermarket"?"Supermarket dashboard":"Rider dashboard";
  const downloadUrl=import.meta.env.VITE_APP_DOWNLOAD_URL as string|undefined;
  return <><Header/><main className="status-page"><span className="eyebrow">{role} account</span><h1>{title}</h1><p>Your account is signed in with the <strong>{role}</strong> role. Open Go-Shopper to continue to the {role} workspace.</p><div className="actions"><a className="button" href="mobile:///">Open Go-Shopper app</a>{downloadUrl?<a className="button outline" href={downloadUrl} target="_blank" rel="noreferrer">Download the app</a>:null}</div><p className="privacy-note">The web onboarding site does not host the operational dashboard; the role-specific dashboard is in the mobile app.</p></main><SiteFooter/></>;
}
const supermarketFields = [ ["businessName","Supermarket / business name","text",true], ["legalName","Registered legal business name","text",true], ["fullName","Owner or representative full name","text",true], ["email","Contact email","email",true], ["phone","Business contact phone","tel",true], ["ownershipRole","Your relationship to the business","select",true], ["registrationNumber","CAC registration number (if registered)","text",false], ["category","Main store category","text",true], ["categories","Other product categories (comma separated)","text",false], ["description","Business description","textarea",true], ["address","Store street address (select a Google suggestion)","address",true], ["city","City / area","text",true], ["state","State","text",true], ["operatingHours","Operating days and hours","text",true] ] as const;
const riderFields = [ ["fullName","Full name","text",true], ["email","Email","email",true], ["phone","Phone number","tel",true], ["address","Residential address","text",true], ["operatingArea","Preferred operating area","text",true], ["vehicleType","Transport method / vehicle type","text",true], ["licenseInformation","Driving licence information (if applicable)","text",false] ] as const;
function ApplicationForm({ type }: { type: "supermarket"|"rider" }) {
  const { getToken } = useAuth();
  const { user } = useAuth();
  const navigate = useNavigate();
  const addressInput = useRef<HTMLInputElement>(null);
  const fields = type === "supermarket" ? supermarketFields : riderFields;
  const [values,setValues]=useState<Record<string,string>>({ fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "", email: user?.email || "" });
  const [ownershipConfirmed,setOwnershipConfirmed]=useState(false);
  const [review,setReview]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [submitted,setSubmitted]=useState<{reference:string;emailSent:boolean}|null>(null);
  const [placesReady,setPlacesReady]=useState(false);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (type !== "supermarket" || !key || !addressInput.current) return;
    const attachAutocomplete = () => {
      const google = (window as any).google;
      if (!google?.maps?.places || !addressInput.current) return;
      const autocomplete = new google.maps.places.Autocomplete(addressInput.current, { types: ["address"], componentRestrictions: { country: "ng" } });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const parts = place.address_components || [];
        const component = (name: string) => parts.find((part: any) => part.types.includes(name))?.long_name || "";
        setValues((current) => ({
          ...current,
          address: place.formatted_address || current.address || "",
          city: component("locality") || component("postal_town") || current.city || "",
          state: component("administrative_area_level_1") || current.state || "",
          latitude: String(place.geometry.location.lat()),
          longitude: String(place.geometry.location.lng()),
        }));
      });
      setPlacesReady(true);
    };
    const existing = (window as any).google?.maps?.places;
    if (existing) { attachAutocomplete(); return; }
    let script = document.querySelector<HTMLScriptElement>("script[data-google-places]");
    if (!script) {
      script = document.createElement("script");
      script.dataset.googlePlaces = "true";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=en`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", attachAutocomplete);
    return () => script?.removeEventListener("load", attachAutocomplete);
  }, [type]);

  const submit=async()=>{
    setBusy(true);setError("");
    try {
      const token=await getToken();if(!token)throw new Error("Please sign in again.");
      const data={
        ...values,
        ...(type==="supermarket"?{
          categories: values.categories ? values.categories.split(",").map(x=>x.trim()).filter(Boolean) : [],
          ownershipDeclaration: ownershipConfirmed,
          ...(values.latitude && values.longitude ? { latitude: Number(values.latitude), longitude: Number(values.longitude) } : {}),
        }:{}),
      };
      const result=await api<{application:AppRecord;confirmationEmailSent:boolean}>(`/api/applications/${type}`,token,{method:"POST",body:JSON.stringify({data})});
      if (type === "supermarket") setSubmitted({reference:result.application.reference,emailSent:result.confirmationEmailSent});
      else navigate("/application/status",{state:{submitted:result.application.reference}});
    } catch(e) { setError(e instanceof Error?e.message:"Could not submit your application.");setReview(false); }
    finally { setBusy(false); }
  };

  if (submitted) return <><Header/><main className="form-page"><section className="application-form application-success"><span className="eyebrow">Application received</span><h1>Thanks for applying.</h1><p>Your supermarket application was sent successfully. Reference: <strong>{submitted.reference}</strong></p><p>{submitted.emailSent?"We’ve emailed a confirmation to your account email.":"We could not send the confirmation email yet. Your application is saved; you can check its status below."}</p><div className="actions"><Link className="button" to="/application/status">View application status</Link>{import.meta.env.VITE_APP_DOWNLOAD_URL?<a className="button outline" href={import.meta.env.VITE_APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">Download the app today</a>:<span className="privacy-note">The app download link will be added here when it is published.</span>}</div></section></main><SiteFooter/></>;

  return <><Header/><main className="form-page"><Link className="back-link" to="/">← Back to Go-Shopper</Link><div className="form-intro"><span className="eyebrow">{type === "rider" ? "Delivery rider application" : "Supermarket partner application"}</span><h1>{review?"Review your details":"Let’s get to know you."}</h1><p>Submit your store and ownership details for admin review. Your account receives supermarket access only after approval.</p></div>{error&&<div className="alert">{error}</div>} {!review?<form className="application-form" onSubmit={e=>{e.preventDefault();setError("");setReview(true);}}><div className="form-grid">{fields.map(([key,label,input,required])=><label className={input==="textarea"?"wide":""} key={key}>{label}{input==="textarea"?<textarea required={required} value={values[key]||""} onChange={e=>setValues({...values,[key]:e.target.value})}/>:input==="select"?<select required={required} value={values[key]||""} onChange={e=>setValues({...values,[key]:e.target.value})}><option value="">Select one</option><option value="owner">I own this business</option><option value="authorized_representative">I am authorized to represent it</option></select>:<input ref={input==="address"?addressInput:undefined} required={required} type={input==="address"?"text":input} value={values[key]||""} onChange={e=>setValues({...values,[key]:e.target.value})}/>}</label>)}</div>{type==="supermarket"&&<><p className="privacy-note">{placesReady?"Choose an address suggestion to save the store pin and fill city/state.":"Enter the full store address, city, and state. Add VITE_GOOGLE_MAPS_API_KEY to enable Google address suggestions."}</p><label className="ownership-check"><input type="checkbox" checked={ownershipConfirmed} onChange={e=>setOwnershipConfirmed(e.target.checked)} required/>I confirm that I am the owner or authorized representative and that these store details are accurate.</label></>}<p className="privacy-note">You can review your answers before submitting. Document uploads are not enabled, so include the CAC registration number where available. Admins may request supporting proof during review.</p><button className="button" type="submit">Review application <b>→</b></button></form>:<div className="application-form review-card"><div className="review-grid">{fields.map(([key,label])=><div key={key}><small>{label}</small><p>{values[key]||"—"}</p></div>)}{type==="supermarket"&&<div><small>Ownership declaration</small><p>{ownershipConfirmed?"Confirmed":"Not confirmed"}</p></div>}{values.latitude&&<div><small>Map location</small><p>{values.latitude}, {values.longitude}</p></div>}</div><div className="actions"><button className="button outline" onClick={()=>setReview(false)}>Edit details</button><button className="button" disabled={busy} onClick={()=>void submit()}>{busy?"Submitting…":"Submit application"}</button></div></div>}</main><SiteFooter/></>;
}
function StatusPage() { const {getToken}=useAuth();const [items,setItems]=useState<AppRecord[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [feedback,setFeedback]=useState("");const [draft,setDraft]=useState("");const [sending,setSending]=useState(false);
 const load=async()=>{setLoading(true);setError("");try{const token=await getToken();if(!token)throw new Error("Please sign in again.");const data=await api<{applications:AppRecord[]}>('/api/applications/mine',token);setItems(data.applications);}catch(e){setError(e instanceof Error?e.message:"Could not load applications.");}finally{setLoading(false);}};useEffect(()=>{void load();},[]);
 const resubmit=async(app:AppRecord)=>{setSending(true);try{const token=await getToken();if(!token)throw new Error("Please sign in again.");const data={...app.data,...(draft?{additionalInformation:draft}:{})};await api(`/api/applications/${app.id}`,token,{method:"PATCH",body:JSON.stringify({data})});setFeedback("");setDraft("");await load();}catch(e){setFeedback(e instanceof Error?e.message:"Could not resubmit.");}finally{setSending(false);}};
 return <><Header/><main className="status-page"><span className="eyebrow">Applicant dashboard</span><h1>Your applications</h1><p>Follow each application and see if your next step is needed.</p>{loading?<div className="status-card">Loading your applications…</div>:error?<div className="alert">{error} <button onClick={()=>void load()}>Retry</button></div>:items.length===0?<div className="empty"><h2>No applications yet</h2><p>Choose how you’d like to join Go-Shopper.</p><div className="actions"><Link className="button" to="/register/supermarket">Apply as supermarket</Link><Link className="button outline" to="/register/rider">Apply as rider</Link></div></div>:items.map(app=><article className="status-card" key={app.id}><div className="status-head"><div><span className="eyebrow">{app.type} · {app.reference}</span><h2>{app.data.businessName||app.data.fullName}</h2></div><span className={`status-pill ${app.status}`}>{app.status.replaceAll("_"," ")}</span></div><p>Submitted {new Date(app.createdAt).toLocaleDateString()}</p>{app.feedback&&<div className="reviewer-feedback"><strong>Reviewer feedback</strong><p>{app.feedback}</p></div>}{app.status==="needs_information"&&<div className="resubmit"><label>Additional information<textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Provide the requested information. You can also resubmit your current details."/></label>{feedback&&<div className="alert">{feedback}</div>}<button className="button" disabled={sending} onClick={()=>void resubmit(app)}>{sending?"Resubmitting…":"Resubmit details"}</button></div>}<div className="timeline">{app.history.map((h,i)=><div key={`${h.status}-${i}`}><span/>{h.status.replaceAll("_"," ")} · {new Date(h.createdAt).toLocaleDateString()}{h.message&&<small>{h.message}</small>}</div>)}</div></article>)}</main><SiteFooter/></>; }
export default function App(){return <Routes><Route path="/" element={<Home/>}/><Route path="/sign-in" element={<AuthPage mode="in"/>}/><Route path="/sign-up" element={<AuthPage mode="up" role="customer"/>}/><Route path="/welcome/customer" element={<Protected expectedRole="customer"><><CustomerWelcomePage/><SiteFooter/></></Protected>}/><Route path="/register/supermarket" element={<Protected expectedRole="supermarket"><ApplicationForm type="supermarket"/></Protected>}/><Route path="/register/rider" element={<Protected expectedRole="rider"><ApplicationForm type="rider"/></Protected>}/><Route path="/application/status" element={<Protected><StatusPage/></Protected>}/><Route path="/admin" element={<Protected expectedRole="admin"><RoleWorkspace role="admin"/></Protected>}/><Route path="/supermarket" element={<Protected expectedRole="supermarket"><RoleWorkspace role="supermarket"/></Protected>}/><Route path="/rider" element={<Protected expectedRole="rider"><RoleWorkspace role="rider"/></Protected>}/><Route path="/application" element={<Protected><Navigate to="/application/status" replace/></Protected>}/><Route path="*" element={<AuthPage mode="in"/>}/></Routes>}
