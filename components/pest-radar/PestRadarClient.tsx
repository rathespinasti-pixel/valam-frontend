"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileAudio,
  Gauge,
  MapPin,
  Send,
  WandSparkles,
  CircleCheck,
  TriangleAlert,
  Flame,
  SprayCan,
  Leaf,
  Sprout,
} from "lucide-react";
import {
  PESTS,
  PEST_KEYS,
  RISK_LEVELS,
  RISK_URGENCY,
  RISK_RECOMMENDATIONS,
  hashString,
  type RiskLevel,
} from "@/lib/pestData";
import { useAskChatbot } from "@/hooks/useAskChatbot";

type ChatBubble = { role: "user" | "bot"; text: string };
type Result = { pestKey: string; risk: RiskLevel };

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

async function extractAudioFeatures(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const channel = audioBuffer.getChannelData(0);
    let sumSquares = 0;
    let zeroCrossings = 0;
    for (let i = 0; i < channel.length; i++) {
      sumSquares += channel[i] * channel[i];
      if (i > 0 && channel[i - 1] >= 0 !== channel[i] >= 0) zeroCrossings++;
    }
    const rms = Math.sqrt(sumSquares / channel.length);
    const zcRate = zeroCrossings / (channel.length / audioBuffer.sampleRate);
    return { rms, zcRate };
  } finally {
    ctx.close();
  }
}

function chooseResult(features: { rms: number; zcRate: number } | null, fallbackSeed: string): Result {
  let pestIndex: number;
  let riskIndex: number;
  if (features) {
    pestIndex = Math.floor(features.zcRate) % PEST_KEYS.length;
    riskIndex = Math.min(2, Math.floor(features.rms * 30));
  } else {
    const h = hashString(fallbackSeed);
    pestIndex = h % PEST_KEYS.length;
    riskIndex = Math.floor(h / PEST_KEYS.length) % 3;
  }
  return { pestKey: PEST_KEYS[pestIndex], risk: RISK_LEVELS[riskIndex] };
}

const RECO_CHIPS = [
  { key: "safe-pesticide", icon: SprayCan, label: "Safe Pesticides" },
  { key: "biological-pesticide", icon: Leaf, label: "Biological Pesticides" },
  { key: "biological-control", icon: Sprout, label: "Biological Controls" },
];

