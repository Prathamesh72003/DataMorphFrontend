"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface VisualizeSectionProps {
  visualization: string[];
}

export function VisualizeSection({ visualization }: VisualizeSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrevious = () => {
    setActiveIndex((prev) =>
      prev === 0 ? visualization.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === visualization.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card className="data-card mt-8 overflow-hidden">
      <CardHeader className="data-card-header">
        <CardTitle className="data-card-title flex items-center gap-2">
          <BarChart className="h-5 w-5 text-datamorph-600" />
          Data Visualizations
        </CardTitle>
      </CardHeader>

      <CardContent className="data-card-content">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="gallery">Gallery View</TabsTrigger>
            <TabsTrigger value="carousel">Carousel View</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visualization.map((src, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="data-card overflow-hidden group hover:shadow-md transition-all duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`Visualization ${index + 1}`}
                          className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                          <div className="p-3 text-white text-sm font-medium">
                            Visualization {index + 1}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="carousel" className="animate-fade-in">
            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-border/50">
                <div className="relative aspect-video">
                  {visualization.map((src, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        index === activeIndex
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`Visualization ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="flex justify-center mt-4 gap-2">
                {visualization.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeIndex
                        ? "bg-datamorph-600"
                        : "bg-muted hover:bg-datamorph-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
