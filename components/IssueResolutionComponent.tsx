"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IssueResolutionProps {
  issueType: string;
  issueDetails: any;
}

export function IssueResolutionComponent({
  issueType,
  issueDetails,
}: IssueResolutionProps) {
  // Function to generate visualization placeholders based on issue type
  const getVisualization = (type: string) => {
    // In a real implementation, these would be actual URLs from the backend
    // For now, we use placeholder visuals
    return [
      "/api/placeholder/300/200",
      "/api/placeholder/300/200",
      "/api/placeholder/300/200",
    ];
  };

  // Function to format the issue details into tabular data
  const formatIssueDetails = () => {
    if (typeof issueDetails === "number") {
      return [{ column: "Total Count", count: issueDetails }];
    }

    return Object.entries(issueDetails).map(([column, value]) => {
      let count = 0;
      if (typeof value === "number") {
        count = value;
      } else if (typeof value === "object" && value !== null) {
        // For nested objects, we take the first numeric value or length
        const values = Object.values(value);
        count =
          values.length > 0
            ? typeof values[0] === "number"
              ? values[0]
              : Object.keys(value).length
            : 0;
      }

      return { column, count };
    });
  };

  const visualizations = getVisualization(issueType);
  const tableData = formatIssueDetails();
  const formattedIssueType = issueType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            About {formattedIssueType} Issues
          </h3>
          <p className="text-muted-foreground text-sm">
            {getIssueDescription(issueType)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="visualization">Visualizations</TabsTrigger>
          <TabsTrigger value="data">Data Details</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      src={src || "/placeholder.svg"}
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
                      <th className="px-4 py-2 rounded-tr-lg border-b border-gray-200">
                        Affected Rows
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <td className="px-4 py-2 font-medium text-gray-800 border-b border-gray-200">
                          {row.column}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <Badge variant="outline" className="text-sm">
                            {row.count}
                          </Badge>
                        </td>
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
