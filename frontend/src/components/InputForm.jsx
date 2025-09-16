import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calculator } from "lucide-react";

export function InputForm({ onCalculate }) {
  const [formData, setFormData] = React.useState({
    metal: "",
    productType: "",
    productionRoute: "",
    energySource: "",
    transportDistance: "",
    transportMode: "",
    endOfLife: "",
    materialGrade: "",
    alloyType: "",
    recycledContent: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Calculator className="w-5 h-5" />
          LCA Input Parameters
        </CardTitle>
        <CardDescription>
          Enter the details for your metal Life Cycle Assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metal Selection */}
            <div className="space-y-2">
              <Label htmlFor="metal">Metal Type *</Label>
              <Select
                value={formData.metal}
                onValueChange={(value) => updateField("metal", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluminium">Aluminium</SelectItem>
                  <SelectItem value="copper">Copper</SelectItem>
                  <SelectItem value="steel">Steel</SelectItem>
                  <SelectItem value="nickel">Nickel</SelectItem>
                  <SelectItem value="lithium">Lithium</SelectItem>
                  <SelectItem value="zinc">Zinc</SelectItem>
                  <SelectItem value="titanium">Titanium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Product/Application Type *</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => updateField("productType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wiring">Electrical Wiring</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="aerospace">Aerospace</SelectItem>
                  <SelectItem value="marine">Marine</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Production Route */}
            <div className="space-y-2">
              <Label htmlFor="productionRoute">Production Route *</Label>
              <Select
                value={formData.productionRoute}
                onValueChange={(value) => updateField("productionRoute", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">
                    Raw/Primary Production
                  </SelectItem>
                  <SelectItem value="recycled">Recycled Production</SelectItem>
                  <SelectItem value="mixed">
                    Mixed (Primary + Recycled)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Energy Source */}
            <div className="space-y-2">
              <Label htmlFor="energySource">Energy Source *</Label>
              <Select
                value={formData.energySource}
                onValueChange={(value) => updateField("energySource", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select energy source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid Electricity</SelectItem>
                  <SelectItem value="renewable">Renewable Energy</SelectItem>
                  <SelectItem value="fossil">Fossil-based</SelectItem>
                  <SelectItem value="mixed">Mixed Sources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transport Distance */}
            <div className="space-y-2">
              <Label htmlFor="transportDistance">Transport Distance (km)</Label>
              <Input
                id="transportDistance"
                type="number"
                placeholder="e.g., 500"
                value={formData.transportDistance}
                onChange={(e) =>
                  updateField("transportDistance", e.target.value)
                }
              />
            </div>

            {/* Transport Mode */}
            <div className="space-y-2">
              <Label htmlFor="transportMode">Transport Mode</Label>
              <Select
                value={formData.transportMode}
                onValueChange={(value) => updateField("transportMode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="multimodal">Multimodal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* End of Life */}
            <div className="space-y-2">
              <Label htmlFor="endOfLife">End-of-Life Option *</Label>
              <Select
                value={formData.endOfLife}
                onValueChange={(value) => updateField("endOfLife", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end-of-life" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recycling">Recycling</SelectItem>
                  <SelectItem value="reuse">Reuse</SelectItem>
                  <SelectItem value="landfill">Landfill</SelectItem>
                  <SelectItem value="energy-recovery">
                    Energy Recovery
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recycled Content */}
            <div className="space-y-2">
              <Label htmlFor="recycledContent">Recycled Content (%)</Label>
              <Input
                id="recycledContent"
                type="number"
                placeholder="e.g., 30"
                min="0"
                max="100"
                value={formData.recycledContent}
                onChange={(e) => updateField("recycledContent", e.target.value)}
              />
            </div>
          </div>

          {/* Optional Parameters */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-muted-foreground">Optional Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materialGrade">Material Grade</Label>
                <Input
                  id="materialGrade"
                  placeholder="e.g., 6061-T6"
                  value={formData.materialGrade}
                  onChange={(e) => updateField("materialGrade", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alloyType">Alloy Type</Label>
                <Input
                  id="alloyType"
                  placeholder="e.g., Al-Mg-Si"
                  value={formData.alloyType}
                  onChange={(e) => updateField("alloyType", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
              disabled={
                !formData.metal ||
                !formData.productType ||
                !formData.productionRoute ||
                !formData.energySource ||
                !formData.endOfLife
              }
            >
              Calculate LCA Impact
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
