import jsPDF from "jspdf";

const DARK = [20, 20, 20];
const MID = [80, 80, 80];
const LIGHT = [130, 130, 130];
const WHITE = [255, 255, 255];
const ACCENT = [37, 99, 235];
const LINE = [220, 220, 220];

function fmt(v, isPercent) {
  if (v === null || v === undefined || v === "") return "N/A";
  return isPercent ? `${Number(v).toFixed(1)}%` : Number(v).toFixed(2);
}

function drawStars(doc, x, y, value) {
  const total = 5;
  const filled = Number(value) || 0;
  for (let i = 0; i < total; i++) {
    doc.setTextColor(...(i < filled ? [234, 179, 8] : [200, 200, 200]));
    doc.setFontSize(14);
    doc.text("★", x + i * 10, y);
  }
  doc.setTextColor(...MID);
  doc.setFontSize(9);
  doc.text(`(${filled}/5)`, x + total * 10 + 2, y);
}

export function generatePDF(facilityData, manualData) {
  const { provider, claims, averages } = facilityData;
  const displayName = manualData.nameOverride.trim() || provider.name;
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${provider.ccn}`;

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Header Block ──────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 90, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INFINITE", W / 2, 30, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Managed by MEDELITE", W / 2, 43, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("FACILITY ASSESSMENT SNAPSHOT", W / 2, 62, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(provider.state || "", W / 2, 76, { align: "center" });

  y = 110;

  // ── Facility Info Table ────────────────────────────────────────
  const rows = [
    ["Name of Facility", displayName],
    ["Location", provider.location],
    ["EMR", manualData.emr || "—"],
    ["Census Capacity", String(provider.censusCap)],
    ["Current Census", manualData.currentCensus || "—"],
    ["Type of Patient", manualData.patientType || "—"],
    ["Previous Coverage from Medelite", manualData.previousCoverage],
    ["Previous Provider Performance from Medelite", manualData.previousPerformance || "—"],
    ["Medical Coverage", manualData.medicalCoverage || "—"],
  ];

  const colX = 60;
  const valX = 260;
  const rowH = 22;

  for (let i = 0; i < rows.length; i++) {
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(40, y - 14, W - 80, rowH, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(rows[i][0], colX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    doc.text(String(rows[i][1]), valX, y);

    doc.setDrawColor(...LINE);
    doc.line(40, y + 7, W - 40, y + 7);
    y += rowH;
  }

  y += 20;

  // ── Star Ratings ───────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...LIGHT);
  doc.text("STAR RATINGS", 40, y);
  doc.setDrawColor(...ACCENT);
  doc.line(40, y + 4, 120, y + 4);
  y += 20;

  const ratingData = [
    ["Overall Star Rating", provider.overallRating],
    ["Health Inspection", provider.healthRating],
    ["Staffing", provider.staffingRating],
    ["Quality of Resident Care", provider.qmRating],
  ];

  const cardW = (W - 80 - 30) / 2;
  const cardH = 54;
  const cardPad = 10;

  for (let i = 0; i < ratingData.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 40 + col * (cardW + 10);
    const cy = y + row * (cardH + 10);

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(cx, cy, cardW, cardH, 6, 6, "F");
    doc.setDrawColor(...LINE);
    doc.roundedRect(cx, cy, cardW, cardH, 6, 6, "S");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...LIGHT);
    doc.text(ratingData[i][0], cx + cardPad, cy + 18);

    drawStars(doc, cx + cardPad, cy + 38, ratingData[i][1]);
  }

  y += Math.ceil(ratingData.length / 2) * (cardH + 10) + 20;

  // ── Hospitalization & ED Metrics ───────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...LIGHT);
  doc.text("HOSPITALIZATION & ED METRICS", 40, y);
  doc.setDrawColor(...ACCENT);
  doc.line(40, y + 4, 220, y + 4);
  y += 18;

  // Table header
  doc.setFillColor(240, 242, 255);
  doc.rect(40, y - 12, W - 80, 18, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Metric", 50, y);
  doc.text("Facility", 310, y, { align: "right" });
  doc.text("National Avg.", 420, y, { align: "right" });
  doc.text("State Avg.", W - 50, y, { align: "right" });
  y += 10;

  doc.setDrawColor(...LINE);
  doc.line(40, y, W - 40, y);
  y += 14;

  const metricsData = [
    ["STR Hospitalization", claims.strHosp, averages.national.strHosp, averages.state.strHosp, true],
    ["STR National Avg. for Hospitalization", null, averages.national.strHosp, null, true],
    ["STR State Avg. for Hospitalization", null, null, averages.state.strHosp, true],
    ["STR ED Visit", claims.strED, averages.national.strED, averages.state.strED, true],
    ["LT Hospitalization (per 1000 days)", claims.ltHosp, averages.national.ltHosp, averages.state.ltHosp, false],
    ["LT ED Visit (per 1000 days)", claims.ltED, averages.national.ltED, averages.state.ltED, false],
  ];

  for (let i = 0; i < metricsData.length; i++) {
    const [label, facility, national, state, isPercent] = metricsData[i];
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(40, y - 12, W - 80, 18, "F");
    }
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(label, 50, y);

    doc.setFont("helvetica", "bold");
    doc.text(fmt(facility, isPercent), 310, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID);
    doc.text(fmt(national, isPercent), 420, y, { align: "right" });
    doc.text(fmt(state, isPercent), W - 50, y, { align: "right" });

    doc.setDrawColor(...LINE);
    doc.line(40, y + 6, W - 40, y + 6);
    y += 20;
  }

  y += 20;

  // ── Medicare Source Link ───────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT);
  doc.text("Source: ", 40, y);

  doc.setTextColor(...ACCENT);
  doc.textWithLink(medicareUrl, 75, y, { url: medicareUrl });

  // ── Footer ─────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...DARK);
  doc.rect(0, pageH - 30, W, 30, "F");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("INFINITE — Managed by MEDELITE | Confidential", W / 2, pageH - 12, { align: "center" });

  doc.save(`facility-assessment-${provider.ccn}.pdf`);
}