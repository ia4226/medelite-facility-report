import { useState } from "react";
import { fetchAllFacilityData } from "../api/cms";

const initialManual = {
  nameOverride: "",
  emr: "",
  currentCensus: "",
  patientType: "",
  previousCoverage: "Yes",
  previousPerformance: "",
  medicalCoverage: "",
};

export default function FacilityForm({ onDataFetched }) {
  const [ccn, setCcn] = useState("");
  const [manual, setManual] = useState(initialManual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [providerName, setProviderName] = useState("");

  async function handleLookup() {
    if (!ccn.trim()) {
      setError("Please enter a CCN.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchAllFacilityData(ccn.trim());
      setProviderName(data.provider.name);
      setFetched(true);
      onDataFetched(data, manual);
    } catch (e) {
      setError(e.message || "Failed to fetch facility data. Check the CCN and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualChange(field, value) {
    const updated = { ...manual, [field]: value };
    setManual(updated);
    if (fetched) {
      fetchAllFacilityData(ccn.trim())
        .then((data) => onDataFetched(data, updated))
        .catch(() => {});
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <h2 className="text-base font-semibold text-gray-800">
        Facility Lookup
      </h2>

      {/* CCN Input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          CMS Certification Number (CCN)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ccn}
            onChange={(e) => setCcn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. 686123"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "Loading…" : "Lookup"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        {fetched && !error && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Found: {providerName}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Manual Inputs */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Manual Inputs
        </h3>

        {/* Name Override */}
        <Field label="Facility Name Override (optional)">
          <input
            type="text"
            value={manual.nameOverride}
            onChange={(e) => handleManualChange("nameOverride", e.target.value)}
            placeholder="Leave blank to use CMS name"
            className={inputClass}
          />
        </Field>

        {/* EMR */}
        <Field label="EMR System">
          <input
            type="text"
            value={manual.emr}
            onChange={(e) => handleManualChange("emr", e.target.value)}
            placeholder="e.g. PCC, MatrixCare"
            className={inputClass}
          />
        </Field>

        {/* Current Census */}
        <Field label="Current Census">
          <input
            type="number"
            value={manual.currentCensus}
            onChange={(e) => handleManualChange("currentCensus", e.target.value)}
            placeholder="e.g. 112"
            className={inputClass}
          />
        </Field>

        {/* Patient Type */}
        <Field label="Type of Patient">
          <input
            type="text"
            value={manual.patientType}
            onChange={(e) => handleManualChange("patientType", e.target.value)}
            placeholder="e.g. Long-term & Short-term"
            className={inputClass}
          />
        </Field>

        {/* Previous Coverage */}
        <Field label="Previous Coverage from Medelite">
          <select
            value={manual.previousCoverage}
            onChange={(e) => handleManualChange("previousCoverage", e.target.value)}
            className={inputClass}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </Field>

        {/* Previous Performance */}
        <Field label="Previous Provider Performance">
          <input
            type="text"
            value={manual.previousPerformance}
            onChange={(e) => handleManualChange("previousPerformance", e.target.value)}
            placeholder="e.g. About 30 patients/day"
            className={inputClass}
          />
        </Field>

        {/* Medical Coverage */}
        <Field label="Medical Coverage">
          <input
            type="text"
            value={manual.medicalCoverage}
            onChange={(e) => handleManualChange("medicalCoverage", e.target.value)}
            placeholder="e.g. Optometry, PCP, Podiatry"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";