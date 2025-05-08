"use client";
import { useState, useRef } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function UploadSection({
  onUpload,
  loading,
  setError,
}: {
  onUpload: (filename: string) => void;
  loading: boolean;
  setError: (error: string | null) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onUpload(data.filename);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="data-card overflow-hidden">
      <CardContent className="data-card-content">
        <div
          className={cn(
            "data-upload-zone group animate-fade-in",
            isDragging ? "data-upload-zone-active" : "data-upload-zone-inactive"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="mb-4 rounded-full bg-datamorph-100 p-3 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <FileUp className="h-8 w-8 text-datamorph-600" />
          </div>

          <div className="flex flex-row items-center justify-center">
            <h3 className="text-xl font-medium text-foreground mb-2">
              Upload Your Data File
            </h3>
          </div>

          <p className="text-center text-gray-600 max-w-md mx-auto">
            Drag & drop your CSV, Excel, PDF, or SQL file here, or click to
            browse your files
          </p>

          <div className=" text-center mt-4 text-xs">
            Supported formats: .csv, .xlsx, .xls, .pdf, .sql
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls,.pdf,.sql"
          />
        </div>

        {selectedFile && (
          <div className="mt-6 animate-slide-up">
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-datamorph-100 p-2">
                  <FileText className="h-6 w-6 text-datamorph-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="h-8 w-8 rounded-full hover:bg-error/10 hover:text-error-600"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>

            {uploadLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="mt-4">
              <Button
                className="w-full relative overflow-hidden group  bg-[#0B1A2F] cursor-pointer text-white shadow-lg shadow-violet-500/20 flex items-center gap-2 px-6 py-6 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={handleUpload}
                disabled={!selectedFile || uploadLoading || loading}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {uploadLoading ? "Uploading..." : "Upload & Analyze"}
                  {!uploadLoading && (
                    <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-datamorph-600 to-datamorph-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
