"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UploadSection } from "../components/UploadSection"
import { type AnalysisData, AnalyzeSection } from "../components/AnalyzeSection"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "../constants"
import { ArrowRight, Loader2, FileCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState({ upload: false, analyze: false })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const analyze = async (filename: string) => {
      setLoading((prev) => ({ ...prev, analyze: true }))
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
          credentials: "include",
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setAnalysis({ issues: data.issues, ...data })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading((prev) => ({ ...prev, analyze: false }))
      }
    }

    if (uploadedFile) {
      setAnalysis(null)
      analyze(uploadedFile)
    }
  }, [uploadedFile])

  const handleProceed = () => {
    if (analysis && Object.keys(analysis.issues).length > 0) {
      sessionStorage.setItem("analysisData", JSON.stringify(analysis))
      sessionStorage.setItem("uploadedFile", uploadedFile || "")
      router.push("/issue/1")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div className="max-w-5xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Section */}
          <motion.div
            variants={itemVariants}
            className="text-center overflow-hidden relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10"
            >
                <h1 className="text-xl md:text-3xl font-bold mb-3" style={{ color: "#0B1A2F" }}>Transform Your Data with Intelligence</h1>
              <p className="text-gray-500 text-lg md:text-lg max-w-3xl mx-auto leading-relaxed">
                Upload your data file to automatically detect and fix issues, ensuring clean and reliable data for your
                analysis and decision-making.
              </p>
            </motion.div>

            <motion.div
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </motion.div>

          {/* Upload Section */}
          <motion.div
            variants={itemVariants}
            className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-1 bg-slate-800 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Upload Your Data</h2>
            </div>
            <UploadSection onUpload={setUploadedFile} loading={loading.upload} setError={setError} />
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {uploadedFile && loading.analyze && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 text-center"
            >
              <motion.div
                className="flex justify-center mb-6"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              >
                <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-5 w-20 h-20 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-violet-600 dark:text-violet-400 animate-spin" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Analyzing Your Data</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                We're scanning your file for potential issues and preparing recommendations for optimization...
              </p>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mt-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-slate-800 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Analysis Results</h2>
                </div>
                <AnalyzeSection analysis={analysis} onProcess={() => {}} />
              </div>

              {/* Proceed Button */}
              {Object.keys(analysis.issues).length > 0 && (
                <motion.div
                  className="mt-8 flex justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleProceed}
                    size="lg"
                    className="bg-[#0B1A2F] cursor-pointer text-white shadow-lg flex items-center gap-2 px-6 py-6 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <span>Proceed to Fix Issues</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Features Section */}
          <motion.div variants={itemVariants} className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Intelligent Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI-powered system detects data inconsistencies, duplicates, and formatting issues automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">One-Click Fixes</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Resolve complex data issues with a single click using our smart recommendation engine.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Data Security</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your data never leaves your browser, ensuring complete privacy and security throughout the process.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
