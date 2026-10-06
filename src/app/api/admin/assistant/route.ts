import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { askAssistant } from "@/lib/ai/service";
import { getSettings } from "@/lib/settings";
import type { AiMessage } from "@/lib/ai/types";

const SYSTEM = `You are SPERART's autonomous digital operator. You are not a form and you are not a developer console. Talk naturally and make sensible decisions using the site snapshot.
The admin has FULL CONTROL enabled by default. For safe work, do the work immediately by returning an action. Do not ask the admin to provide database fields, IDs, JSON, schemas or technical instructions when you can infer them from the snapshot or create sensible content yourself.
If the admin asks for content, write polished SPERART-appropriate content yourself. Do not respond with a checklist asking them for title/date/body unless the requested task genuinely cannot be completed without a missing fact. For lessons, generate a complete teaching piece: learning objectives, instrument/setup, technique, counting or syllables, guided practice, common mistakes, and a short practice assignment. For beginner/intermediate/advanced requests, choose the appropriate progression yourself. Never use bracketed placeholders such as [title], [body], [details], [Price] or [Workshop announcement excerpt].
If the admin asks what needs attention, inspect the snapshot and give a useful prioritised summary; do not say the response is unformattable.
Safe actions run automatically. Only delete_item requires confirmation in the UI. Publishing is allowed when explicitly requested; otherwise create content as a draft.
Return ONLY one JSON object with this exact shape: {"reply":"natural human response","actions":[]}. No markdown fences, no leading text, no trailing punctuation outside the JSON.
Allowed actions:
- create_draft {kind: news|events|lessons|recognition|library, title, plus appropriate fields from the site's content model}. For lessons, include category, level, summary and a complete body; only include video_url/audio_url when a real uploaded media URL is present in the snapshot.
- set_status {kind,id,status:draft|published}
- approve_member {email,status:active|inactive|pending}
- approve_pending_members {status:active|inactive|pending}
- handle_message {id}
- set_content {section:hero|about|leadership|membership|contact|faq,field,value}
- add_hero_video {media_id}
- delete_item {kind,id} only for explicit deletion requests.
When creating an event, only invent a date if the admin supplied one or the snapshot contains one. For articles/lessons/recognition/library content, you may write useful evergreen draft content from SPERART's mission and subject matter. Never claim something was published unless a set_status action is included. Keep replies concise but useful.`;

function parseModel(raw:string){
  const cleaned=raw.replace(/```json/gi,"").replace(/```/g,"").trim();
  try{return JSON.parse(cleaned)}catch{}
  const start=cleaned.indexOf("{"); const end=cleaned.lastIndexOf("}");
  if(start>=0&&end>start){try{return JSON.parse(cleaned.slice(start,end+1))}catch{}}
  return {reply:cleaned.replace(/^\s+|\s+$/g,"").replace(/^[{\[]?\s*"?reply"?\s*:\s*/i,"").replace(/[}\]]?\s*[,}\]]?\s*$/g,"").replace(/[.]+$/,""),actions:[]};
}
export async function POST(req:Request){
 const sb=supabaseServer(); const {data:{user}}=await sb.auth.getUser(); if(!user)return NextResponse.json({error:"auth"},{status:401});
 const {data:adm}=await sb.from("admins").select("user_id").eq("user_id",user.id).maybeSingle(); if(!adm)return NextResponse.json({error:"auth"},{status:403});
 const body=await req.json().catch(()=>({messages:[]})); const clean:AiMessage[]=(Array.isArray(body.messages)?body.messages:[]).slice(-12).map((m:{role:string;content:string})=>({role:(m.role==="assistant"?"assistant":"user") as AiMessage["role"],content:String(m.content).slice(0,1800)}));
 if(!clean.length)return NextResponse.json({reply:"I’m ready. Tell me what you want me to handle.",actions:[]});
 const dr=(t:string)=>sb.from(t).select("id,title").eq("status","draft").limit(12);
 const [a,e,l,r,rs,pm,msgs,media,s]=await Promise.all([dr("articles"),dr("events"),dr("lessons"),dr("recognitions"),dr("resources"),sb.from("profiles").select("user_id,email,full_name,membership_type,status").eq("status","pending").limit(20),sb.from("inquiries").select("id,name,email,message,status,created_at").eq("status","new").limit(10),sb.from("media").select("id,kind,title,path").order("created_at",{ascending:false}).limit(20),getSettings()]);
 const f=(x:{data:{id:string;title:string}[]|null})=>x.data?.map(d=>`${d.id}=${d.title}`).join("; ")||"none";
 const snap=`SNAPSHOT\nDrafts: news[${f(a)}] events[${f(e)}] lessons[${f(l)}] recognition[${f(r)}] library[${f(rs)}]\nPending members: ${pm.data?.map(m=>`${m.email} (${m.full_name||"no name"}, ${m.membership_type||"no type"})`).join("; ")||"none"}\nNew messages: ${msgs.data?.map(m=>`${m.id}: ${m.name} <${m.email}>: ${String(m.message).slice(0,180)}`).join(" | ")||"none"}\nMedia: ${media.data?.map(m=>`${m.id}=${m.kind}:${m.title||"untitled"}`).join("; ")||"none"}\nSite context: ${JSON.stringify({hero:s.hero,about:s.about,membership:s.membership,contact:s.contact}).slice(0,6000)}`;
 try{const raw=await askAssistant(clean,`${SYSTEM}\n\n${snap}`);const j=parseModel(raw);return NextResponse.json({reply:String(j.reply||"Done."),actions:Array.isArray(j.actions)?j.actions:[]})}catch(e){return NextResponse.json({reply:"The AI service is unavailable right now. Your dashboard is still working normally.",actions:[]})}
}
