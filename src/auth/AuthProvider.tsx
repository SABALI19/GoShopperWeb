import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
const apiUrl=(import.meta.env.VITE_API_URL||"").replace(/\/+$/,"");
export type WebUser={id:string;firstName:string;lastName:string;email:string;phone:string;role:"customer"|"supermarket"|"rider"|"admin";approvalStatus:string;emailVerified:boolean;phoneVerified:boolean};
type Ctx={ready:boolean;isSignedIn:boolean;user:WebUser|null;token:string|null;getToken:()=>Promise<string|null>;signIn:(identifier:string,password:string)=>Promise<WebUser>;register:(role:"customer"|"supermarket"|"rider",data:Record<string,string>)=>Promise<{verification:{emailSent:boolean;phoneCodeSent:boolean}}>;signOut:()=>Promise<void>;signOutAll:()=>Promise<void>;verifyEmail:(token:string)=>Promise<void>;verifyPhone:(email:string,code:string)=>Promise<void>;resend:(email:string)=>Promise<void>;forgot:(email:string)=>Promise<void>;reset:(token:string,password:string)=>Promise<void>};
const AuthContext=createContext<Ctx|null>(null);let accessToken:string|null=null;let refreshing:Promise<string|null>|null=null;
function csrf(){return document.cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("gs_csrf="))?.slice(8)||"";}
async function call<T>(path:string,body?:unknown,token?:string|null){if(!apiUrl)throw new Error("VITE_API_URL is not configured.");const r=await fetch(`${apiUrl}/api/auth${path}`,{method:body===undefined?"GET":"POST",credentials:"include",headers:{Accept:"application/json",...(body!==undefined?{"Content-Type":"application/json"}:{}),...(token?{Authorization:`Bearer ${token}`}:{}) ,...(path==="/refresh"?{"X-CSRF-Token":decodeURIComponent(csrf())}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});const data=await r.json().catch(()=>null);if(!r.ok)throw new Error(data?.error?.message||`Request failed (${r.status})`);return data as T;}
export function AuthProvider({children}:{children:ReactNode}){const [ready,setReady]=useState(false);const [user,setUser]=useState<WebUser|null>(null);
 const refresh=useCallback(async()=>{if(refreshing)return refreshing;refreshing=(async()=>{try{const x=await call<{accessToken:string;user:WebUser}>("/refresh",{});accessToken=x.accessToken;setUser(x.user);return x.accessToken;}catch{accessToken=null;setUser(null);return null;}finally{refreshing=null;}})();return refreshing;},[]);
 const getToken=useCallback(async()=>accessToken||await refresh(),[refresh]);
 useEffect(()=>{void refresh().finally(()=>setReady(true));},[refresh]);
 const signIn=useCallback(async(identifier:string,password:string)=>{const x=await call<{accessToken:string;user:WebUser}>("/login",{identifier,password});accessToken=x.accessToken;setUser(x.user);return x.user;},[]);
 const register=useCallback(async(role:"customer"|"supermarket"|"rider",data:Record<string,string>)=>call<{verification:{emailSent:boolean;phoneCodeSent:boolean}}>(`/register/${role}`,data),[]);
 const signOut=useCallback(async()=>{try{const t=await getToken();if(t)await call("/logout",{},t);}finally{accessToken=null;setUser(null);}},[getToken]);
 const signOutAll=useCallback(async()=>{try{const t=await getToken();if(t)await call("/logout-all",{},t);}finally{accessToken=null;setUser(null);}},[getToken]);
 const verifyEmail=useCallback(async(token:string)=>{await call("/verify-email",{token});},[]);
 const verifyPhone=useCallback(async(email:string,code:string)=>{await call("/verify-phone",{email,code});},[]);
 const resend=useCallback(async(email:string)=>{await call("/resend-verification",{email});},[]);
 const forgot=useCallback(async(email:string)=>{await call("/password/forgot",{email});},[]);
 const reset=useCallback(async(token:string,password:string)=>{await call("/password/reset",{token,password});},[]);
 const value=useMemo<Ctx>(()=>({ready,isSignedIn:Boolean(user),user,token:accessToken,getToken,signIn,register,signOut,signOutAll,verifyEmail,verifyPhone,resend,forgot,reset}),[forgot,getToken,ready,register,resend,reset,signIn,signOut,signOutAll,user,verifyEmail,verifyPhone]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("AuthProvider missing");return value;}