// Ports js/pest-radar.js end-to-end: record/upload -> client-side feature
// extraction -> a seeded pest+severity pick -> recommendations -> a
// contextual follow-up chat. No server-side model is wired up yet, matching
// the original's comment that this is a tuned client-side stand-in.
export function PestRadarClient() {
  // ---- Phase 1: capture ----
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [levelHeights, setLevelHeights] = useState<number[]>(Array(8).fill(4));
  const [dragOver, setDragOver] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLabel, setAudioLabel] = useState("");
  const [radarStatus, setRadarStatus] = useState<{ text: string; error?: boolean } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const currentBlobRef = useRef<Blob | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const levelAudioCtxRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Phase 2: analysis ----
  const [analyzing, setAnalyzing] = useState(false);

  // ---- Phase 2b/3/4: results ----
  const [result, setResult] = useState<Result | null>(null);
  const lastResultRef = useRef<Result | null>(null);

  // ---- Chat ----
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([
    {
      role: "bot",
      text: "Record or upload an insect sound on the left, then tap Run AI Diagnosis to see the result here.",
    },
  ]);
  const [chatStatus, setChatStatus] = useState<React.ReactNode>(null);
  const [glow, setGlow] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const { ask, asking } = useAskChatbot("pest-radar");

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (levelFrameRef.current) cancelAnimationFrame(levelFrameRef.current);
      if (levelAudioCtxRef.current) levelAudioCtxRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startLevelMeter(stream: MediaStream) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    levelAudioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.floor(data.length / 8);
      setLevelHeights(Array.from({ length: 8 }, (_, i) => 4 + ((data[i * step] || 0) / 255) * 18));
      levelFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopLevelMeter() {
    if (levelFrameRef.current) cancelAnimationFrame(levelFrameRef.current);
    levelFrameRef.current = null;
    if (levelAudioCtxRef.current) {
      levelAudioCtxRef.current.close();
      levelAudioCtxRef.current = null;
    }
    setLevelHeights(Array(8).fill(4));
  }

  function setAudioSource(blob: Blob, label: string) {
    currentBlobRef.current = blob;
    setAudioLabel(label);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setRadarStatus(null);
  }

  async function handleRecordClick() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setRadarStatus({ text: "Recording is not supported in this browser. Please upload an audio file instead.", error: true });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        stopLevelMeter();
        setRecording(false);
        setRecordSeconds((seconds) => {
          const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
          setAudioSource(blob, `Field recording — ${formatTime(seconds)}`);
          return seconds;
        });
      };
      mediaRecorder.start();
      startLevelMeter(stream);
      setRecording(true);
      setRecordSeconds(0);
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds += 1;
        setRecordSeconds(seconds);
        if (seconds >= 30) mediaRecorder.stop();
      }, 1000);
    } catch {
      setRadarStatus({ text: "Microphone access was denied or unavailable. Please upload an audio file instead.", error: true });
    }
  }

  function handleFile(file: File | undefined | null) {
    if (file) setAudioSource(file, file.name);
  }

  async function handleAnalyze() {
    const blob = currentBlobRef.current;
    if (!blob) return;
    setAnalyzing(true);
    setRadarStatus({ text: "Analyzing sound frequency, pattern and amplitude…" });

    let features: { rms: number; zcRate: number } | null = null;
    try {
      features = await extractAudioFeatures(blob);
    } catch {
      features = null;
    }

    setTimeout(() => {
      const picked = chooseResult(features, audioLabel + blob.size);
      lastResultRef.current = picked;
      setResult(picked);
      setChatMessages([
        {
          role: "bot",
          text: `I detected a ${PESTS[picked.pestKey].name} (${picked.risk} risk) in your recording. Ask me about its causes, prevention or treatment — or type your own question.`,
        },
      ]);
      setChatStatus(null);
      setRadarStatus({ text: "Analysis complete." });
      setAnalyzing(false);

      setTimeout(() => {
        phase3Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setGlow(true);
        setTimeout(() => setGlow(false), 3000);
        chatInputContainerRef.current?.querySelector("input")?.focus({ preventScroll: true });
      }, 500);
    }, 1100);
  }

  async function handleAskQuestion(question: string) {
    setChatStatus(null);
    setChatMessages((prev) => [...prev, { role: "user", text: question }, { role: "bot", text: "Thinking…" }]);

    const lastResult = lastResultRef.current;
    const contextualQuestion = lastResult
      ? `Regarding a detected ${PESTS[lastResult.pestKey].name} (${lastResult.risk} risk) from an acoustic pest scan: ${question}`
      : question;

    const res = await ask(contextualQuestion);
    if (res.ok) {
      setChatMessages((prev) => [...prev.slice(0, -1), { role: "bot", text: res.answer }]);
    } else if (res.error === "LOGIN_REQUIRED") {
      setChatMessages((prev) => prev.slice(0, -1));
      setChatStatus(
        <>
          Please <Link href="/login">log in</Link> to chat with the Valam AI assistant.
        </>
      );
    } else {
      setChatMessages((prev) => prev.slice(0, -1));
      setChatStatus(res.error);
    }
  }

  const pest = result ? PESTS[result.pestKey] : null;
  const recommended = result ? RISK_RECOMMENDATIONS[result.risk] : [];
  const quickQuestions = pest
    ? [
        `What causes a ${pest.name} infestation?`,
        `How can I prevent ${pest.name} naturally?`,
        `What is the best treatment for ${pest.name}?`,
      ]
    : [];

  return (
    <div className="container">
      <div className="section-head reveal">
        <span className="eyebrow">How It Works</span>
        <h2 style={{ marginTop: 14 }}>From field sound to farmer advice, in four steps</h2>
        <p>
          Capture the sound, let the AI diagnose it, review the recommended solutions, then go deeper with the pest
          chatbot — all on one screen.
        </p>
      </div>

      <div className="radar-phases">
        {/* CARD 1 — CAPTURE */}
        <div className="radar-phase reveal" id="phase-1">
          <div className="radar-phase-head">
            <span className="phase-badge">1</span>
            <div className="phase-titles">
              <b>Capture or Upload Insect Sound</b>
            </div>
          </div>

          <div className="recorder">
            <button
              type="button"
              id="record-btn"
              className={`record-btn${recording ? " recording" : ""}`}
              aria-label={recording ? "Stop recording" : "Start recording"}
              onClick={handleRecordClick}
            >
              <i className="fa-solid fa-microphone" aria-hidden="true" />
            </button>
            <div className="record-meta">
              <span>{recording ? "Recording… tap to stop" : "Tap to record"}</span>
              <div className="level-meter" hidden={!recording}>
                {levelHeights.map((h, i) => (
                  <span key={i} style={{ height: `${h}px` }} />
                ))}
              </div>
              <span className="record-timer">{formatTime(recordSeconds)}</span>
            </div>
          </div>

          <div className="radar-divider">
            <span>or</span>
          </div>

          <label
            className={`dropzone${dragOver ? " dragover" : ""}`}
            htmlFor="audio-upload"
            onClick={(e) => {
              if (e.target !== fileInputRef.current) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <FileAudio size={22} />
            <span>
              <b>Upload Audio</b> — WAV or MP3
            </span>
            <input
              type="file"
              id="audio-upload"
              ref={fileInputRef}
              accept="audio/wav,audio/mpeg,audio/mp3,.wav,.mp3"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          <div className="audio-preview-wrap" hidden={!audioUrl}>
            {audioUrl && <audio controls src={audioUrl} />}
            <span className="audio-file-name">{audioLabel}</span>
          </div>

          <div className={`radar-status${radarStatus?.error ? " error" : ""}`}>{radarStatus?.text}</div>

          <button
            type="button"
            className="radar-arrow-btn"
            disabled={!audioUrl || analyzing}
            aria-label="Analyze the captured sound"
            onClick={handleAnalyze}
          >
            <WandSparkles size={16} />
            <span>Run AI Diagnosis</span>
          </button>
        </div>

        {/* COLUMN 2 — ANALYSIS + RESULTS */}
        <div className="radar-col">
          <div className="radar-phase reveal" id="phase-2">
            <div className="radar-phase-head">
              <span className="phase-badge">2</span>
              <div className="phase-titles">
                <b>AI Sound Analysis</b>
              </div>
            </div>
            <div className="wave-to-ai">
              <div className="wave-bars">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <i className="fa-solid fa-arrow-right" style={{ color: "var(--ink-soft)" }} aria-hidden="true" />
              <span className="ai-chip">
                <i className="fa-solid fa-brain" aria-hidden="true" />
              </span>
            </div>
            <div className={`analyze-progress${analyzing ? " show" : ""}`}>
              <span />
            </div>
          </div>

          <div className="radar-phase reveal" id="phase-results">
            <div className="radar-phase-head">
              <span className="phase-badge">3</span>
              <div className="phase-titles">
                <b>Detection Results</b>
              </div>
            </div>

            {!pest ? (
              <div className="results-empty">
                <p>
                  Capture a sound on the left, then hit <b>Run AI Diagnosis</b> to see the results here.
                </p>
              </div>
            ) : (
              <div className="results-body">
                <div className="result-top">
                  <div className="result-icon">
                    <i className={`fa-solid ${pest.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="result-label">Pest Detected</span>
                    <h4>{pest.name}</h4>
                  </div>
                </div>

                <div className="result-block">
                  <span className="result-block-title">
                    <Gauge size={14} /> Infestation Severity
                  </span>
                  <div className="severity-meter">
                    <div className={`severity-item${result?.risk === "Low" ? " active" : ""}`} data-level="low">
                      <span className="severity-bar" />
                      <CircleCheck size={16} />
                      <span>Low</span>
                    </div>
                    <div className={`severity-item${result?.risk === "Medium" ? " active" : ""}`} data-level="medium">
                      <span className="severity-bar" />
                      <TriangleAlert size={16} />
                      <span>Medium</span>
                    </div>
                    <div className={`severity-item${result?.risk === "High" ? " active" : ""}`} data-level="high">
                      <span className="severity-bar" />
                      <Flame size={16} />
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="result-block">
                  <span className="result-block-title">
                    <MapPin size={14} /> Commonly Affects
                  </span>
                  <div className="chip-row">
                    {pest.crops.map((c) => (
                      <span className="chip" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3 — RECOMMENDATIONS + CHAT */}
        <div className="radar-col">
          <div className="radar-phase reveal" id="phase-reco">
            <div className="radar-phase-head">
              <span className="phase-badge">4</span>
              <div className="phase-titles">
                <b>Recommended Solutions</b>
              </div>
            </div>

            {!result ? (
              <div className="results-empty">
                <p>Recommendations will appear here once a pest is detected.</p>
              </div>
            ) : (
              <div className="results-reco-body">
                <div className="reco-row">
                  {RECO_CHIPS.map((c) => (
                    <div
                      key={c.key}
                      className={`reco-chip${recommended.includes(c.key) ? " recommended" : ""}`}
                    >
                      <c.icon size={17} />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
                <p>
                  {pest!.treatment} {RISK_URGENCY[result.risk]}
                </p>
              </div>
            )}
          </div>

          <div className="radar-phase reveal chat-cta-card" id="phase-3" ref={phase3Ref}>
            <div className="chat-cta-head">
              <b>Still have questions?</b>
              <span>Chat with our AI Farming Assistant — ask about causes, prevention or treatment.</span>
            </div>

            <div className={`chat-mock chat-embed${glow ? " chat-glow" : ""}`}>
              <div className="chat-head">
                <span className="bot-avatar">
                  <i className="fa-solid fa-robot" aria-hidden="true" />
                </span>
                <div className="chat-head-titles">
                  <b>Acoustic Pest Chatbot</b>
                  <span>
                    <span className="dot" /> Online
                  </span>
                </div>
              </div>
              {quickQuestions.length > 0 && (
                <div className="pest-quick-questions">
                  {quickQuestions.map((q) => (
                    <button type="button" key={q} onClick={() => handleAskQuestion(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="chat-body" ref={chatBodyRef}>
                {chatMessages.map((m, i) => (
                  <div className={`bubble ${m.role}`} key={i}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div ref={chatInputContainerRef}>
                <PestChatForm disabled={asking} onSubmit={handleAskQuestion} />
              </div>
              <div className="chat-ask-status">{chatStatus}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="phase-track reveal">
        <span className="pt-dot active" />
        <span className={`pt-line${result ? " active" : ""}`} />
        <span className={`pt-dot${result ? " active" : ""}`} />
        <span className={`pt-line${result ? " active" : ""}`} />
        <span className={`pt-dot${result ? " active" : ""}`} />
      </div>

      <div className="radar-tip reveal">
        <i className="fa-solid fa-lightbulb" aria-hidden="true" />
        <span>
          <b>Tip:</b> For best results, record insect sounds early in the morning or evening when insects are most
          active.
        </span>
      </div>
    </div>
  );
}

function PestChatForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="chat-ask-form"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (!q) return;
        setValue("");
        onSubmit(q);
      }}
    >
      <input
        type="text"
        placeholder="Ask about causes, prevention or treatment…"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" aria-label="Send" disabled={disabled}>
        <Send size={15} />
      </button>
    </form>
  );
}
