// js/calculations.js

// Ingredient data: name, package size, unit, cost, allowed units
const ingredients = [
  {
    name: "Cream cheese",
    packageSize: 1000, // 1kg
    packageUnit: "g",
    packageCost: 750,
    allowedUnits: ["g", "kg"]
  },
  {
    name: "Vegetable oil",
    packageSize: 5000, // 5L
    packageUnit: "ml",
    packageCost: 850,
    allowedUnits: ["ml", "L"]
  },
  // Add more ingredients as needed
];

// Conversion helpers
function toBaseUnit(amount, unit) {
  // Solids: g, kg | Liquids: ml, L
  if (unit === "kg") return amount * 1000;
  if (unit === "g") return amount;
  if (unit === "L") return amount * 1000;
  if (unit === "ml") return amount;
  return amount;
}

// Display units nicely
function formatUnit(amount, unit) {
  if (unit === "kg" || unit === "L") return `${amount} ${unit}`;
  return `${amount} ${unit}`;
}

// Find ingredient by name
function getIngredient(name) {
  return ingredients.find(ing => ing.name === name);
}

// Calculate cost for used amount
function calculateCost(ingredientName, usedAmount, usedUnit) {
  const ingredient = getIngredient(ingredientName);
  if (!ingredient) return 0;

  // Convert used amount and package size to base unit
  const usedAmountBase = toBaseUnit(usedAmount, usedUnit);
  const packageSizeBase = toBaseUnit(ingredient.packageSize, ingredient.packageUnit);

  // Cost per base unit
  const costPerBaseUnit = ingredient.packageCost / packageSizeBase;

  // Total cost for used amount
  const totalCost = usedAmountBase * costPerBaseUnit;

  // Round to 2 decimals
  return Math.round(totalCost * 100) / 100;
}

// Get allowed units for ingredient
function getAllowedUnits(ingredientName) {
  const ingredient = getIngredient(ingredientName);
  return ingredient ? ingredient.allowedUnits : [];
}

// Example usage (remove or comment out in production)
if (typeof window !== "undefined") {
  window.BakingCalculator = {
    ingredients,
    calculateCost,
    getAllowedUnits
  };
}
