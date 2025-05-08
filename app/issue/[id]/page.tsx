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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueResolutionComponent } from "@/components/IssueResolutionComponent";
import { API_BASE_URL } from "@/constants";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, string>
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

    const storedMethods = sessionStorage.getItem("selectedMethods");
    if (storedMethods) {
      setSelectedMethods(JSON.parse(storedMethods));
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#0B1A2F] mx-auto mb-4" />
          <p className="text-gray-500">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.issues) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto border border-gray-200 shadow-sm">
          <CardContent className="py-8 text-center">
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium mb-4 text-[#0B1A2F]">
              No Analysis Data Found
            </h3>
            <p className="text-gray-500 mb-6">
              Please return to the homepage and upload a file for analysis.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mx-auto bg-[#0B1A2F] text-white hover:bg-[#0B1A2F]/90"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issueCategories = Object.keys(analysis.issues);
  if (currentIssueIndex < 0 || currentIssueIndex >= issueCategories.length) {
    router.push("/");
    return null;
  }

  const currentIssue = issueCategories[currentIssueIndex];
  const issueDetails = analysis.issues[currentIssue];
  const isLastIssue = currentIssueIndex === issueCategories.length - 1;

  const formatIssueName = (issue: string): string => {
    return issue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleMethodChange = (method: string) => {
    const updatedMethods = { ...selectedMethods, [currentIssue]: method };
    setSelectedMethods(updatedMethods);
    sessionStorage.setItem("selectedMethods", JSON.stringify(updatedMethods));
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
    setProcessingData(true);
    setError(null);

    try {
      const payload = {
        filename: uploadedFile,
        methods: selectedMethods,
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

  const getResolutionMethods = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case "missing":
        return [
          "Mean",
          "Median",
          "Mode",
          "Backward Fill",
          "KNN Imputation",
          "Multivariate Imputation",
        ];
      case "outliers":
        return ["Z-Score", "Winsorization"];
      case "duplicates":
        return ["Remove Duplicates"];
      case "dtypes":
        return [
          "Explicit Type Casting",
          "Implicit Type Coercion",
          "Pattern-based Format Enforcement",
        ];
      case "formatting":
        return ["Standardize Format", "Remove Special Characters"];
      case "class_imbalance":
        return ["Undersample", "Oversample", "SMOTE"];
      case "categorical_conversion_needed":
        return ["One-Hot Encoding", "Label Encoding", "Binary Encoding"];
      case "lexical_issues":
        return ["Standardize Text", "Remove Punctuation", "Lowercase All"];
      default:
        return ["Auto Fix", "Manual Review Required"];
    }
  };

  const progressPercentage =
    ((currentIssueIndex + 1) / issueCategories.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500">
              Issue {currentIssueIndex + 1} of {issueCategories.length}
            </div>
            <div className="text-sm font-medium text-[#0B1A2F]">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#0B1A2F" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <CardTitle className="text-xl font-semibold text-[#0B1A2F]">
              {formatIssueName(currentIssue)} Issues
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <IssueResolutionComponent
              issueType={currentIssue}
              issueDetails={issueDetails}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-[#0B1A2F]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B1A2F]" />
                Select Resolution Method
              </h3>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <Select
                  onValueChange={handleMethodChange}
                  value={selectedMethods[currentIssue] || ""}
                >
                  <SelectTrigger className="w-full md:w-72 bg-white">
                    <SelectValue placeholder="Choose a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {getResolutionMethods(currentIssue).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Select the most appropriate method to resolve the{" "}
                    {formatIssueName(currentIssue).toLowerCase()} issues in your
                    dataset.
                  </p>
                </div>
              </div>
            </div>

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
              disabled={!selectedMethods[currentIssue] || processingData}
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
    </div>
  );
}
