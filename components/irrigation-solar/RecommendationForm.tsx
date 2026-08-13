"use client";

import { useState } from "react";
import { WandSparkles, CircleCheck } from "lucide-react";
import { pickSystem, pickIrrigation, type SolarSystem } from "@/lib/simulatorData";

export function RecommendationForm() {
  const [crop, setCrop] = useState("tomato");
  const [size, setSize] = useState(2);
  const [waterSource, setWaterSource] = useState("well");
  const [waterDepth, setWaterDepth] = useState(30);
  const [dailyNeed, setDailyNeed] = useState(8000);
  const [location, setLocation] = useState("Vavuniya");
  const [result, setResult] = useState<{ system: SolarSystem; irrigation: string } | null>(null);

  function handleRun() {
    const acres = size || 1;
    setResult({ system: pickSystem(acres, crop), irrigation: pickIrrigation(crop, waterSource) });
  }

  return (
    <div className="solar-form reveal">
      <div className="solar-form-grid">
        <div className="field">
          <label htmlFor="rec-crop">Crop Type</label>
          <select id="rec-crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="tomato">Tomato</option>
            <option value="paddy">Paddy (Rice)</option>
            <option value="vegetable">Mixed Vegetables</option>
            <option value="pepper">Black Pepper</option>
            <option value="plantation">Plantation Crop</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rec-size">Farm Size (Acres)</label>
          <input
            type="number"
            id="rec-size"
            min="0.1"
            step="0.1"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label htmlFor="rec-water-source">Water Source</label>
          <select id="rec-water-source" value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
            <option value="well">Well</option>
            <option value="borewell">Borewell</option>
            <option value="canal">Canal</option>
            <option value="pond">Pond / Tank</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rec-water-depth">Water Depth (feet)</label>
          <input
            type="number"
            id="rec-water-depth"
            min="5"
            step="1"
            value={waterDepth}
            onChange={(e) => setWaterDepth(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="rec-daily-need">Daily Water Requirement (Litres)</label>
          <input
            type="number"
            id="rec-daily-need"
            min="500"
            step="100"
            value={dailyNeed}
            onChange={(e) => setDailyNeed(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="rec-location">Location (District)</label>
          <input
            type="text"
            id="rec-location"
            placeholder="e.g. Vavuniya"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={handleRun}>
        <WandSparkles size={16} /> Get AI Recommendation
      </button>

      <div className={`solar-result${result ? " show" : ""}`}>
        <h4>
          <CircleCheck size={18} /> Recommended System
        </h4>
        <div className="solar-result-grid">
          <div className="solar-result-item">
            <span>Solar Panel</span>
            <b>{result?.system.panel ?? "—"}</b>
          </div>
          <div className="solar-result-item">
            <span>Pump</span>
            <b>{result?.system.pump ?? "—"}</b>
          </div>
          <div className="solar-result-item">
            <span>Irrigation Method</span>
            <b>{result?.irrigation ?? "—"}</b>
          </div>
          <div className="solar-result-item">
            <span>Estimated Cost</span>
            <b>{result ? `Estimated ${result.system.cost}` : "—"}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
