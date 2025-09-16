// Simple LCA calculators based on provided formulas and available inputs.
// Note: Any missing inputs are assumed to be predicted by AI/ML elsewhere.

export function buildLcaJson(input) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  // Baseline emission factors (illustrative placeholders)
  const emissionFactorsKgCO2PerUnit = {
    electricity_kwh: 0.5, // kg CO2e per kWh (region dependent)
    natural_gas_mj: 0.056, // kg CO2e per MJ
    transport_tkm: 0.1, // kg CO2e per tonne-km (mode dependent)
    process_per_tonne: 50, // generic process emissions per tonne
  };

  // Map transport mode to efficiency/EF multipliers
  const transportEfMultiplierByMode = {
    road: 1.0,
    rail: 0.4,
    ship: 0.15,
    air: 5.0,
    multimodal: 0.7,
  };

  const metalDefaults = {
    aluminium: { baseWaterLPerTonne: 1200 },
    copper: { baseWaterLPerTonne: 800 },
    steel: { baseWaterLPerTonne: 600 },
    nickel: { baseWaterLPerTonne: 1500 },
    lithium: { baseWaterLPerTonne: 2000 },
    zinc: { baseWaterLPerTonne: 500 },
    titanium: { baseWaterLPerTonne: 1800 },
  };

  // Standardize input keys
  const getInputValue = (keys, defaultValue) => {
    for (const key of keys) {
      if (input[key] !== undefined) {
        return input[key];
      }
    }
    return defaultValue;
  };

  // Inputs
  const metal = getInputValue(["metal", "Metal Type"], "steel").toLowerCase();
  const productType = getInputValue(["productType", "Product Type"], "Product");
  const productionRoute = getInputValue(["productionRoute", "Production Route"], "primary").toLowerCase();
  const energySource = getInputValue(["energySource", "Energy Source"], "grid").toLowerCase();
  const distanceKm = Number(getInputValue(["transportDistance", "Transport Distance (km)"], 0));
  const transportMode = getInputValue(["transportMode", "Transport Mode"], "road").toLowerCase();
  const recycledContentPercent = Number(getInputValue(["recycledContent", "Recycled Content (%)"], 0));
  const companyName = getInputValue(["companyName", "Company Name"], "N/A");
  const geographicalScope = getInputValue(["geographicalScope", "Geographical Scope"], "Not specified");
  const intendedAudience = getInputValue(["intendedAudience", "Intended Audience"], "Engineering & Sustainability");

  // Scale factors based on route and energy
  const productionModifier =
    productionRoute === "recycled"
      ? 0.4
      : productionRoute === "mixed"
      ? 0.7
      : 1.0;
  const energyModifier =
    energySource === "renewable"
      ? 0.3
      : energySource === "fossil"
      ? 1.3
      : energySource === "mixed"
      ? 0.8
      : 1.0;

  // Assume a notional mass basis of 1 tonne product for cradle-to-gate
  const productMassTonne = 1;

  // Energy breakdown assumptions (illustrative): electricity 400 kWh/tonne, gas 600 MJ/tonne before modifiers
  const electricityKwh = 400 * productionModifier * energyModifier;
  const naturalGasMj =
    600 * productionModifier * (energySource === "renewable" ? 0.4 : 1.0);

  // Transport tonne-km
  const tkm = productMassTonne * distanceKm;

  // GWP = sum(EF_i * I_i)
  const gwpElectricity =
    emissionFactorsKgCO2PerUnit.electricity_kwh * electricityKwh;
  const gwpGas = emissionFactorsKgCO2PerUnit.natural_gas_mj * naturalGasMj;
  const gwpTransport =
    emissionFactorsKgCO2PerUnit.transport_tkm *
    tkm *
    (transportEfMultiplierByMode[transportMode] || 1.0);
  const gwpProcess =
    emissionFactorsKgCO2PerUnit.process_per_tonne *
    productMassTonne *
    productionModifier;
  const gwpTotal = round2(gwpElectricity + gwpGas + gwpTransport + gwpProcess);

  // Energy Use = sum(EU_i)
  const energyProcessing = naturalGasMj; // MJ
  // Convert electricity kWh to MJ (1 kWh ≈ 3.6 MJ)
  const energyElectricity = electricityKwh * 3.6;
  // Transport energy estimate: EU_transport = (M * D) / eta, with eta ~ 0.5 tonne-km per MJ for road baseline
  const etaByMode = {
    road: 0.5,
    rail: 1.5,
    ship: 4.0,
    air: 0.05,
    multimodal: 0.8,
  };
  const eta = etaByMode[transportMode] || 0.5;
  const energyTransport = eta > 0 ? (productMassTonne * distanceKm) / eta : 0;
  const energyTotal = round2(
    energyProcessing + energyElectricity + energyTransport
  );

  // Water Use: stage-wise sum, start with baseline by metal and scale with productionModifier
  const waterBase =
    (metalDefaults[metal]?.baseWaterLPerTonne || 600) * productionModifier;
  const waterUse = Math.round(waterBase);

  // Circularity indicators
  const recyclablePercent = Math.max(
    0,
    Math.min(
      100,
      recycledContentPercent ||
        (metal === "aluminium"
          ? 95
          : metal === "copper"
          ? 90
          : metal === "steel"
          ? 85
          : 80)
    )
  );

  // MCI simplified: 1 - (V / (V + R)) * (1 - E)
  const V = 100 - recyclablePercent; // proxy for virgin input share
  const R = recyclablePercent; // proxy for recycled input share
  const E = Math.min(1, Math.max(0, recycledContentPercent / 100)); // proxy for end-of-life recycling rate
  const mci = round2(1 - (V / (V + R)) * (1 - E)) * 100;

  // Contribution by stage (rough partitioning)
  const byStage = {
    raw_materials: {
      gwp_kg_co2e: round2(gwpProcess * 0.25),
      ced_mj: round2(energyProcessing * 0.25),
    },
    manufacturing: {
      gwp_kg_co2e: round2(gwpElectricity + gwpGas + gwpProcess * 0.5),
      ced_mj: round2(energyProcessing + energyElectricity),
    },
    transportation: {
      gwp_kg_co2e: round2(gwpTransport + gwpProcess * 0.25),
      ced_mj: round2(energyTransport),
    },
  };

  return {
    project_details: {
      product_name: `${capitalize(metal)} ${productType}`,
      company_name: companyName,
      report_id: `LCA-${dateStr.replace(/-/g, "")}-${Math.floor(
        Math.random() * 1000
      )}`,
      generation_date: dateStr,
    },
    scope_and_boundaries: {
      functional_unit: `1 tonne of ${metal} at the factory gate`,
      system_boundaries: "Cradle-to-Gate",
      geographical_scope: geographicalScope,
      time_horizon: String(new Date().getFullYear()),
      intended_audience: intendedAudience,
    },
    life_cycle_inventory: {
      raw_materials: {
        description: "Primary inputs per tonne product (estimated).",
        scrap_aluminium_input_percent:
          metal === "aluminium" ? recycledContentPercent : undefined,
        primary_aluminium_ingot_percent:
          metal === "aluminium"
            ? Math.max(0, 100 - recycledContentPercent - 2)
            : undefined,
        alloying_elements_percent: metal === "aluminium" ? 2 : undefined,
      },
      energy_inputs: {
        description:
          "Energy consumed during manufacturing processes (estimated).",
        grid_electricity_kwh: round2(electricityKwh),
        natural_gas_mj: round2(naturalGasMj),
        renewable_share_of_electricity_percent:
          energySource === "renewable"
            ? 100
            : energySource === "mixed"
            ? 50
            : 0,
      },
      transportation: {
        description: "Inbound raw material and outbound transport assumptions.",
        distance_km: distanceKm,
        mode: transportMode,
      },
      manufacturing_processes: ["Melting/Casting", "Shaping/Finishing"],
      end_of_life_assumptions: {
        description:
          "Simple end-of-life recycling proxy based on recyclable %.",
        collection_for_recycling_rate_percent: recyclablePercent,
        landfill_rate_percent: round2(100 - recyclablePercent),
      },
    },
    impact_assessment_results: {
      by_stage: byStage,
      totals: {
        gwp_kg_co2e: gwpTotal,
        ced_mj: energyTotal,
        mci_percent: round2(mci),
        water_consumption_m3: round2(waterUse / 1000),
        adp_kg_sbeq: 0.00015,
        odp_kg_cfc11eq: 0.00000012,
        ap_kg_so2eq: 0.04,
        ep_kg_po4eq: 0.009,
        human_toxicity_kg_dcb: 0.08,
        eco_toxicity_kg_dcb: 0.15,
      },
    },
  };
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}
