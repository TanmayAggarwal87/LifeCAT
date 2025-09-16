import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import markdownpdf from "markdown-pdf";
import OpenAI from "openai";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

// --- 1) Initialize Groq
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", //important
});

// --- 2) Helper: convert Markdown -> PDF
function markdownToPdf(mdText, outputPath) {
  return new Promise((resolve, reject) => {
    markdownpdf()
      .from.string(mdText)
      .to(outputPath, (err) => {
        if (err) return reject(err);
        resolve(outputPath);
      });
  });
}

app.post("/generate-lca-pdf", async (req, res) => {
  try {
    const jsonData = req.body;
    if (!jsonData || Object.keys(jsonData).length === 0) {
      return res.status(400).send("❌ Please POST a JSON body with LCA data.");
    }

    const prompt = `
You are an expert LCA analyst and technical writer. Your task is to convert the provided JSON data into a WELL-DETAILED, comprehensive and professional Life Cycle Assessment report formatted in Markdown. Follow the structure below precisely, using the data from the JSON.

---

# Life Cycle Assessment of [Product Name]

- **Company:** [Company Name]
- **Report ID:** [Report ID]
- **Date:** [Date]

## 1. Executive Summary

Write a brief, professional overview. Mention the product studied, the functional unit, the system boundary (cradle-to-gate), and state the total Global Warming Potential (GWP) and Cumulative Energy Demand (CED) as the key findings.

## 2. Scope, Methodology, and Inventory

### 2.1. Goal and Scope
Detail the study's scope using the data from the \`scope_and_boundaries\` object in the JSON.
- **Functional Unit:**
- **System Boundaries:**
- **Geographical Scope:**
- **Time Horizon:**
- **Intended Audience:**

### 2.2. Life Cycle Inventory (LCI)
Summarize the key inputs and processes from the \`life_cycle_inventory\` object. Use bullet points for clarity.
- **Raw Materials:** (Mention scrap %, primary %, and alloys)
- **Energy Inputs:** (Mention electricity, gas, and renewable share)
- **Transportation:** (Mention modes and distances)
- **Manufacturing Processes:** (List the processes)
- **End-of-Life Assumptions:** (Mention recycling and landfill rates)

## 3. Standards and Guidelines Followed

This section should be included exactly as follows:
The methodology for this Life Cycle Assessment complies with the principles and requirements set forth by the following international standards:
- **ISO 14040:2006:** Environmental management — Life cycle assessment — Principles and framework.
- **ISO 14044:2006:** Environmental management — Life cycle assessment — Requirements and guidelines.
- Greenhouse gas emissions are calculated in accordance with the **GHG Protocol** and **IPCC** guidelines.

## 4. Life Cycle Impact Assessment (LCIA) Results

Create a clear Markdown table summarizing the **total** impact indicators from the \`impact_assessment_results.totals\` object.

| Indicator | Unit | Total Value |
| --- | --- | --- |
| Global Warming Potential (GWP) | kg CO₂e | |
| Cumulative Energy Demand (CED) | MJ | |
| Material Circularity Indicator (MCI) | % | |
| Water Consumption | m³ | |
| Abiotic Depletion Potential (ADP) | kg Sb eq | |
| Ozone Depletion Potential (ODP) | kg CFC-11 eq | |
| Acidification Potential (AP) | kg SO₂ eq | |
| Eutrophication Potential (EP) | kg PO₄³⁻ eq | |
| Human Toxicity Potential | kg 1,4-DCB eq | |
| Ecotoxicity Potential | kg 1,4-DCB eq | |

## 5. Contribution Analysis & Hotspots

Based on the data in \`impact_assessment_results.by_stage\`, analyze the contribution of each life cycle stage to the main impact categories. Create a small table or bulleted list that clearly identifies which stage (Raw Materials, Manufacturing, or Transportation) is the biggest contributor ("hotspot") for GWP and CED. State the percentages. For example: "The manufacturing stage is the primary hotspot, accounting for X% of the total GWP."

## 6. Interpretation and Recommendations

### 6.1. Discussion of Results
Briefly discuss the findings. Explain *why* the identified hotspot (e.g., manufacturing) likely contributes the most to the environmental impact, referencing the energy inputs from the LCI.

### 6.2. Limitations
Mention one key limitation of this study, such as the use of generic database values for background processes or assumptions made in the transportation model.

### 6.3. Improvement Opportunities
Provide two actionable suggestions for the company to reduce the environmental impact of their product. For example: increasing the renewable energy share or sourcing scrap materials more locally to reduce transport emissions.

---

Here is the JSON data to use for the report:
${JSON.stringify(jsonData, null, 2)}
`.trim();

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a precise and professional LCA report generator.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.0,
    });

    const mdReport = response.choices?.[0]?.message?.content;
    if (!mdReport) throw new Error("⚠️ No content returned from LLM");

    // Convert Markdown -> PDF
    const timestamp = Date.now();
    const pdfFilename = `LCA_Report_${timestamp}.pdf`;
    const pdfPath = path.join(process.cwd(), pdfFilename);

    await markdownToPdf(mdReport, pdfPath);

    // Stream back the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFilename}"`
    );
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);

    stream.on("end", () => {
      fs.unlink(pdfPath, (err) => {
        if (err) console.warn("⚠️ Failed to delete temp PDF:", pdfPath);
      });
    });
  } catch (err) {
    console.error("Error generating LCA PDF:", err);
    res.status(500).send("❌ Internal error generating PDF");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LCA PDF generator running at http://localhost:${port}`);
});
