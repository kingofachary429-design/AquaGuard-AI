export function predictPollution(ph, turbidity, dissolvedOxygen, industries, rainfall) {
  let score = 0;

  // pH
  if (ph < 6.5 || ph > 8.5) score += 20;

  // Turbidity
  if (turbidity > 50) score += 25;
  else if (turbidity > 20) score += 10;

  // Dissolved Oxygen
  if (dissolvedOxygen < 5) score += 25;
  else if (dissolvedOxygen < 7) score += 10;

  // Industries nearby
  score += industries * 2;

  // Rainfall
  if (rainfall === "Heavy") score += 20;
  else if (rainfall === "Moderate") score += 10;

  // Limit score to 100
  score = Math.min(score, 100);

  let status = "Safe";

  if (score >= 70) status = "High Risk";
  else if (score >= 40) status = "Moderate";

  return {
    score,
    status,
  };
}