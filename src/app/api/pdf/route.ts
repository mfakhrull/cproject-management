// src/app/api/pdf/route.ts
import { NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";
await import("pdfjs-dist/build/pdf.worker.min.mjs");

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required." }, { status: 400 });
    }

    // Fetch and parse the PDF
    const pdf = await pdfjs.getDocument(fileUrl).promise;

    let pdfText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      pdfText += pageText + "\n";
    }

    return NextResponse.json({ text: pdfText.trim() }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Failed to process the PDF." }, { status: 500 });
  }
}
