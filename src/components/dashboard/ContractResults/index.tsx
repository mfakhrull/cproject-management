"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import OverallScoreChart from "@/components/analysis/chart";
import { notFound } from "next/navigation";

interface ContractResultsProps {
  contractId: string;
}

export default function ContractResults({ contractId }: ContractResultsProps) {
  const [analysisResults, setAnalysisResults] = useState<any>();
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    async function fetchContractResults() {
      try {
        const response = await fetch(`/api/contracts/contract/${contractId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contract analysis");
        }
        const data = await response.json();
        setAnalysisResults(data);
      } catch (error) {
        console.error("Error fetching contract analysis:", error);
        setError(true);
      }
    }
    fetchContractResults();
  }, [contractId]);

  if (error) {
    return notFound();
  }

  if (!analysisResults) {
    return <div>Loading...</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Contract Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold">
              {analysisResults.overallScore ?? 0}
            </div>
            <div className="w-1/3">
              <OverallScoreChart overallScore={analysisResults.overallScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{analysisResults.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {analysisResults.risks.map((risk: any, index: number) => (
                  <motion.li
                    key={index}
                    className="border rounded-lg p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{risk.risk}</span>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p>{risk.explanation}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {analysisResults.opportunities.map(
                  (opportunity: any, index: number) => (
                    <motion.li
                      key={index}
                      className="border rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {opportunity.opportunity}
                        </span>
                        <Badge className={getSeverityColor(opportunity.impact)}>
                          {opportunity.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <p>{opportunity.explanation}</p>
                    </motion.li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Duration:</strong> {analysisResults.contractDuration}
              </p>
              <p>
                <strong>Termination Conditions:</strong>{" "}
                {analysisResults.terminationConditions}
              </p>
              <p>
                <strong>Legal Compliance:</strong>{" "}
                {analysisResults.legalCompliance}
              </p>
              <ul>
                <strong>Key Clauses:</strong>
                {analysisResults.keyClauses.map(
                  (clause: string, index: number) => (
                    <li key={index}>{clause}</li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
