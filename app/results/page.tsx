"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProcessSection } from "@/components/ProcessSection";
import { VisualizeSection } from "@/components/VisualizeSection";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constants";
import { ArrowLeft, FileCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ResultsPage() {
  const router = useRouter();
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [visualization, setVisualization] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visualizeLoading, setVisualizeLoading] = useState(false);

  useEffect(() => {
    // Retrieve processing result from sessionStorage
    const storedResult = sessionStorage.getItem("processingResult");
    const storedFile = sessionStorage.getItem("uploadedFile");

    if (storedResult && storedFile) {
      setProcessingResult(JSON.parse(storedResult));
      setUploadedFile(storedFile);
      setIsLoading(false);

      // Auto-trigger visualization
      handleVisualize(storedFile);

      // Trigger confetti animation for success
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    } else {
      // Redirect to home if no data is available
      router.push("/");
    }
  }, [router]);

  const handleVisualize = async (filename: string) => {
    setVisualizeLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/visualize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setVisualization(
        data.before_plot.map((plot: string) => `${API_BASE_URL}/${plot}`)
      );
    } catch (err) {
      console.error("Visualization error:", err);
    } finally {
      setVisualizeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-datamorph-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block rounded-full bg-success-50 p-3 mb-4">
            <FileCheck className="h-8 w-8 text-success-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-success-600 to-success-500 bg-clip-text text-black">
            Data Cleaning Complete!
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your data has been successfully processed and is ready for use. Here
            is a summary of the changes made.
          </p>
        </motion.div>

        {processingResult && (
          <ProcessSection
            processing={{
              downloadUrl: `${API_BASE_URL}${processingResult.download_url}`,
              appliedMethods: processingResult.applied_methods || [],
              previewHtml: processingResult.cleaned_data_html || "",
            }}
          />
        )}

        {visualizeLoading && (
          <div className="mt-8 p-6 data-card text-center">
            <Loader2 className="h-8 w-8 animate-spin text-datamorph-600 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Generating visualizations...
            </p>
          </div>
        )}

        {visualization && <VisualizeSection visualization={visualization} />}

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Process Another Dataset
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
