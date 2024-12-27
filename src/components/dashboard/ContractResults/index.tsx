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
      <Card className="mb-6 shadow-lg">
        <CardHeader className="rounded-t-md  p-6 border-b">
          <CardTitle className="text-2xl font-bold">
            Overall Contract Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-6 pb-12">
          {/* Score Display */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-6xl font-bold text-slate-800 mx-16">
              {analysisResults.overallScore ?? 0}%
            </div>
            <p className="text-sm text-gray-500">Favorability</p>
          </div>

          {/* Circular Chart */}
          <div className="relative w-2/5">
            <OverallScoreChart overallScore={analysisResults.overallScore} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-semibold text-gray-700">
                {analysisResults.overallScore ?? 0}%
              </div>
              <p className="text-sm text-gray-500">Out of 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
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
                    className="mb-1 rounded-lg border p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
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
                      className="mb-1 rounded-lg border p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {opportunity.opportunity}
                        </span>
                        <Badge className={getSeverityColor(opportunity.impact)}>
                          {opportunity.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <p>{opportunity.explanation}</p>
                    </motion.li>
                  ),
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {analysisResults.recommendations.map(
                  (recommendation: string, index: number) => (
                    <motion.li
                      key={index}
                      className="mb-1 flex items-start gap-4 rounded-lg border p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Numbering */}
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800/20 font-semibold text-white">
                        {index + 1}
                      </div>
                      {/* Recommendation Text */}
                      <p className="flex-1">{recommendation}</p>
                    </motion.li>
                  ),
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
              <div className="space-y-3">
                {/* Duration */}
                <div className="flex flex-col space-y-2 rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Duration
                  </h3>
                  <p className="text-gray-600">
                    {analysisResults.contractDuration}
                  </p>
                </div>

                {/* Termination Conditions */}
                <div className="flex flex-col space-y-2 rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Termination Conditions
                  </h3>
                  <p className="text-gray-600">
                    {analysisResults.terminationConditions}
                  </p>
                </div>

                {/* Legal Compliance */}
                <div className="flex flex-col space-y-2 rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Legal Compliance
                  </h3>
                  <p className="text-gray-600">
                    {analysisResults.legalCompliance}
                  </p>
                </div>

                {/* Key Clauses */}
                <div className="flex flex-col space-y-2 rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Key Clauses
                  </h3>
                  <ul className="space-y-2">
                    {analysisResults.keyClauses.map(
                      (clause: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 rounded-md bg-gray-100 p-3 shadow-sm"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/20 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{clause}</p>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Negotiation Points */}
                <div className="flex flex-col space-y-2 rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Negotiation Points
                  </h3>
                  <ul className="space-y-2">
                    {analysisResults.negotiationPoints.map(
                      (point: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 rounded-md bg-gray-100 p-3 shadow-sm"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/20 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{point}</p>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
