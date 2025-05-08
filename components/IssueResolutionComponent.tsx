import Image from "next/image";
import { useState, useEffect, Key } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/constants";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface IssueResolutionProps {
  issueType: string;
  issueDetails: any;
  onMethodChange: (column: string, method: string) => void;
  selectedColumnMethods: Record<string, string>;
}

export function IssueResolutionComponent({
  issueType,
  issueDetails,
  onMethodChange,
  selectedColumnMethods,
}: IssueResolutionProps) {
  const [strategies, setStrategies] = useState<Record<string, any>>({});

  // Fetch recommendation strategies once
  useEffect(() => {
    async function loadStrategies() {
      try {
        const res = await fetch(`${API_BASE_URL}/strategies`, { credentials: "include" });
        const data = await res.json();
        setStrategies(data);
      } catch (err) {
        console.error("Failed to load strategies:", err);
      }
    }
    loadStrategies();
  }, []);

  const formatIssueDetails = () => {
    if (typeof issueDetails === "number") return [{ column: "Total Count", value: issueDetails }];
    return Object.entries(issueDetails).map(([column, value]) => {
      let formattedValue: string | number = 0;
      if (typeof value === "number") formattedValue = value;
      else if (typeof value === "string") formattedValue = value;
      else if (value && typeof value === "object") {
        const vals = Object.values(value);
        formattedValue = vals.length
          ? typeof vals[0] === "number"
            ? vals[0]
            : Object.keys(value).length
          : 0;
      }
      return { column, value: formattedValue };
    });
  };

  const rows = formatIssueDetails().filter(r => !(typeof r.value === "number" && r.value === 0));
  const formattedIssueType = issueType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const visuals = JSON.parse(sessionStorage.getItem("visualizations") || "[]").filter((url: string) =>
    issueType.toLowerCase() === "missing"
      ? url.includes("missing")
      : issueType.toLowerCase() === "outliers"
      ? ["scatter", "histo", "box"].some(p => url.includes(p))
      : false
  );
  const showColumnSelection = ["missing", "outliers", "categorical_conversion_needed", "dtypes"].includes(issueType.toLowerCase());
  const strategiesKey = issueType.toLowerCase() === "categorical_conversion_needed" ? "categorical_data_conversion" : issueType.toLowerCase();

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#0B1A2F] mb-4">About {formattedIssueType} Issues</h2>
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid grid-cols-2 gap-2 mb-4">
          <TabsTrigger value="visualization">Visualizations</TabsTrigger>
          <TabsTrigger value="data">Data Details</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization">
          {visuals.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visuals.map((src: string | StaticImport, i: Key) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Image width={300} height={200} src={src} alt={`${formattedIssueType} chart ${i}`} className="w-full h-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No visualizations available.</p>
          )}
        </TabsContent>

        <TabsContent value="data">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affected Rows</th>
                      {showColumnSelection && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>}
                      {showColumnSelection && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, idx) => {
                      const recObj = strategies[strategiesKey] || {};
                      const rec = recObj && typeof recObj === "object" && !Array.isArray(recObj)
                        ? recObj[row.column]
                        : undefined;
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.column}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.value}</td>
                          {showColumnSelection && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <Select onValueChange={val => onMethodChange(row.column, val)} value={selectedColumnMethods[row.column] || ""}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getResolutionMethodsForType(issueType).map(m => (
                                      <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rec ?? "-"}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



// Helper function to get description based on issue type
function getIssueDescription(issueType: string): string {
  const descriptions: Record<string, string> = {
    missing:
      "Missing values can significantly impact your analysis. These are cells in your dataset where no value was recorded, which can lead to biased results or errors in your analysis.",
    outliers:
      "Outliers are data points that differ significantly from other observations. They can distort statistical analyses and lead to incorrect conclusions.",
    duplicates:
      "Duplicate entries can skew your analysis by giving more weight to repeated data points. Removing duplicates ensures each observation is counted only once.",
    dtypes:
      "Data type issues occur when columns contain values of inconsistent types. Converting to appropriate data types ensures proper analysis and visualization.",
    formatting:
      "Formatting issues occur when data follows inconsistent formats, such as different date formats or number notations, which can lead to errors in processing.",
    class_imbalance:
      "Class imbalance occurs when target classes in your dataset are not represented equally, which can bias model predictions towards the majority class.",
    categorical_issues:
      "Categorical issues include inconsistent categories or unexpected labels that can affect grouping and model training.",
    categorical_conversion_needed:
      "Categorical data needs to be converted to numerical format for many machine learning algorithms to process them correctly.",
    lexical_issues:
      "Lexical issues include inconsistent text formatting, spelling variations, or character encoding problems that can affect text analysis.",
  };
  const key = issueType.toLowerCase().replace(/[^a-z_]/g, "");
  return (
    descriptions[key] ||
    "This issue affects the quality of your dataset and may impact analysis results."
  );
}

// Extracted resolution methods lookup
function getResolutionMethodsForType(issueType: string) {
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
    case "categorical_conversion_needed":
      return [
        "One-Hot Encoding",
        "Ordinal Encoding",
        "Binary Encoding",
        "Frequency Encoding",
        "Hash Encoding",
      ];
    case "dtypes":
      return [
        "Explicit Type Casting",
        "Implicit Type Coercion",
        "Pattern-based Format Enforcement",
      ];
    case "outliers":
      return ["Z-Score-Based Filtering", "Winsorization"];
    default:
      return [];
  }
}
