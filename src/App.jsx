import { useState } from "react";
import FacilityForm from "./components/FacilityForm";
import ReportPreview from "./components/ReportPreview";

export default function App() {
  const [facilityData, setFacilityData] = useState(null);
  const [manualData, setManualData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Nav Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-widest text-gray-800">
            INFINITE
          </span>
          <span className="text-xs text-gray-500 tracking-wider -mt-1">
            Managed by MEDELITE
          </span>
        </div>
        <div className="h-8 w-px bg-gray-300 mx-3" />
        <span className="text-sm font-medium text-gray-600">
          Facility Assessment Report Generator
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Left: Form */}
        <div className="w-full max-w-md flex-shrink-0">
          <FacilityForm
            onDataFetched={(provider, manual) => {
              setFacilityData(provider);
              setManualData(manual);
            }}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1">
          {facilityData && manualData ? (
            <ReportPreview
              facilityData={facilityData}
              manualData={manualData}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl min-h-96">
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-medium">
                  Enter a CCN to generate a facility report
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}