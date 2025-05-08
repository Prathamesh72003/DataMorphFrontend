"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const getVisualization = (type: string) => {
    const allVisualizations = JSON.parse(
      sessionStorage.getItem("visualizations") || "[]"
    );
    let relevantVisualizations: string[] = [];

    if (type.toLowerCase() === "missing") {
      relevantVisualizations = allVisualizations.filter((url: string) =>
        url.split("/").pop()?.startsWith("missing")
      );
    } else if (type.toLowerCase() === "outliers") {
      relevantVisualizations = allVisualizations.filter((url: string) => {
        const filename = url.split("/").pop() || "";
        return (
          filename.startsWith("scatter") ||
          filename.startsWith("histo") ||
          filename.startsWith("box")
        );
      });
    }

    // Return at least placeholders if empty
    return relevantVisualizations.length > 0
      ? relevantVisualizations
      : [
          "/api/placeholder/300/200",
          "/api/placeholder/300/200",
          "/api/placeholder/300/200",
        ];
  };

  const formatIssueDetails = () => {
    if (typeof issueDetails === "number") {
      return [{ column: "Total Count", value: issueDetails }];
    }
    return Object.entries(issueDetails).map(([column, value]) => {
      let formattedValue: string | number = 0;
      if (typeof value === "number") formattedValue = value;
      else if (typeof value === "string") formattedValue = value;
      else if (typeof value === "object" && value !== null) {
        const values = Object.values(value);
        formattedValue =
          values.length > 0
            ? typeof values[0] === "number"
              ? values[0]
              : Object.keys(value).length
            : 0;
      }
      return { column, value: formattedValue };
    });
  };

  const visualizations = getVisualization(issueType);
  const tableData = formatIssueDetails();
  const formattedIssueType = issueType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const showColumnSelection = [
    "missing",
    "outliers",
    "categorical_conversion_needed",
    "dtypes",
  ].includes(issueType.toLowerCase());

  const getResolutionMethodsForType = (issueType: string) => {
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
  };

  const columnSpecificMethods = getResolutionMethodsForType(issueType);

  const isVisualizationSupported = ["missing", "outliers"].includes(
    issueType.toLowerCase()
  );

  const gridCols =
    visualizations.length > 3
      ? "grid-cols-1 md:grid-cols-4"
      : "grid-cols-1 md:grid-cols-3";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#0B1A2F] mb-2">
          About {formattedIssueType} Issues
        </h2>
        <p className="text-gray-600">{getIssueDescription(issueType)}</p>
      </div>

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="visualization">Visualizations</TabsTrigger>
          <TabsTrigger value="data">Data Details</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="animate-fade-in">
          {isVisualizationSupported ? (
            <div className={`grid gap-4 ${gridCols}`}>
              {visualizations.map((src, index) => (
                <Card
                  key={index}
                  className="data-card overflow-hidden group hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        width={300}
                        height={200}
                        src={src}
                        alt={`${issueType} visualization ${index + 1}`}
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                        <div className="p-3 text-white text-sm font-medium">
                          {formattedIssueType} Chart {index + 1}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              No visualizations available for this issue type.
            </p>
          )}
        </TabsContent>

        <TabsContent value="data" className="animate-fade-in">
          <Card className="data-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-200 shadow-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                      <th className="px-4 py-2 rounded-tl-lg border-b border-gray-200">
                        Column Name
                      </th>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Affected Rows / Issues
                      </th>
                      {showColumnSelection && (
                        <th className="px-4 py-2 rounded-tr-lg border-b border-gray-200">
                          Resolution Method
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData
                      .filter(
                        (row) =>
                          !(typeof row.value === "number" && row.value === 0)
                      )
                      .map((row, index) => (
                        <tr
                          key={index}
                          className="even:bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <td className="px-4 py-2 font-medium text-gray-800 border-b border-gray-200">
                            {row.column}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {row.value}
                          </td>
                          {showColumnSelection ? (
                            <td className="px-4 py-2 border-b border-gray-200">
                              <Select
                                onValueChange={(value) =>
                                  onMethodChange(row.column, value)
                                }
                                value={selectedColumnMethods[row.column] || ""}
                              >
                                <SelectTrigger className="w-full md:w-60 bg-white">
                                  <SelectValue placeholder="Choose method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {columnSpecificMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          ) : (
                            <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-500">
                              Default methods applied
                            </td>
                          )}
                        </tr>
                      ))}
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
