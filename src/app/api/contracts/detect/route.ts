import { NextResponse } from "next/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"; // Use legacy build
import "pdfjs-dist/build/pdf.worker.min.mjs"; // Ensure worker is imported
import { detectContractType } from "@/services/ai.services";

// Polyfill for Promise.withResolvers if needed
if (typeof Promise.withResolvers === "undefined") {
    Promise.withResolvers = function <T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    } {
      let resolve: (value: T | PromiseLike<T>) => void;
      let reject: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve: resolve!, reject: reject! };
    };
  }
  

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    console.log("Received file URL:", fileUrl);

    // Fetch and load the PDF document
    const pdf = await getDocument(fileUrl).promise;

    let pdfText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      pdfText += pageText + "\n";
    }

    if (!pdfText.trim()) {
      throw new Error("Failed to extract text from the PDF");
    }

    console.log("Extracted PDF text:", pdfText);

    // Detect contract type using the extracted text
    const detectedType = await detectContractType(pdfText);

    return NextResponse.json({ detectedType });
  } catch (error) {
    console.error("Error detecting contract type:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
