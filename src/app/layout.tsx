import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "../components/DashboardWrapper";

// Disable fetch-based caching globally
export const fetchCache = 'force-no-store';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Integrated Construction Management System",
  description: "A comprehensive platform for managing construction projects, resources, and teams efficiently.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
