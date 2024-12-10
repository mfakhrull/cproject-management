import { NextResponse } from "next/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"; // Use legacy build
import "pdfjs-dist/build/pdf.worker.min.mjs"; // Ensure worker is imported
import { analyzeContractWithAI } from "@/services/ai.services";
import ContractAnalysis from "@/models/ContractAnalysis";
import dbConnect from "@/lib/mongodb";

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
  await dbConnect();

  try {
    const formData = await req.formData();
    const fileUrl = formData.get("fileUrl")?.toString();
    const contractType = formData.get("contractType")?.toString();
    const userId = formData.get("userId")?.toString();

    if (!fileUrl || !contractType || !userId) {
      return NextResponse.json(
        { error: "Missing file URL, contract type, or userId" },
        { status: 400 }
      );
    }

    // Extract file name from the file URL
    const fileName = fileUrl.split("/").pop() || "unknown_file.pdf";

    // Fetch and load the PDF document using pdfjs-dist
    const pdf = await getDocument(fileUrl).promise;
    let pdfText = "";

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

    console.log("Extracted PDF text for analysis:", pdfText);

    // Analyze the contract with AI
    const analysis = await analyzeContractWithAI(pdfText, contractType);

    // Save analysis results to the database
    const savedAnalysis = await ContractAnalysis.create({
      userId,
      contractType,
      contractText: pdfText,
      attachments: [{ fileName, fileUrl }], // Include fileName and fileUrl
      ...analysis,
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Error analyzing contract:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
