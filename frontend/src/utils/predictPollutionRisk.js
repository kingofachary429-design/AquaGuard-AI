
export function predictPollutionRisk({
  ph,
  turbidity,
  dissolvedOxygen,
  rainfall,
  industrialActivity,
}) {
  const phValue = Number(ph);
  const turbidityValue = Number(turbidity);
  const dissolvedOxygenValue = Number(dissolvedOxygen);
  const rainfallValue = Number(rainfall);

  let riskScore = 0;

  const detectedIssues = [];
  const recommendations = [];

  // pH calculation
  if (phValue < 5 || phValue > 10) {
    riskScore += 30;

    detectedIssues.push("Dangerous pH level");

    recommendations.push(
      "Conduct immediate chemical contamination testing."
    );
  } else if (phValue < 6.5 || phValue > 8.5) {
    riskScore += 18;

    detectedIssues.push("Abnormal pH level");

    recommendations.push(
      "Monitor pH and investigate possible chemical discharge."
    );
  } else {
    riskScore += 3;
  }

  // Turbidity calculation
  if (turbidityValue > 100) {
    riskScore += 25;

    detectedIssues.push("Extremely high turbidity");

    recommendations.push(
      "Inspect for industrial waste, sewage, or soil runoff."
    );
  } else if (turbidityValue > 50) {
    riskScore += 18;

    detectedIssues.push("High turbidity");

    recommendations.push(
      "Increase sediment and suspended-particle monitoring."
    );
  } else if (turbidityValue > 10) {
    riskScore += 10;

    detectedIssues.push("Moderate turbidity");
  } else {
    riskScore += 2;
  }

  // Dissolved oxygen calculation
  if (dissolvedOxygenValue < 2) {
    riskScore += 30;

    detectedIssues.push(
      "Critically low dissolved oxygen"
    );

    recommendations.push(
      "Take immediate action to protect aquatic life."
    );
  } else if (dissolvedOxygenValue < 4) {
    riskScore += 22;

    detectedIssues.push("Low dissolved oxygen");

    recommendations.push(
      "Investigate sewage and organic waste contamination."
    );
  } else if (dissolvedOxygenValue < 6) {
    riskScore += 12;

    detectedIssues.push("Reduced dissolved oxygen");
  } else {
    riskScore += 2;
  }

  // Rainfall calculation
  if (rainfallValue > 150) {
    riskScore += 12;

    detectedIssues.push(
      "Heavy rainfall and runoff risk"
    );

    recommendations.push(
      "Monitor agricultural runoff and overflowing drainage."
    );
  } else if (rainfallValue > 75) {
    riskScore += 7;

    detectedIssues.push(
      "Moderate rainfall runoff risk"
    );
  }

  // Industrial activity calculation
  if (industrialActivity === "High") {
    riskScore += 20;

    detectedIssues.push(
      "High nearby industrial activity"
    );

    recommendations.push(
      "Inspect nearby industries for untreated wastewater discharge."
    );
  } else if (industrialActivity === "Medium") {
    riskScore += 12;

    detectedIssues.push(
      "Moderate nearby industrial activity"
    );
  } else {
    riskScore += 3;
  }

  const finalScore = Math.min(
    Math.round(riskScore),
    100
  );

  let riskLevel = "Low Risk";

  let riskMessage =
    "Water conditions appear relatively stable. Continue regular monitoring.";

  if (finalScore >= 80) {
    riskLevel = "Critical Risk";

    riskMessage =
      "Severe pollution risk detected. Immediate authority intervention is required.";
  } else if (finalScore >= 60) {
    riskLevel = "High Risk";

    riskMessage =
      "Major pollution indicators detected. Rapid investigation is recommended.";
  } else if (finalScore >= 35) {
    riskLevel = "Medium Risk";

    riskMessage =
      "Some pollution indicators require closer monitoring and inspection.";
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continue routine water-quality monitoring."
    );
  }

  recommendations.push(
    "Verify this prediction using certified laboratory testing."
  );

  return {
    riskScore: finalScore,
    riskLevel,
    riskMessage,
    detectedIssues,
    recommendations: [...new Set(recommendations)],
  };
}