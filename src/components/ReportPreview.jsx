import { useRef } from "react";
import { generatePDF } from "./PDFGenerator";
import { generateDocx } from "./DocxGenerator";

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${
            star <= Number(value) ? "text-yellow-400" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-gray-600 ml-1">({value}/5)</span>
    </div>
  );
}

function MetricRow({ label, value, national, state, isPercent }) {
  const fmt = (v) => {
    if (v === null || v === undefined || v === "") return "N/A";
    return isPercent ? `${Number(v).toFixed(1)}%` : Number(v).toFixed(2);
  };
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-sm font-medium text-gray-700 w-1/2">{label}</td>
      <td className="py-2 text-sm text-gray-800 text-right font-semibold">{fmt(value)}</td>
      {national !== undefined && (
        <td className="py-2 text-sm text-gray-500 text-right pl-4">Natl: {fmt(national)}</td>
      )}
      {state !== undefined && (
        <td className="py-2 text-sm text-gray-500 text-right pl-4">State: {fmt(state)}</td>
      )}
    </tr>
  );
}

function Row({ label, value }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2.5 pr-6 text-sm font-semibold text-gray-700 w-1/2">{label}</td>
      <td className="py-2.5 text-sm text-gray-800">{value}</td>
    </tr>
  );
}

function RatingCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <StarRating value={value} />
    </div>
  );
}

export default function ReportPreview({ facilityData, manualData }) {
  const reportRef = useRef(null);
  const { provider, claims, averages } = facilityData;
  const displayName = manualData.nameOverride.trim() || provider.name;
  const medicareUrl = "https://www.medicare.gov/care-compare/details/nursing-home/" + provider.ccn;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => generatePDF(facilityData, manualData)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <span>Download</span> PDF
        </button>
        <button
          onClick={() => generateDocx(facilityData, manualData)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <span>Download</span> Word Doc
        </button>
      </div>

      <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 text-white px-8 py-6 text-center">
          <div className="text-2xl font-bold tracking-widest">INFINITE</div>
          <div className="text-xs tracking-widest text-gray-400 mt-0.5">Managed by MEDELITE</div>
          <div className="mt-3 text-sm font-semibold tracking-widest uppercase text-gray-200">Facility Assessment Snapshot</div>
          <div className="text-xs text-gray-400 mt-0.5 tracking-widest">{provider.state}</div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <table className="w-full">
              <tbody>
                <Row label="Name of Facility" value={displayName} />
                <Row label="Location" value={provider.location} />
                <Row label="EMR" value={manualData.emr || "—"} />
                <Row label="Census Capacity" value={provider.censusCap} />
                <Row label="Current Census" value={manualData.currentCensus || "—"} />
                <Row label="Type of Patient" value={manualData.patientType || "—"} />
                <Row label="Previous Coverage from Medelite" value={manualData.previousCoverage} />
                <Row label="Previous Provider Performance from Medelite" value={manualData.previousPerformance || "—"} />
                <Row label="Medical Coverage" value={manualData.medicalCoverage || "—"} />
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Star Ratings</h3>
            <div className="grid grid-cols-2 gap-4">
              <RatingCard label="Overall Star Rating" value={provider.overallRating} />
              <RatingCard label="Health Inspection" value={provider.healthRating} />
              <RatingCard label="Staffing" value={provider.staffingRating} />
              <RatingCard label="Quality of Resident Care" value={provider.qmRating} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Hospitalization and ED Metrics</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left text-xs text-gray-500 pb-2">Metric</th>
                  <th className="text-right text-xs text-gray-500 pb-2">Facility</th>
                  <th className="text-right text-xs text-gray-500 pb-2 pl-4">National</th>
                  <th className="text-right text-xs text-gray-500 pb-2 pl-4">State</th>
                </tr>
              </thead>
              <tbody>
                <MetricRow label="STR Hospitalization" value={claims.strHosp} national={averages.national.strHosp} state={averages.state.strHosp} isPercent={true} />
                <MetricRow label="STR ED Visit" value={claims.strED} national={averages.national.strED} state={averages.state.strED} isPercent={true} />
                <MetricRow label="LT Hospitalization (per 1000 days)" value={claims.ltHosp} national={averages.national.ltHosp} state={averages.state.ltHosp} isPercent={false} />
                <MetricRow label="LT ED Visit (per 1000 days)" value={claims.ltED} national={averages.national.ltED} state={averages.state.ltED} isPercent={false} />
              </tbody>
            </table>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">
              Source: <a href={medicareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{medicareUrl}</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
