import { readFile } from "node:fs/promises";
import type { Download, TestInfo } from "@playwright/test";
import { PDFParse } from "pdf-parse";

export async function receipt(download: Download, testInfo: TestInfo) {
  const failure = await download.failure();
  if (failure) throw new Error(`Receipt download failed: ${failure}`);
  const filename = download.suggestedFilename();
  if (!/^swag-labs-order-.*\.pdf$/.test(filename)) throw new Error(`Unexpected receipt name: ${filename}`);
  const path = testInfo.outputPath(filename);
  await download.saveAs(path);
  const buffer = await readFile(path);
  if (buffer.subarray(0, 5).toString() !== "%PDF-") throw new Error("Receipt is not a PDF");
  const parser = new PDFParse({ data: buffer });
  let text: string;
  try {
    const parsed = await parser.getText();
    if (parsed.total < 1) throw new Error("Receipt has no pages");
    text = parsed.text;
  } finally {
    await parser.destroy();
  }
  await testInfo.attach("order receipt", { path, contentType: "application/pdf" });
  // Kept in the test-owned output directory as a report artifact; Playwright clears it next run.
  return text.replace(/\s+/g, " ").trim();
}
