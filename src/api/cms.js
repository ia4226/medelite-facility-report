import axios from "axios";

const BASE = "/cms-api/provider-data/api/1/datastore/query";
const PROVIDER_TABLE = "4pq5-n9py";
const CLAIMS_TABLE = "ijh5-nb2v";

export async function fetchProviderInfo(ccn) {
  const res = await axios.get(`${BASE}/${PROVIDER_TABLE}/0`, {
    params: {
      "conditions[0][property]": "cms_certification_number_ccn",
      "conditions[0][value]": ccn,
      "conditions[0][operator]": "=",
    },
  });

  const results = res.data?.results;
  if (!results || results.length === 0) {
    throw new Error(`No facility found for CCN: ${ccn}`);
  }

const d = results[0];
  console.log("Provider API response:", d);

  const city = d.citytown || "";
  const state = d.state || "";
  const zip = d.zip_code || "";
  const address = d.provider_address || "";
  const location = d.location
    ? d.location.replace(/,/g, ", ")
    : [address, city, state + " " + zip].filter(Boolean).join(", ");

  return {
    name: d.provider_name || "",
    address,
    city,
    state,
    zip,
    location,
    censusCap: d.number_of_certified_beds || "",
    overallRating: d.overall_rating || "",
    healthRating: d.health_inspection_rating || "",
    staffingRating: d.staffing_rating || "",
    qmRating: d.qm_rating || "",
    ccn: d.cms_certification_number_ccn || ccn,
  };
}

export async function fetchClaimsMetrics(ccn) {
  const res = await axios.get(`${BASE}/${CLAIMS_TABLE}/0`, {
    params: {
      "conditions[0][property]": "cms_certification_number_ccn",
      "conditions[0][value]": ccn,
      "conditions[0][operator]": "=",
    },
  });

  const results = res.data?.results || [];
  console.log("Claims API response:", results);

  const metrics = {};
  for (const row of results) {
    const code = String(row.measure_code);
    metrics[code] = {
      adjusted: row.adjusted_score,
      observed: row.observed_score,
      expected: row.expected_score,
    };
  }

  return {
    strHosp: metrics["521"]?.adjusted ?? metrics["521"]?.observed ?? null,
    strED: metrics["522"]?.adjusted ?? metrics["522"]?.observed ?? null,
    ltHosp: metrics["551"]?.adjusted ?? metrics["551"]?.observed ?? null,
    ltED: metrics["552"]?.adjusted ?? metrics["552"]?.observed ?? null,
  };
}

export async function fetchStateNationalAverages() {
  return {
    national: {
      strHosp: 21.5,
      strED: 11.6,
      ltHosp: 1.65,
      ltED: 1.65,
    },
    state: {
      strHosp: 23.8,
      strED: 9.3,
      ltHosp: 1.95,
      ltED: 1.21,
    },
  };
}

export async function fetchAllFacilityData(ccn) {
  const provider = await fetchProviderInfo(ccn);
  const [claims, averages] = await Promise.all([
    fetchClaimsMetrics(ccn),
    fetchStateNationalAverages(),
  ]);
  return { provider, claims, averages };
}