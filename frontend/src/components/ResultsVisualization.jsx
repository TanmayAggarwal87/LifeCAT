import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Leaf, Zap, Droplets, Recycle, Clock, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { buildLcaJson } from "../utils/lca";

export function ResultsVisualization({ inputData, batchData }) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  // Mock calculation based on input data
  const calculateResults = () => {
    if (!inputData) return { carbon: 0, energy: 0, water: 0 };

    const baseImpacts = {
      aluminium: { carbon: 12000, energy: 45000, water: 1200 },
      copper: { carbon: 5500, energy: 28000, water: 800 },
      steel: { carbon: 2100, energy: 20000, water: 600 },
      nickel: { carbon: 15000, energy: 55000, water: 1500 },
      lithium: { carbon: 8500, energy: 35000, water: 2000 },
      zinc: { carbon: 3200, energy: 18000, water: 500 },
      titanium: { carbon: 18000, energy: 65000, water: 1800 },
    };

    const base = baseImpacts[inputData.metal] || baseImpacts.steel;

    // Apply modifiers based on production route
    const productionModifier =
      inputData.productionRoute === "recycled"
        ? 0.4
        : inputData.productionRoute === "mixed"
        ? 0.7
        : 1.0;

    // Apply energy source modifier
    const energyModifier =
      inputData.energySource === "renewable"
        ? 0.3
        : inputData.energySource === "grid"
        ? 1.0
        : inputData.energySource === "fossil"
        ? 1.3
        : 0.8;

    const carbon = Math.round(
      base.carbon * productionModifier * energyModifier
    );
    const energy = Math.round(
      base.energy * productionModifier * energyModifier
    );
    const water = Math.round(base.water * productionModifier);

    return { carbon, energy, water };
  };

  const results = calculateResults();

  // Derive LCA scenarios for comparison (Conventional vs Circular)
  const lcaCircular = inputData ? buildLcaJson(inputData) : null;
  const lcaConventional = inputData
    ? buildLcaJson({
        ...inputData,
        productionRoute: "primary",
        energySource: "fossil",
        recycledContent: 0,
      })
    : null;

  // Calculate averages for batch data
  const calculateBatchAverages = () => {
    if (!batchData || batchData.length === 0) return null;

    const totalCarbon = batchData.reduce(
      (sum, item) => sum + item.impact_assessment_results.totals.gwp_kg_co2e,
      0
    );
    const totalEnergy = batchData.reduce(
      (sum, item) => sum + item.impact_assessment_results.totals.ced_mj,
      0
    );
    const totalWater = batchData.reduce(
      (sum, item) =>
        sum + item.impact_assessment_results.totals.water_consumption_m3,
      0
    );
    const totalCircularity = batchData.reduce(
      (sum, item) => sum + item.impact_assessment_results.totals.mci_percent,
      0
    );

    return {
      avgCarbon: totalCarbon / batchData.length,
      avgEnergy: totalEnergy / batchData.length,
      avgWater: totalWater / batchData.length,
      avgCircularity: totalCircularity / batchData.length,
    };
  };

  const batchAverages =
    batchData && batchData.length > 1 ? calculateBatchAverages() : null;

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      const payload = buildLcaJson(inputData);
      const res = await fetch("http://localhost:3001/generate-lca-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "LCA_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || "Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Comparison data from LCA totals (GWP, CED, Water)
  const comparisonData =
    lcaCircular && lcaConventional
      ? [
          {
            name: "Conventional Route",
            "Carbon Footprint":
              lcaConventional.impact_assessment_results.totals.gwp_kg_co2e,
            "Energy Use":
              lcaConventional.impact_assessment_results.totals.ced_mj,
            // Convert m3 -> liters for more intuitive scale in charts
            "Water Use":
              (lcaConventional.impact_assessment_results.totals
                .water_consumption_m3 || 0) * 1000,
          },
          {
            name: "Circular Route",
            "Carbon Footprint":
              lcaCircular.impact_assessment_results.totals.gwp_kg_co2e,
            "Energy Use": lcaCircular.impact_assessment_results.totals.ced_mj,
            "Water Use":
              (lcaCircular.impact_assessment_results.totals
                .water_consumption_m3 || 0) * 1000,
          },
        ]
      : [];

  // End-of-life pie chart derived from LCA and user endOfLife
  const recyclingRate = lcaCircular
    ? Math.round(
        lcaCircular.life_cycle_inventory.end_of_life_assumptions
          .collection_for_recycling_rate_percent || 0
      )
    : 0;
  const baseReuse =
    (inputData?.endOfLife || "").toLowerCase() === "reuse"
      ? 20
      : (inputData?.endOfLife || "").toLowerCase() === "recycling"
      ? 5
      : 10;
  const energyRecoveryBase = 10;
  let landfillCalc = 100 - recyclingRate - baseReuse - energyRecoveryBase;
  if (landfillCalc < 0) {
    landfillCalc = 0;
  }
  const eolData = [
    { name: "Recycling", value: recyclingRate, color: "#22c55e" },
    { name: "Reuse", value: baseReuse, color: "#3b82f6" },
    { name: "Energy Recovery", value: energyRecoveryBase, color: "#f59e0b" },
    { name: "Landfill", value: landfillCalc, color: "#ef4444" },
  ];

  // Circularity metrics
  const circularityScore =
    inputData.productionRoute === "recycled"
      ? 85
      : inputData.productionRoute === "mixed"
      ? 65
      : 45;

  const recyclablePercent =
    inputData.metal === "aluminium"
      ? 95
      : inputData.metal === "copper"
      ? 90
      : inputData.metal === "steel"
      ? 85
      : 80;

  const lifeExtension =
    inputData.endOfLife === "reuse"
      ? 15
      : inputData.endOfLife === "recycling"
      ? 8
      : 0;

  return (
    <div className="w-full max-w-7xl space-y-6">
      {batchAverages && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-300">
              Batch Processing Summary
            </CardTitle>
            <CardDescription>
              Summary of {batchData.length} LCA calculations from your uploaded
              file.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Avg. Carbon Footprint
                </p>
                <p className="text-2xl font-semibold text-purple-600">
                  {batchAverages.avgCarbon.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  kg CO₂-eq
                </p>
              </div>
              <div className="p-4 bg-pink-50 dark:bg-pink-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg. Energy Use</p>
                <p className="text-2xl font-semibold text-pink-600">
                  {batchAverages.avgEnergy.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  MJ
                </p>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg. Water Use</p>
                <p className="text-2xl font-semibold text-indigo-600">
                  {batchAverages.avgWater.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  m³
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Avg. Circularity Score
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {batchAverages.avgCircularity.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                  /100
                </p>
              </div>
            </div>
            {/* Optionally, add a button to view individual results */}
            {/* <Button className="mt-4">View Individual Results</Button> */}
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact Report */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
          <CardTitle className="text-blue-700 dark:text-blue-300">
            Environmental Impact Report
          </CardTitle>
          <CardDescription>
            Impact assessment for {inputData?.metal} in {inputData?.productType}{" "}
            application
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-end gap-3 mb-4">
            <Button
              onClick={handleGeneratePdf}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating…" : "Generate PDF"}
            </Button>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-green-600 animate-spin"
                  aria-hidden
                />
                <span>Preparing report…</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Carbon Footprint
                </p>
                <p className="text-2xl font-semibold">
                  {results.carbon.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  kg CO₂-eq per ton
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energy Use</p>
                <p className="text-2xl font-semibold">
                  {results.energy.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">MJ per ton</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Water Use</p>
                <p className="text-2xl font-semibold">
                  {results.water.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">liters per ton</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circularity Indicators */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
            <Recycle className="w-5 h-5" />
            Circularity Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Material Recyclable
                </span>
                <Badge variant="secondary">{recyclablePercent}%</Badge>
              </div>
              <Progress value={recyclablePercent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Life Extension
                </span>
                <Badge variant="secondary">{lifeExtension} years</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Expected extension</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Resource Efficiency
                </span>
                <Badge
                  variant={
                    circularityScore >= 80
                      ? "default"
                      : circularityScore >= 60
                      ? "secondary"
                      : "destructive"
                  }
                  className={circularityScore >= 80 ? "bg-green-600" : ""}
                >
                  {circularityScore}/100
                </Badge>
              </div>
              <Progress value={circularityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Circular Opportunities
                </span>
                <Badge className="bg-blue-600">High</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-green-500" />
                <span className="text-sm">Multiple pathways available</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Comparison</CardTitle>
            <CardDescription>Conventional vs Circular Route</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Carbon Footprint" fill="#ef4444" />
                <Bar dataKey="Energy Use" fill="#f59e0b" />
                <Bar dataKey="Water Use" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* End-of-Life Pathways */}
        <Card>
          <CardHeader>
            <CardTitle>End-of-Life Pathways</CardTitle>
            <CardDescription>
              Typical distribution for {inputData?.metal}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eolData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
