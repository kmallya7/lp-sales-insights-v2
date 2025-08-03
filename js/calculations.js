// calc.js

const UNIT_CONVERSIONS = {
  g:   { to: 'g', factor: 1 },
  kg:  { to: 'g', factor: 1000 },
  mg:  { to: 'g', factor: 0.001 },
  ml:  { to: 'ml', factor: 1 },
  l:   { to: 'ml', factor: 1000 },
  pc:  { to: 'pc', factor: 1 }
};

let ingredientList = [];
let calculationRows = [];

// --- Firestore helpers ---
function getFirestore() {
  if (window.firebase && window.firebase.firestore) {
    return window.firebase.firestore();
  }
  return null;
}
async function loadIngredientsFromFirestore() {
  const db = getFirestore();
  if (!db) return [];
  const snapshot = await db.collection("ingredients").get();
  return snapshot.docs.map(doc => doc.data());
}
async function addIngredientToFirestore(ingredient) {
  const db = getFirestore();
  if (!db) return;
  await db.collection("ingredients").doc(ingredient.name).set(ingredient);
}
async function deleteIngredientFromFirestore(name) {
  const db = getFirestore();
  if (!db) return;
  await db.collection("ingredients").doc(name).delete();
}
async function updateIngredientInFirestore(originalName, ingredient) {
  const db = getFirestore();
  if (!db) return;
  if (originalName !== ingredient.name) {
    await db.collection("ingredients").doc(originalName).delete();
  }
  await db.collection("ingredients").doc(ingredient.name).set(ingredient);
}

// --- Populate ingredient dropdown and unit selectors ---
async function populateIngredientDropdown() {
  ingredientList = await loadIngredientsFromFirestore();
  if (ingredientList.length === 0) {
    ingredientList = [
      { name: "Cream Cheese", defaultUnit: "kg", defaultPrice: 0 },
      { name: "Butter", defaultUnit: "g", defaultPrice: 0 },
      { name: "Milk", defaultUnit: "l", defaultPrice: 0 },
      { name: "Oil", defaultUnit: "ml", defaultPrice: 0 },
      { name: "Egg", defaultUnit: "pc", defaultPrice: 0 }
    ];
  }
  const ingredientSelect = document.getElementById("ingredientSelect");
  ingredientSelect.innerHTML = "";
  ingredientList.forEach(ingredient => {
    const option = document.createElement("option");
    option.value = ingredient.name;
    option.textContent = ingredient.name;
    ingredientSelect.appendChild(option);
  });
  // Set fields for first ingredient
  if (ingredientList.length > 0) {
    setFieldsForIngredient(ingredientList[0]);
  }
}

function setUnitOptions(selectId, defaultUnit) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";
  const base = UNIT_CONVERSIONS[defaultUnit].to;
  Object.entries(UNIT_CONVERSIONS).forEach(([unit, conv]) => {
    if (conv.to === base) {
      const option = document.createElement("option");
      option.value = unit;
      option.textContent = unit;
      if (unit === defaultUnit) option.selected = true;
      select.appendChild(option);
    }
  });
}

function setFieldsForIngredient(ingredient) {
  document.getElementById("totalPrice").value = ingredient.defaultPrice || "";
  setUnitOptions("totalUnit", ingredient.defaultUnit);
  setUnitOptions("usedUnit", ingredient.defaultUnit);
}

// --- Ingredient Change Handler ---
document.addEventListener("DOMContentLoaded", function() {
  populateIngredientDropdown().then(() => {
    document.getElementById("ingredientSelect").addEventListener("change", function() {
      const selected = ingredientList.find(i => i.name === this.value);
      if (selected) setFieldsForIngredient(selected);
    });
    renderIngredientsList();
  });
});

// --- Add Calculation Row ---
function calculateIngredientCost({ totalPrice, totalUnit, usedQty, usedUnit }) {
  // "totalPrice" is for 1 unit of "totalUnit"
  const usedBase = usedQty * UNIT_CONVERSIONS[usedUnit].factor;
  const totalBase = 1 * UNIT_CONVERSIONS[totalUnit].factor;
  if (totalBase === 0) return 0;
  return (usedBase / totalBase) * totalPrice;
}

function addCalculationRow() {
  const ingredient = document.getElementById("ingredientSelect").value;
  const totalPrice = parseFloat(document.getElementById("totalPrice").value) || 0;
  const totalUnit = document.getElementById("totalUnit").value;
  const usedQty = parseFloat(document.getElementById("usedQty").value) || 0;
  const usedUnit = document.getElementById("usedUnit").value;

  if (!ingredient || !totalPrice || !usedQty) {
    alert("Please fill all fields.");
    return;
  }

  const cost = calculateIngredientCost({
    totalPrice, totalUnit, usedQty, usedUnit
  });

  calculationRows.push({
    ingredient, usedQty, usedUnit, cost
  });
  renderCalculationList();
  document.getElementById("usedQty").value = "";
}

function renderCalculationList() {
  const list = document.getElementById("calculationList");
  if (!list) return;
  list.innerHTML = "";
  let total = 0;
  calculationRows.forEach((row, idx) => {
    total += row.cost;
    const li = document.createElement("li");
    li.className = "flex items-center justify-between bg-white rounded px-3 py-1 shadow-sm";
    li.innerHTML = `
      <span class="flex-1 text-gray-800">${row.ingredient} — ${row.usedQty} ${row.usedUnit}</span>
      <span class="text-orange-700 font-medium mr-2">₹${row.cost.toFixed(2)}</span>
      <button class="text-gray-400 hover:text-red-600 text-base font-bold px-2" title="Delete" data-idx="${idx}">&times;</button>
    `;
    list.appendChild(li);
  });
  const totalCostEl = document.getElementById("totalCalculatedCost");
  if (totalCostEl) totalCostEl.textContent = `₹${total.toFixed(2)}`;
  // Delete handler
  list.querySelectorAll("button[title='Delete']").forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute("data-idx"));
      calculationRows.splice(idx, 1);
      renderCalculationList();
    };
  });
}

