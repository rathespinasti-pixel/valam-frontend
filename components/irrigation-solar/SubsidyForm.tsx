"use client";

import { useState } from "react";
import { CircleCheck, FileText, ListChecks, ListFilter } from "lucide-react";
import { checkSubsidy, type SubsidyResult } from "@/lib/simulatorData";

export function SubsidyForm() {
  const [location, setLocation] = useState("Vavuniya");
  const [size, setSize] = useState(2);
  const [crop, setCrop] = useState("tomato");
  const [farmerType, setFarmerType] = useState("individual");
  const [result, setResult] = useState<SubsidyResult | null>(null);

  function handleCheck() {
    setResult(checkSubsidy(size || 1, farmerType));
  }

  return (
    <div className="solar-form reveal">
      <div className="solar-form-grid">
        <div className="field">
          <label htmlFor="sub-location">Location (District)</label>
          <input
            type="text"
            id="sub-location"
            placeholder="e.g. Vavuniya"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sub-size">Farm Size (Acres)</label>
          <input
            type="number"
            id="sub-size"
            min="0.1"
            step="0.1"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label htmlFor="sub-crop">Crop Type</label>
          <select id="sub-crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="tomato">Tomato</option>
            <option value="paddy">Paddy (Rice)</option>
            <option value="vegetable">Mixed Vegetables</option>
            <option value="pepper">Black Pepper</option>
            <option value="plantation">Plantation Crop</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sub-farmer-type">Farmer Details</label>
          <select id="sub-farmer-type" value={farmerType} onChange={(e) => setFarmerType(e.target.value)}>
            <option value="individual">Individual Smallholder</option>
            <option value="cooperative">Farmer Cooperative Member</option>
            <option value="commercial">Commercial Grower</option>
          </select>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={handleCheck}>
        <ListFilter size={16} /> Check Subsidy Eligibility
      </button>

      <div className={`subsidy-result${result ? " show" : ""}`}>
        <div className="subsidy-block">
          <h5>
            <CircleCheck size={16} style={{ color: "var(--leaf)" }} /> Eligible Subsidy Programs
          </h5>
          <ul>{result?.programs.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="subsidy-block">
          <h5>
            <FileText size={16} style={{ color: "var(--leaf)" }} /> Required Documents
          </h5>
          <ul>{result?.documents.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="subsidy-block">
          <h5>
            <ListChecks size={16} style={{ color: "var(--leaf)" }} /> Application Process
          </h5>
          <ul>{result?.process.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
