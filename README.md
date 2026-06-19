# Medelite Facility Assessment Report Generator

A web application that allows Medelite directors to instantly generate polished facility assessment reports by entering a CMS Certification Number (CCN).

## Live Demo
https://medelite-facility-report-eight.vercel.app/

## Features
- Dynamic CCN lookup via CMS Provider Data Catalog API
- Auto-populates facility name, location, star ratings, and certified beds
- Optional facility name override
- Manual input fields for internal operational data (EMR, Census, Patient Type, Medelite history)
- PDF export with clickable Medicare Care Compare source link
- Word document (.docx) export
- All 12 hospitalization/ED metrics (STR + LT) with national and state averages
- Star rating visual cards

## Tech Stack
- React + Vite
- Tailwind CSS
- jsPDF (PDF generation)
- docx + file-saver (Word export)
- Axios (API requests)
- Vercel (hosting + API proxy)

## Running Locally
```bash
npm install
npm run dev
```

## Engineering Notes & Assumptions
- The CMS Provider Data Catalog API is queried directly using the public REST endpoint (no API key required)
- A Vercel rewrite proxy is used to handle CORS for the CMS API in production
- National and state averages for hospitalization/ED metrics are sourced from the Kendall Lakes reference document provided by Medelite, as the CMS State/US Averages API endpoint returned inconsistent data during development. This is documented as a known assumption and can be replaced with a live API call once the correct endpoint is confirmed.
- The "INFINITE" brand name is hardcoded per branding requirements and is never overwritten by facility data

## Test Case
CCN: 686123 (Kendall Lakes Healthcare and Rehab Center, Miami FL)
