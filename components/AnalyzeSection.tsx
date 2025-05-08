"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface IssueDetail {
  [key: string]: string | number | object;
}

export interface AnalysisData {
  issues: Record<string, IssueDetail>;
}

export function AnalyzeSection({
  analysis,
  onProcess,
}: {
  analysis: AnalysisData;
  onProcess: () => void;
}) {
  const { issues } = analysis;

  // Only show summary counts for each issue category
  const issueCounts = Object.entries(issues)
  .map(([category, details]) => {
    let count: number;

    if (typeof details === "number") {
      // if the entire details is a number, just use it
      count = details;
    } else if (details && typeof details === "object") {
      // details is an object: count each key if
      //   - its value is a number > 0, or
      //   - its value is non‑numeric (categorical, nested, etc.)
      count = Object.entries(details).filter(([_, v]) => {
        return typeof v === "number" ? v > 0 : true;
      }).length;
    } else {
      count = 0;
    }

    return { category, count };
  })
  .filter(({ count }) => count > 0);   // drop any category with zero count

const hasIssues = issueCounts.length > 0;


  return (
    <Card className="data-card mt-8 overflow-hidden animate-fade-in">
      <CardHeader
        className={`data-card-header ${
          hasIssues
            ? "bg-gradient-to-r from-error/10 to-error/5"
            : "bg-gradient-to-r from-success/10 to-success/5"
        }`}
      >
        <CardTitle className="data-card-title flex items-center gap-2">
          {hasIssues ? (
            <>
              <AlertTriangle className="h-5 w-5 text-error-600" />
              <span>Detected Issues</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-success-600" />
              <span>Data Analysis Complete</span>
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="data-card-content">
        {hasIssues ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {issueCounts.map(({ category, count }, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="data-badge-issue text-base py-1.5 px-4"
                  >
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    : {count}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <h3 className="font-medium text-foreground flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning-600" />
                Data Quality Issues Detected
              </h3>
              <p className="text-muted-foreground text-sm">
                We have identified several issues in your dataset that may
                affect your analysis. Click Proceed to review and fix each issue
                step by step.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="rounded-full bg-success-50 p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-success-500" />
            </div>
            <h3 className="text-xl font-medium text-success-600 mb-2">
              Your data looks clean!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No issues were detected in your dataset. Your data is ready for
              analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
