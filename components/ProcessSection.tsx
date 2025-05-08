"use client";
import { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProcessingProps {
  processing: {
    downloadUrl: string;
    appliedMethods: string[];
    previewHtml: string;
  };
}

export function ProcessSection({ processing }: ProcessingProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current && processing.previewHtml) {
      tableRef.current.innerHTML = processing.previewHtml;
    }
  }, [processing.previewHtml]);

  return (
    <Card className="data-card overflow-hidden">
      <CardHeader className="data-card-header bg-gradient-to-r from-success/20 to-success/5">
        <CardTitle className="data-card-title flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success-600" />
          Processing Complete
        </CardTitle>
      </CardHeader>

      <CardContent className="data-card-content space-y-6">
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-full bg-success-50 p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-success-500" />
          </div>
          <h3 className="text-xl font-medium text-success-600 mb-2">
            Data Cleaning Complete!
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your data has been successfully processed and is ready for download.
          </p>
        </motion.div>

        {processing.appliedMethods && processing.appliedMethods.length > 0 && (
          <div className="animate-slide-up">
            <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-datamorph-500"></span>
              Applied Methods
            </h4>
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 flex flex-wrap gap-2">
              {processing.appliedMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge className="data-badge-method">{method}</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-datamorph-500"></span>
            Cleaned Data Preview
          </h4>
          <Card className="data-card overflow-hidden border-border/50">
            <div ref={tableRef} className="overflow-x-auto max-h-80 p-1" />
          </Card>
        </div>
      </CardContent>

      <CardFooter className="data-card-footer flex justify-end gap-3">
        <Button asChild className="">
          <a href={processing.downloadUrl} download>
            <Download className="" />
            Download Cleaned Data
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
