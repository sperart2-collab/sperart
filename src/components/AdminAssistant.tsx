"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runActions, type Action } from "@/app/admin/agent";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Message = {
  role: "user" | "assistant";
  content: string;
  pending?: Action[];
  results?: string[];
};

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event?: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const ideas = [
  "What needs my attention?",
  "Create a complete beginner djembe lesson",
  "Publish the draft Percussion Workshop event",
  "Approve all pending members",
];

function cleanReply(value: unknown) {
  const raw = String(value ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.reply === "string") return parsed.reply.trim();
  } catch {}
  return raw.replace(/^reply\s*:\s*/i, "").replace(/^response\s*:\s*/i, "").trim();
}

const actionLabel = (action: Action) =>
  `${action.type.replace(/_/g, " ")}${action.args?.title ? `: ${action.args.title}` : action.args?.email ? `: ${action.args.email}` : ""}`;

function actionSummary(results: string[]) {
  if (!results.length) return "No action was executed.";
  const failed = results.some((result) => /^(failed|could not|unknown|invalid|not allowed|please sign|no member)/i.test(result.trim()));
  return `${failed ? "Action results — please review:" : "Done. Here’s what I actually completed:"}\n${results.map((result) => `• ${result}`).join("\n")}`;
}

export default function AdminAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [fullControl, setFullControl] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const voiceModeRef = useRef(false);
  const restartRecognitionRef = useRef(false);
  const busyRef = useRef(false);
  const sendRef = useRef<(value: string) => Promise<void>>(async () => {});

  useEffect(() => {
    const saved = localStorage.getItem("sp-ai-full");
    setFullControl(saved === null || saved === "1");
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, listening, speaking]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const startListening = useCallback((continuousVoice = voiceModeRef.current) => {
    if (typeof window === "undefined") return;
    const browser = window as unknown as {
      SpeechRecognition?: new () => RecognitionLike;
      webkitSpeechRecognition?: new () => RecognitionLike;
    };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError("Speech recognition is not supported in this browser. Try the latest Chrome or Edge.");
      setListening(false);
      return;
    }
    try {
      recognitionRef.current?.abort();
      const recognition = new Recognition();
      recognition.lang = "en-NG";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const part = event.results[i]?.[0]?.transcript ?? "";
          if (event.results[i]?.isFinal) finalTranscript += part;
          else interimTranscript += part;
        }
        if (interimTranscript) setVoiceError(`Hearing: ${interimTranscript}`);
        if (finalTranscript.trim()) {
          const transcript = finalTranscript.trim();
          setVoiceError("");
          if (continuousVoice && voiceModeRef.current) {
            restartRecognitionRef.current = false;
            recognition.stop();
            setListening(false);
            void sendRef.current(transcript);
          } else {
            setText((current) => `${current}${current.trim() ? " " : ""}${transcript}`);
          }
        }
      };
      recognition.onerror = (event: any) => {
        setListening(false);
        if (event?.error !== "aborted" && event?.error !== "no-speech") {
          setVoiceError(event?.error === "not-allowed"
            ? "Microphone permission was blocked. Allow microphone access in your browser."
            : "I couldn't hear that clearly. Tap the microphone and try again.");
        }
      };
      recognition.onend = () => {
        setListening(false);
        if (restartRecognitionRef.current && voiceModeRef.current && !busyRef.current) {
          restartRecognitionRef.current = false;
          window.setTimeout(() => startListening(true), 350);
        }
      };
      recognitionRef.current = recognition;
      restartRecognitionRef.current = continuousVoice;
      setVoiceError("");
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setVoiceError("Couldn't start the microphone. Please try again.");
    }
  }, []);

  const speak = useCallback((value: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !value.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-NG";
    utterance.rate = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (voiceModeRef.current) {
        restartRecognitionRef.current = true;
        startListening(true);
      }
    };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [startListening]);

  async function send(value: string) {
    const prompt = value.trim();
    if (!prompt || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    stopSpeaking();
    setVoiceError("");
    const next: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(next);
    setText("");
    try {
      const response = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);

      const proposed: Action[] = Array.isArray(payload.actions) ? payload.actions : [];
      const automatic = fullControl ? proposed.filter((action) => action.type !== "delete_item") : [];
      const pending = proposed.filter((action) => !automatic.includes(action));
      const results = automatic.length ? await runActions(automatic, true) : undefined;

      let reply: string;
      if (results?.length) {
        reply = actionSummary(results);
      } else if (pending.length) {
        reply = `I have prepared ${pending.length} action${pending.length === 1 ? "" : "s"} and need your confirmation before proceeding:\n${pending.map((action) => `• ${actionLabel(action)}`).join("\n")}`;
      } else {
        const modelReply = cleanReply(payload.reply ?? payload.error ?? "I'm ready.");
        const emptyPromise = !proposed.length && /\b(i will|i'll|i am now|i’m now|publishing now|proceed to publish|i will proceed)\b/i.test(modelReply);
        reply = emptyPromise
          ? "I haven't executed anything yet because the assistant returned no executable action. Please state the exact item and action; I won't pretend it's done."
          : modelReply;
      }

      const hasFailure = (results ?? []).some((result) => /^(failed|could not|unknown|invalid|not allowed|please sign|no member)/i.test(result.trim()));
      const assistantMessage: Message = {
        role: "assistant",
        content: results?.length ? (hasFailure ? "I attempted the action. The actual results are below." : "Completed. Here are the execution results.") : reply,
        pending: pending.length ? pending : undefined,
        results: results?.length ? results : undefined,
      };
      setMessages([...next, assistantMessage]);
      if (autoSpeak) speak(reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error.";
      const reply = `I couldn't complete that request: ${message}`;
      setMessages([...next, { role: "assistant", content: reply }]);
      if (autoSpeak && voiceModeRef.current) speak(reply);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  sendRef.current = send;

  async function decide(index: number, approve: boolean) {
    const message = messages[index];
    if (!message?.pending || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const results = approve
        ? await runActions(message.pending, false)
        : ["Cancelled. No changes were made."];
      const summary = actionSummary(results);
      setMessages((current) => current.map((item, i) =>
        i === index
          ? { ...item, content: summary, pending: undefined, results: approve ? results : undefined }
          : item
      ));
      if (autoSpeak && voiceModeRef.current) speak(summary);
    } catch (error) {
      setMessages((current) => current.map((item, i) =>
        i === index ? { ...item, content: `The action could not be completed: ${error instanceof Error ? error.message : "Unknown error"}`, pending: undefined } : item
      ));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function attach(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const sb = supabaseBrowser();
    const uploaded: string[] = [];
    setVoiceError("");
    for (const file of files) {
      const kind = file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : file.type.startsWith("image") ? "image" : "document";
      const path = `${kind}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("media").upload(path, file);
      if (error) {
        setVoiceError(`Upload failed for ${file.name}: ${error.message}`);
        continue;
      }
      const { error: insertError } = await sb.from("media").insert({ kind, bucket: "media", path, title: file.name });
      if (!insertError) uploaded.push(`${kind} "${file.name}"`);
      else setVoiceError(`Uploaded ${file.name}, but couldn't add its media record: ${insertError.message}`);
    }
    event.target.value = "";
    if (uploaded.length) void send(`I uploaded ${uploaded.join(", ")}. Review the files and suggest or perform the most useful safe next step.`);
  }

  function toggleFullControl() {
    const value = !fullControl;
    setFullControl(value);
    localStorage.setItem("sp-ai-full", value ? "1" : "0");
  }

  function toggleVoiceMode() {
    const next = !voiceModeRef.current;
    voiceModeRef.current = next;
    setVoiceMode(next);
    setVoiceError("");
    stopSpeaking();
    if (next) {
      restartRecognitionRef.current = true;
      startListening(true);
    } else {
      restartRecognitionRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
    }
  }

  function toggleMic() {
    if (listening) {
      restartRecognitionRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      startListening(voiceModeRef.current);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[#071225] text-slate-100 shadow-[0_28px_90px_rgba(4,14,35,.28)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#0c1d38] via-[#101b32] to-[#11172a] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-amber-300/30 bg-[#071225] shadow-[0_0_28px_rgba(59,130,246,.2)]">
            <img src="/emblem.png" alt="SPERART" className="h-full w-full object-cover" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold tracking-tight">SPERART AI</h2>
              <span className={`h-2 w-2 rounded-full ${busy ? "animate-pulse bg-amber-300" : listening ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              {listening ? "Listening to you…" : speaking ? "Speaking…" : busy ? "Working on your request…" : voiceMode ? "Voice conversation ready" : "Admin operator · action results shown honestly"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={toggleFullControl} role="switch" aria-checked={fullControl}
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${fullControl ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-white/5 text-slate-300"}`}>
            {fullControl ? "FULL CONTROL ON" : "ASK FIRST"}
          </button>
          <button type="button" onClick={toggleVoiceMode}
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${voiceMode ? "border-blue-300/50 bg-blue-400/20 text-blue-100" : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
            {voiceMode ? "Voice mode: ON" : "Start voice mode"}
          </button>
          <button type="button" onClick={() => { stopSpeaking(); setMessages([]); }}
            className="rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10" title="Clear this conversation">
            New chat
          </button>
        </div>
      </header>

      <div className="flex min-h-[31rem] max-h-[68vh] flex-col gap-5 overflow-y-auto bg-[radial-gradient(circle_at_90%_0%,rgba(59,130,246,.12),transparent_30%),radial-gradient(circle_at_0%_100%,rgba(217,170,75,.06),transparent_30%)] p-4 sm:p-6">
        {!messages.length && (
          <div className="mx-auto my-auto w-full max-w-2xl py-8">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[24px] border border-blue-300/20 bg-blue-400/10 text-3xl">✦</div>
            <h3 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">What should we get done?</h3>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-slate-400">Give me the outcome, not technical instructions. I’ll execute available actions and show you what actually happened.</p>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {ideas.map((idea) => (
                <button type="button" key={idea} onClick={() => void send(idea)} disabled={busy}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-blue-400/[0.07] disabled:opacity-50">
                  {idea}<span className="float-right text-blue-300 transition group-hover:translate-x-1">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[92%] rounded-[24px] px-4 py-3.5 sm:max-w-[82%] ${message.role === "user" ? "rounded-br-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/30" : "rounded-bl-md border border-white/10 bg-[#101d32]/95 text-slate-100 shadow-sm"}`}>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              {message.results?.length ? (
                <div className="mt-3 space-y-2">
                  {message.results.map((result, resultIndex) => {
                    const failed = /^(failed|could not|unknown|invalid|not allowed|please sign|no member)/i.test(result.trim());
                    return <div key={resultIndex} className={`rounded-xl border px-3 py-2 text-xs leading-5 ${failed ? "border-rose-300/20 bg-rose-400/10 text-rose-200" : "border-emerald-300/15 bg-emerald-400/[0.07] text-emerald-100"}`}>{failed ? "!" : "✓"} {result}</div>;
                  })}
                </div>
              ) : null}
              {message.pending?.length ? (
                <div className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-200/[0.06] p-3">
                  <p className="text-sm font-semibold text-amber-100">Your confirmation is needed</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                    {message.pending.map((action, actionIndex) => <li key={actionIndex}>• {actionLabel(action)}</li>)}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => void decide(index, true)} disabled={busy} className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50">Confirm action</button>
                    <button type="button" onClick={() => void decide(index, false)} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-50">Cancel</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:240ms]" />
            </span>
            Working — not just composing a reply…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {voiceError ? <p role="status" className="border-t border-white/10 bg-amber-300/[0.06] px-5 py-2 text-xs text-amber-100">{voiceError}</p> : null}

      <footer className="border-t border-white/10 bg-[#091529] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
          <span>{listening ? "Microphone active" : voiceMode ? "Voice conversation is enabled" : "Type or use your microphone"}</span>
          <button type="button" onClick={() => setAutoSpeak((current) => !current)} className={`rounded-full px-3 py-1.5 transition ${autoSpeak ? "bg-blue-400/10 text-blue-200" : "bg-white/5 text-slate-400"}`}>
            {autoSpeak ? "🔊 Read replies on" : "🔇 Read replies off"}
          </button>
        </div>
        <div className="flex items-end gap-2">
          <label title="Attach media" className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-slate-300 transition hover:bg-white/10">
            +
            <input type="file" multiple hidden onChange={attach} accept="image/*,video/*,audio/*,.pdf" />
          </label>
          <textarea value={text} onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(text); } }}
            placeholder={listening ? "Listening… your words will appear here" : "Message SPERART AI…"}
            rows={1} disabled={busy}
            className="max-h-36 min-h-12 flex-1 resize-y rounded-2xl border border-white/10 bg-[#101d32] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-300/50 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60" />
          <button type="button" title={listening ? "Stop microphone" : "Speak to SPERART AI"} onClick={toggleMic} disabled={busy}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition disabled:opacity-50 ${listening ? "border-rose-300/30 bg-rose-400/15 text-rose-200" : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10"}`}>
            {listening ? "■" : "🎙"}
          </button>
          {speaking ? <button type="button" title="Stop speaking" onClick={stopSpeaking} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-100">■</button> : null}
          <button type="button" onClick={() => void send(text)} disabled={busy || !text.trim()}
            className="h-12 shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5">
            {busy ? "…" : "Send"}
          </button>
        </div>
        <p className="mt-3 px-1 text-[11px] leading-5 text-slate-500">Voice uses your browser’s speech recognition and text-to-speech. Keep this page open and allow microphone access. Live audio is turn-based, not a full-duplex streaming voice model.</p>
      </footer>
    </section>
  );
}
