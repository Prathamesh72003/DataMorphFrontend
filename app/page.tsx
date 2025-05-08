"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadSection } from "../components/UploadSection";
import {
  type AnalysisData,
  AnalyzeSection,
} from "../components/AnalyzeSection";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "../constants";
import { ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState({ upload: false, analyze: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyze = async (filename: string) => {
      setLoading((prev) => ({ ...prev, analyze: true }));
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAnalysis({ issues: data.issues, ...data });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading((prev) => ({ ...prev, analyze: false }));
      }
    };

    if (uploadedFile) {
      setAnalysis(null);
      analyze(uploadedFile);
    }
  }, [uploadedFile]);

  const handleProceed = () => {
    if (analysis && Object.keys(analysis.issues).length > 0) {
      sessionStorage.setItem("analysisData", JSON.stringify(analysis));
      sessionStorage.setItem("uploadedFile", uploadedFile || "");
      router.push("/issue/1");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl bg-[#0B1A2F] shadow-lg p-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-slate-50 to-white bg-clip-text text-transparent">
            Transform Your Data with Intelligence
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Upload your data file to automatically detect and fix issues,
            ensuring clean and reliable data for your analysis.
          </p>
        </motion.div>

        <div className="mt-10">
          <UploadSection
            onUpload={setUploadedFile}
            loading={loading.upload}
            setError={setError}
          />
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mt-6 border-red-400 bg-red-50 text-red-700"
          >
            <AlertDescription className="flex items-center gap-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {uploadedFile && loading.analyze && (
          <div className="mt-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-[#E2F3F5] p-3 w-16 h-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#0B1A2F] animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#0B1A2F] mb-2">
              Analyzing Your Data
            </h3>
            <p className="text-gray-500">
              We are scanning your file for potential issues...
            </p>
          </div>
        )}

        {analysis && (
          <>
            <div className="mt-10">
              <AnalyzeSection analysis={analysis} onProcess={() => {}} />
            </div>

            {Object.keys(analysis.issues).length > 0 && (
              <motion.div
                className="mt-10 flex justify-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleProceed}
                  size="lg"
                  className="bg-[#0B1A2F] text-white hover:bg-[#0B1A2F]/90 flex items-center gap-2"
                >
                  Proceed to Fix Issues
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