// --- Add Calculation Button Handler ---
document.addEventListener("DOMContentLoaded", function() {
  const calcBtn = document.getElementById("calculateBakingCostBtn");
  if (calcBtn) {
    calcBtn.addEventListener("click", addCalculationRow);
  }
});

// --- Add Ingredient Modal Logic (with Firestore) ---
function showAddIngredientModal() {
  document.getElementById("addIngredientModal").style.display = "flex";
}
function hideAddIngredientModal() {
  document.getElementById("addIngredientModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function() {
  // Show modal
  const showBtn = document.getElementById("showAddIngredient");
  if (showBtn) showBtn.addEventListener("click", showAddIngredientModal);
  // Hide modal
  const cancelBtn = document.getElementById("cancelAddIngredient");
  if (cancelBtn) cancelBtn.addEventListener("click", hideAddIngredientModal);
  // Add ingredient form
  const addForm = document.getElementById("addIngredientForm");
  if (addForm) {
    addForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const name = document.getElementById("newIngredientName").value.trim();
      const defaultUnit = document.getElementById("newIngredientUnit").value;
      const defaultPrice = parseFloat(document.getElementById("newIngredientPrice").value) || 0;
      if (!name) return;
      const ingredient = { name, defaultUnit, defaultPrice };
      await addIngredientToFirestore(ingredient);
      hideAddIngredientModal();
      await populateIngredientDropdown();
      document.getElementById("ingredientSelect").value = name;
      setFieldsForIngredient(ingredient);
      await renderIngredientsList();
    });
  }
});

// --- Ingredient List UI, Edit, and Delete ---

async function renderIngredientsList() {
  const listEl = document.getElementById("ingredientsList");
  const noMsg = document.getElementById("noIngredientsMsg");
  ingredientList = await loadIngredientsFromFirestore();
  listEl.innerHTML = "";
  if (!ingredientList.length) {
    if (noMsg) noMsg.style.display = "";
    return;
  }
  if (noMsg) noMsg.style.display = "none";
  ingredientList.forEach(ing => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between py-3";
    li.innerHTML = `
      <div>
        <span class="font-medium text-gray-800">${ing.name}</span>
        <span class="text-gray-500 text-xs ml-2">₹${ing.defaultPrice} per ${ing.defaultUnit}</span>
      </div>
      <div class="flex gap-2">
        <button class="edit-ingredient-btn text-blue-600 hover:underline text-xs" data-name="${ing.name}">Edit</button>
        <button class="delete-ingredient-btn text-red-600 hover:underline text-xs" data-name="${ing.name}">Delete</button>
      </div>
    `;
    listEl.appendChild(li);
  });

  // Edit
  listEl.querySelectorAll(".edit-ingredient-btn").forEach(btn => {
    btn.onclick = function() {
      const name = this.getAttribute("data-name");
      const ing = ingredientList.find(i => i.name === name);
      if (!ing) return;
      document.getElementById("editIngredientOriginalName").value = ing.name;
      document.getElementById("editIngredientName").value = ing.name;
      document.getElementById("editIngredientUnit").value = ing.defaultUnit;
      document.getElementById("editIngredientPrice").value = ing.defaultPrice;
      document.getElementById("editIngredientModal").style.display = "flex";
    };
  });

  // Delete
  listEl.querySelectorAll(".delete-ingredient-btn").forEach(btn => {
    btn.onclick = async function() {
      const name = this.getAttribute("data-name");
      if (confirm(`Delete ingredient "${name}"?`)) {
        await deleteIngredientFromFirestore(name);
        await renderIngredientsList();
        await populateIngredientDropdown();
      }
    };
  });
}

// Edit Modal Logic
document.addEventListener("DOMContentLoaded", function() {
  const cancelBtn = document.getElementById("cancelEditIngredient");
  if (cancelBtn) cancelBtn.onclick = () => {
    document.getElementById("editIngredientModal").style.display = "none";
  };
  const editForm = document.getElementById("editIngredientForm");
  if (editForm) {
    editForm.onsubmit = async function(e) {
      e.preventDefault();
      const originalName = document.getElementById("editIngredientOriginalName").value;
      const name = document.getElementById("editIngredientName").value.trim();
      const defaultUnit = document.getElementById("editIngredientUnit").value;
      const defaultPrice = parseFloat(document.getElementById("editIngredientPrice").value) || 0;
      const ingredient = { name, defaultUnit, defaultPrice };
      await updateIngredientInFirestore(originalName, ingredient);
      document.getElementById("editIngredientModal").style.display = "none";
      await renderIngredientsList();
      await populateIngredientDropdown();
    };
  }
});

// Render on load and after add
document.addEventListener("DOMContentLoaded", function() {
  renderIngredientsList();
});

// --- Expose for debugging if needed ---
window.calculations = {
  UNIT_CONVERSIONS,
  calculateIngredientCost,
  populateIngredientDropdown,
  setUnitOptions,
  addCalculationRow,
  renderCalculationList,
  renderIngredientsList
};
