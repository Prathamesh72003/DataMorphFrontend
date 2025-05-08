"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { IssueResolutionComponent } from "@/components/IssueResolutionComponent";
import { API_BASE_URL } from "@/constants";

export default function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState("");
  const [selectedColumnMethods, setSelectedColumnMethods] = useState<
    Record<string, Record<string, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [processingData, setProcessingData] = useState(false);
  const { id } = use(params);
  const currentIssueIndex = Number.parseInt(id) - 1;

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedFile = sessionStorage.getItem("uploadedFile");
    if (storedAnalysis && storedFile) {
      setAnalysis(JSON.parse(storedAnalysis));
      setUploadedFile(storedFile);
      setIsLoading(false);
    } else {
      router.push("/");
    }

    const storedMethods = sessionStorage.getItem("selectedColumnMethods");
    if (storedMethods) {
      setSelectedColumnMethods(JSON.parse(storedMethods));
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading issue details...</span>
      </div>
    );
  }

  if (!analysis || !analysis.issues) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-6 w-6" />
          <AlertDescription>
            No Analysis Data Found. Please return to the homepage and upload a
            file for analysis.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 bg-[#0B1A2F] text-white hover:bg-[#0B1A2F]/90"
        >
          Return to Homepage
        </Button>
      </div>
    );
  }

  const issueCategories = Object.keys(analysis.issues);

  if (currentIssueIndex < 0 || currentIssueIndex >= issueCategories.length) {
    router.push("/");
    return null;
  }

  const currentIssueType = issueCategories[currentIssueIndex];
  const issueDetails = analysis.issues[currentIssueType];
  const isLastIssue = currentIssueIndex === issueCategories.length - 1;
  const formatIssueName = (issue: string): string => {
    return issue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleColumnMethodChange = (column: string, method: string) => {
    const updatedMethods = {
      ...selectedColumnMethods,
      [currentIssueType]: {
        ...selectedColumnMethods[currentIssueType],
        [column]: method,
      },
    };
    setSelectedColumnMethods(updatedMethods);
    sessionStorage.setItem(
      "selectedColumnMethods",
      JSON.stringify(updatedMethods)
    );
  };

  const handleNavigation = (direction: "back" | "next") => {
    if (direction === "back") {
      if (currentIssueIndex > 0) {
        router.push(`/issue/${currentIssueIndex}`);
      } else {
        router.push("/");
      }
    } else {
      if (!isLastIssue) {
        router.push(`/issue/${currentIssueIndex + 2}`);
      } else {
        handleProcessData();
      }
    }
  };

  const handleProcessData = async () => {
    console.log("Column Methods: ", selectedColumnMethods);
    setProcessingData(true);
    setError(null);
    try {
      const payload = {
        filename: uploadedFile,
        methods: selectedColumnMethods,
      };

      const res = await fetch(`${API_BASE_URL}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sessionStorage.setItem("processingResult", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setProcessingData(false);
    }
  };

  const progressPercentage =
    ((currentIssueIndex + 1) / issueCategories.length) * 100;

  return (
    <div className="container mx-auto p-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1A2F] mb-4">
          Issue {currentIssueIndex + 1} of {issueCategories.length}
        </h1>

        <div className="relative">
          <div className="rounded-full h-2 bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0B1A2F]"
              style={{ width: `${Math.round(progressPercentage)}%` }}
            ></div>
          </div>
          <span className="absolute right-0 top-[-20px] text-xs font-medium text-[#0B1A2F]">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-xl font-semibold text-[#0B1A2F]">
            {formatIssueName(currentIssueType)} Issues
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <IssueResolutionComponent
            issueType={currentIssueType}
            issueDetails={issueDetails}
            onMethodChange={handleColumnMethodChange}
            selectedColumnMethods={
              selectedColumnMethods[currentIssueType] || {}
            }
          />

          {error && (
            <Alert
              variant="destructive"
              className="mt-6 border-red-400 bg-red-50 text-red-700"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => handleNavigation("back")}
            className="flex items-center gap-2 text-[#0B1A2F] border-[#0B1A2F] hover:bg-[#0B1A2F]/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={() => handleNavigation("next")}
            disabled={processingData}
            className="bg-[#0B1A2F] text-white hover:bg-[#0B1A2F]/90 flex items-center gap-2"
          >
            {isLastIssue ? (
              processingData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Clean Data
                </>
              )
            ) : (
              <>
                Next Issue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
