"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Satellite, FlaskConical, Forward, CalendarDays, Leaf } from "lucide-react";
import {
  CROPS,
  SOIL,
  WATER,
  STAGES,
  SIM_DURATION_MS,
  computeScenario,
  fmtMoney,
  fmtTons,
  fmtPct,
  yieldStatus,
  pestStatus,
  costStatus,
  profitStatus,
  type CropKey,
  type SoilKey,
  type WaterKey,
} from "@/lib/simulatorData";

function currentStageIndex(progress: number) {
  let activeIndex = 0;
  STAGES.forEach((s, i) => {
    if (progress >= s.at) activeIndex = i;
  });
  return activeIndex;
}

// Ports js/crop-simulator.js: a client-side "digital twin" — setup inputs,
// a 30-second animated playback, a results report card, and a live
// what-if scenario tester. No live weather/market API is wired up yet
// (same caveat as the original), outcomes come from tuned reference tables.
export function CropSimulatorClient() {
  const [farmSize, setFarmSize] = useState(1.5);
  const [farmUnit, setFarmUnit] = useState<"acres" | "hectares">("acres");
  const [soil, setSoil] = useState<SoilKey>("red");
  const [crop, setCrop] = useState<CropKey>("tomato");
  const [water, setWater] = useState<WaterKey>("drip");

  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [organic, setOrganic] = useState(false);
  const [delay, setDelay] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const setupRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  function finishSimulation() {
    runningRef.current = false;
    setRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setProgress(1);
    setOrganic(false);
    setDelay(false);
    setShowResults(true);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function runSimulation() {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    setStarted(true);
    setShowResults(false);
    setProgress(0);

    const start = performance.now();
    function tick(now: number) {
      if (!runningRef.current) return;
      const p = Math.min((now - start) / SIM_DURATION_MS, 1);
      setProgress(p);
      if (p >= 1) {
        finishSimulation();
        return;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }

  function restart() {
    setShowResults(false);
    setStarted(false);
    setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const baseResult = computeScenario(crop, soil, water, { organic: false, delay: false });
  const result = computeScenario(crop, soil, water, { organic, delay });
  const stageIndex = currentStageIndex(progress);
  const stage = STAGES[stageIndex];

  const y = yieldStatus(result, crop);
  const p = pestStatus(result);
  const c = costStatus(result, crop);
  const pr = profitStatus(result);

  let whatIfNote = "Showing your base simulation — toggle a scenario above to see how it changes the outcome.";
  if (organic || delay) {
    const parts: string[] = [];
    if (organic) {
      const yieldDelta = Math.round(((result.yieldPerAcre - baseResult.yieldPerAcre) / baseResult.yieldPerAcre) * 100);
      const profitDelta = Math.round(
        ((result.profitPerAcre - baseResult.profitPerAcre) / Math.abs(baseResult.profitPerAcre || 1)) * 100
      );
      parts.push(
        `Organic compost: yield ${yieldDelta}%, but premium pricing pushes net profit ${profitDelta >= 0 ? "+" : ""}${profitDelta}% vs. chemical input.`
      );
    }
    if (delay) {
      parts.push(
        "Delayed sowing avoids an unseasonal rainfall window at harvest and lines up with stronger market demand, raising expected revenue."
      );
    }
    whatIfNote = parts.join(" ");
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Step 1 — Set Up Your Virtual Farm</span>
            <h2 style={{ marginTop: 14 }}>Tell the twin about your farm</h2>
            <p>Four quick inputs — the simulator does the rest.</p>
          </div>

          <div className="sim-setup reveal" ref={setupRef}>
            <div className="sim-setup-grid">
              <div className="field">
                <label htmlFor="sim-farm-size">Farm Size</label>
                <div className="sim-size-row">
                  <input
                    type="number"
                    id="sim-farm-size"
                    min="0.1"
                    step="0.1"
                    value={farmSize}
                    onChange={(e) => setFarmSize(Number(e.target.value) || 1)}
                  />
                  <select
                    id="sim-farm-unit"
                    value={farmUnit}
                    onChange={(e) => setFarmUnit(e.target.value as "acres" | "hectares")}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="sim-water">Water Source</label>
                <select id="sim-water" value={water} onChange={(e) => setWater(e.target.value as WaterKey)}>
                  {Object.entries(WATER).map(([key, w]) => (
                    <option key={key} value={key}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 22 }}>
              <label>Soil Type</label>
              <div className="sim-card-row">
                {Object.entries(SOIL).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sim-pick-card${soil === key ? " active" : ""}`}
                    onClick={() => setSoil(key as SoilKey)}
                  >
                    <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 22 }}>
              <label>Target Crop</label>
              <div className="sim-card-row">
                {Object.entries(CROPS).map(([key, cr]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sim-pick-card${crop === key ? " active" : ""}`}
                    onClick={() => setCrop(key as CropKey)}
                  >
                    <i className={`fa-solid ${cr.icon}`} aria-hidden="true" />
                    <span>{cr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="radar-arrow-btn sim-run-btn" onClick={runSimulation}>
              <Play size={16} />
              <span>Run 30-Second Simulation</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Step 2 — Live Playback</span>
            <h2 style={{ marginTop: 14 }}>Watch your crop&apos;s full life cycle</h2>
            <p>
              The Virtual Farm Twin fast-forwards 90–120 days into 30 seconds, cross-referencing predicted weather,
              micro-climate disease risk and market demand as it goes.
            </p>
          </div>

          <div className="sim-twin reveal">
            {!started ? (
              <div className="sim-twin-empty">
                <Satellite size={28} />
                <p>
                  Set up your farm above, then hit <b>Run 30-Second Simulation</b> to watch it grow here.
                </p>
              </div>
            ) : (
              <div className="sim-twin-body">
                <div className="sim-stage-icon">{stage.icon}</div>
                <div className="sim-stage-label">{stage.label}</div>
                <div className="sim-progress">
                  <span style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="sim-timeline">
                  {STAGES.map((s, i) => (
                    <div className={`sim-tl-step${i <= stageIndex ? " active" : ""}`} key={s.label}>
                      <span className="sim-tl-dot">{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="sim-live-note">{stage.note}</div>
                {running && (
                  <button type="button" className="sim-skip-btn" onClick={finishSimulation}>
                    Skip to results <Forward size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" hidden={!showResults} ref={resultsRef}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Step 3 — Report Card</span>
            <h2 style={{ marginTop: 14 }}>Your simulated harvest, at a glance</h2>
            <p>
              {farmSize} {farmUnit} of {CROPS[crop].label} on {SOIL[soil].label.toLowerCase()} with{" "}
              {WATER[water].label.toLowerCase()}.
            </p>
          </div>

          <div className="sim-report-grid reveal">
            <div className="sim-report-card">
              <span className="sim-report-label">
                <i className="fa-solid fa-weight-hanging" aria-hidden="true" /> Expected Yield
              </span>
              <b>{fmtTons(result.yieldPerAcre)}</b>
              <span className="sim-report-status">
                {y.icon} {y.text}
              </span>
            </div>
            <div className="sim-report-card">
              <span className="sim-report-label">
                <i className="fa-solid fa-bug" aria-hidden="true" /> Pest &amp; Disease Risk
              </span>
              <b>{fmtPct(result.pestRisk)} Vulnerability</b>
              <span className="sim-report-status">
                {p.icon} {p.text}
              </span>
            </div>
            <div className="sim-report-card">
              <span className="sim-report-label">
                <i className="fa-solid fa-coins" aria-hidden="true" /> Total Production Cost
              </span>
              <b>{fmtMoney(result.costPerAcre)} / Acre</b>
              <span className="sim-report-status">
                {c.icon} {c.text}
              </span>
            </div>
            <div className="sim-report-card sim-report-highlight">
              <span className="sim-report-label">
                <i className="fa-solid fa-sack-dollar" aria-hidden="true" /> Estimated Net Profit
              </span>
              <b>{fmtMoney(result.profitPerAcre)} / Acre</b>
              <span className="sim-report-status">
                {pr.icon} {pr.text}
              </span>
            </div>
          </div>

          <div className="sim-whatif reveal">
            <div className="sim-whatif-head">
              <FlaskConical size={20} />
              <div>
                <b>What-If Scenario Tester</b>
                <span>Tweak the plan in real time and compare it against your base simulation.</span>
              </div>
            </div>

            <div className="sim-whatif-toggles">
              <button
                type="button"
                className="sim-toggle"
                data-active={organic}
                onClick={() => setOrganic((v) => !v)}
              >
                <Leaf size={16} />
                <span>Use organic compost instead of chemical fertilizer</span>
              </button>
              <button type="button" className="sim-toggle" data-active={delay} onClick={() => setDelay((v) => !v)}>
                <CalendarDays size={16} />
                <span>Delay sowing by 2 weeks</span>
              </button>
            </div>

            <div className="sim-whatif-note">{whatIfNote}</div>
          </div>

          <div className="sim-cta-row reveal">
            <button type="button" className="btn btn-primary" onClick={restart}>
              <RotateCcw size={15} /> Run a new simulation
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
