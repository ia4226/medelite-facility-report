import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
  ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";

const DARK = "141414";
const ACCENT = "2563EB";
const LIGHT_BG = "F8F9FA";
const HEADER_BG = "1E293B";
const WHITE = "FFFFFF";

function fmt(v, isPercent) {
  if (v === null || v === undefined || v === "") return "N/A";
  return isPercent ? `${Number(v).toFixed(1)}%` : Number(v).toFixed(2);
}

function makeTableCell(text, opts = {}) {
  const {
    bold = false,
    color = DARK,
    bg = WHITE,
    width = 50,
    align = AlignmentType.LEFT,
  } = opts;

  return new TableCell({
    shading: { type: ShadingType.SOLID, color: bg },
    width: { size: width, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text ?? "—"),
            bold,
            color,
            size: 20,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: "6B7280",
        size: 16,
        font: "Calibri",
      }),
    ],
  });
}

export async function generateDocx(facilityData, manualData) {
  const { provider, claims, averages } = facilityData;
  const displayName = manualData.nameOverride.trim() || provider.name;
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${provider.ccn}`;

  // ── Header Paragraphs ──────────────────────────────────────────
  const headerParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: "INFINITE",
          bold: true,
          color: WHITE,
          size: 40,
          font: "Calibri",
        }),
      ],
      shading: { type: ShadingType.SOLID, color: HEADER_BG },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: "Managed by MEDELITE",
          color: "94A3B8",
          size: 16,
          font: "Calibri",
        }),
      ],
      shading: { type: ShadingType.SOLID, color: HEADER_BG },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: "FACILITY ASSESSMENT SNAPSHOT",
          bold: true,
          color: WHITE,
          size: 22,
          font: "Calibri",
        }),
      ],
      shading: { type: ShadingType.SOLID, color: HEADER_BG },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [
        new TextRun({
          text: provider.state || "",
          color: "94A3B8",
          size: 18,
          font: "Calibri",
        }),
      ],
      shading: { type: ShadingType.SOLID, color: HEADER_BG },
    }),
  ];

  // ── Facility Info Table ────────────────────────────────────────
  const facilityRows = [
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

  const facilityTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: facilityRows.map((row, i) =>
      new TableRow({
        children: [
          makeTableCell(row[0], {
            bold: true,
            color: DARK,
            bg: i % 2 === 0 ? LIGHT_BG : WHITE,
            width: 45,
          }),
          makeTableCell(row[1], {
            color: "374151",
            bg: i % 2 === 0 ? LIGHT_BG : WHITE,
            width: 55,
          }),
        ],
      })
    ),
  });

  // ── Star Ratings Table ─────────────────────────────────────────
  const ratingsRows = [
    ["Overall Star Rating", provider.overallRating],
    ["Health Inspection", provider.healthRating],
    ["Staffing", provider.staffingRating],
    ["Quality of Resident Care", provider.qmRating],
  ];

  const ratingsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell("Rating Category", { bold: true, bg: "E0E7FF", color: "3730A3", width: 50 }),
          makeTableCell("Score (out of 5)", { bold: true, bg: "E0E7FF", color: "3730A3", width: 50, align: AlignmentType.CENTER }),
        ],
      }),
      ...ratingsRows.map((row, i) =>
        new TableRow({
          children: [
            makeTableCell(row[0], {
              bold: true,
              color: DARK,
              bg: i % 2 === 0 ? LIGHT_BG : WHITE,
              width: 50,
            }),
            makeTableCell(
              row[1] ? `${"★".repeat(Number(row[1]))}${"☆".repeat(5 - Number(row[1]))} (${row[1]}/5)` : "N/A",
              {
                color: "92400E",
                bg: i % 2 === 0 ? LIGHT_BG : WHITE,
                width: 50,
                align: AlignmentType.CENTER,
              }
            ),
          ],
        })
      ),
    ],
  });

  // ── Metrics Table ──────────────────────────────────────────────
  const metricsData = [
    ["STR Hospitalization", claims.strHosp, averages.national.strHosp, averages.state.strHosp, true],
    ["STR ED Visit", claims.strED, averages.national.strED, averages.state.strED, true],
    ["LT Hospitalization (per 1000 days)", claims.ltHosp, averages.national.ltHosp, averages.state.ltHosp, false],
    ["LT ED Visit (per 1000 days)", claims.ltED, averages.national.ltED, averages.state.ltED, false],
  ];

  const metricsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeTableCell("Metric", { bold: true, bg: "E0E7FF", color: "3730A3", width: 40 }),
          makeTableCell("Facility", { bold: true, bg: "E0E7FF", color: "3730A3", width: 20, align: AlignmentType.CENTER }),
          makeTableCell("National Avg.", { bold: true, bg: "E0E7FF", color: "3730A3", width: 20, align: AlignmentType.CENTER }),
          makeTableCell("State Avg.", { bold: true, bg: "E0E7FF", color: "3730A3", width: 20, align: AlignmentType.CENTER }),
        ],
      }),
      ...metricsData.map(([label, facility, national, state, isPercent], i) =>
        new TableRow({
          children: [
            makeTableCell(label, { bold: true, color: DARK, bg: i % 2 === 0 ? LIGHT_BG : WHITE, width: 40 }),
            makeTableCell(fmt(facility, isPercent), { color: "1D4ED8", bg: i % 2 === 0 ? LIGHT_BG : WHITE, width: 20, align: AlignmentType.CENTER }),
            makeTableCell(fmt(national, isPercent), { color: "374151", bg: i % 2 === 0 ? LIGHT_BG : WHITE, width: 20, align: AlignmentType.CENTER }),
            makeTableCell(fmt(state, isPercent), { color: "374151", bg: i % 2 === 0 ? LIGHT_BG : WHITE, width: 20, align: AlignmentType.CENTER }),
          ],
        })
      ),
    ],
  });

  // ── Source Link ────────────────────────────────────────────────
  const sourceLink = new Paragraph({
    spacing: { before: 320 },
    children: [
      new TextRun({ text: "Source: ", color: "6B7280", size: 18, font: "Calibri" }),
      new ExternalHyperlink({
        link: medicareUrl,
        children: [
          new TextRun({
            text: medicareUrl,
            color: ACCENT,
            size: 18,
            font: "Calibri",
            underline: {},
          }),
        ],
      }),
    ],
  });

  // ── Assemble Document ──────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerParagraphs,
          sectionHeading("Facility Information"),
          facilityTable,
          sectionHeading("Star Ratings"),
          ratingsTable,
          sectionHeading("Hospitalization & ED Metrics"),
          metricsTable,
          sourceLink,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `facility-assessment-${provider.ccn}.docx`);
}