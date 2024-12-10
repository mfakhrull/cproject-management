"use client";

import ContractResults from "@/components/dashboard/ContractResults";

interface IContractResultsProps {
  params: { id: string };
}

export default function ContractPage({ params: { id } }: IContractResultsProps) {
  return <ContractResults contractId={id} />;
}
