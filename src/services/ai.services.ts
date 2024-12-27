import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to detect contract type (unchanged)
export const detectContractType = async (
  contractText: string,
): Promise<string> => {
  const prompt = `
    Analyze the following contract text and determine the type of contract it is.
    Provide only the contract type as a single string (e.g., "Employment", "Non-Disclosure Agreement", "Sales", "Lease", etc.).
    Do not include any additional explanation or text.

    Contract text:
    ${contractText}
  `;

  try {
    console.time("AI Contract Type Detection");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const results = await model.generateContent(prompt, { timeout: 15000 }); // 15-second timeout

    console.timeEnd("AI Contract Type Detection");
    const responseText = results.response.text().trim();

    if (!responseText) {
      throw new Error("AI response is empty or invalid.");
    }

    return responseText;
  } catch (error) {
    console.error("Error detecting contract type:", error);
    throw new Error("Failed to detect the contract type.");
  }
};

// Function to analyze the contract (unchanged)
export const analyzeContractWithAI = async (
  contractText: string,
  contractType: string,
) => {
  const prompt = `
    Analyze the following ${contractType} contract and provide a detailed analysis tailored to the provided content. Ensure your response reflects the specific clauses, terms, and context within the text, avoiding generic responses. Focus on identifying actionable insights, unique details, and contract-specific implications.

Provide:
1. A list of at least 10 potential risks for the party receiving the contract, each with a specific explanation based on the contract's terms, and severity level (low, medium, high).
2. A list of at least 10 potential opportunities or benefits for the receiving party, directly tied to the contract's provisions, each with a specific explanation and impact level (low, medium, high).
3. A comprehensive summary of the contract, including key terms and conditions explicitly mentioned in the text.
4. Recommendations for improving the contract from the receiving party's perspective, referencing specific clauses where possible.
5. A list of key clauses in the contract, directly extracted from the document.
6. An assessment of the contract's legal compliance, based on its adherence to standard practices and the governing law stated in the contract.
7. A list of potential negotiation points, focusing on areas that could be improved for the receiving party.
8. The contract duration or term, extracted directly from the contract text if applicable.
9. A summary of termination conditions, explicitly referencing the conditions stated in the contract.
10. A detailed breakdown of any financial terms or compensation structure, tied to the specific payment schedule or terms mentioned in the contract.
11. Any performance metrics or KPIs explicitly mentioned in the contract, if applicable.
12. A summary of specific clauses relevant to this type of contract (e.g., intellectual property for employment contracts, warranties for sales contracts), explicitly referencing their location in the text.
13. An overall score from 1 to 100, with 100 being the highest. This score should represent the contract's overall favorability based on the identified risks, opportunities, and terms.

Format your response as a JSON object with the following structure:
{
  "risks": [{"risk": "Risk description", "explanation": "Specific explanation based on the contract", "severity": "low|medium|high"}],
  "opportunities": [{"opportunity": "Opportunity description", "explanation": "Specific explanation based on the contract", "impact": "low|medium|high"}],
  "summary": "Comprehensive summary of the contract",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "keyClauses": ["Clause 1", "Clause 2", ...],
  "legalCompliance": "Assessment of legal compliance",
  "negotiationPoints": ["Point 1", "Point 2", ...],
  "contractDuration": "Duration of the contract, if applicable",
  "terminationConditions": "Summary of termination conditions, if applicable",
  "financialTerms": {
    "description": "Overview of financial terms",
    "details": ["Detail 1", "Detail 2", ...]
  },
  "performanceMetrics": ["Metric 1", "Metric 2", ...],
  "specificClauses": "Summary of clauses specific to this contract type",
  "overallScore": "Overall score from 1 to 100"
}

Important: Ensure your response reflects the specific content, details, and context of the provided contract. Do not provide generic or overly generalized information. Focus only on the contract details provided.
Important: Provide only the JSON object in your response, without any additional text or formatting.

Contract text:
${contractText}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const results = await model.generateContent(prompt, { timeout: 40000 }); // 20-second timeout

    const text = results.response
      .text()
      .replace(/```json\n?|\n?```/g, "")
      .trim();
    return JSON.parse(text); // Parse the AI's response as JSON
  } catch (error) {
    console.error("Error analyzing contract with AI:", error);
    throw new Error("Failed to analyze the contract.");
  }
};
