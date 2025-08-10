// batch.js

// --- Dropdown logic ---
window.toggleDropdown = function(id) {
  document.querySelectorAll('[id^="dropdown-"]').forEach(el => {
    if (el.id !== `dropdown-${id}`) el.classList.add('hidden');
  });
  const dropdown = document.getElementById(`dropdown-${id}`);
  if (dropdown) dropdown.classList.toggle('hidden');
};
document.addEventListener('click', function(event) {
  if (!event.target.closest('.relative')) {
    document.querySelectorAll('[id^="dropdown-"]').forEach(el => el.classList.add('hidden'));
  }
});

// --- Main UI logic ---
document.addEventListener("DOMContentLoaded", () => {
  const batchSection = document.getElementById("batchCalculator");
  batchSection.innerHTML = `
    <section class="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-xl max-w-5xl mx-auto mt-8 transition-all duration-300">
      <header class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span class="text-4xl">🧮</span> Batch Calculator
        </h2>
        
      </header>
      <p class="text-base text-gray-500 mb-8">Calculate profits for your pastry batches with a modern, intuitive interface.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Batch Details Form -->
        <div class="bg-white rounded-xl shadow p-6 flex flex-col gap-6">
          <h3 class="font-semibold text-xl mb-2">Batch Details</h3>
          <form id="batch-form" class="space-y-5" autocomplete="off">
            <div>
              <label for="cost" class="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (₹)</label>
              <input type="number" id="cost" placeholder="e.g. 20" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" min="0.01" step="0.01" required />
              <small class="text-gray-400">Enter the cost to make one unit.</small>
            </div>
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Selling Price per Unit (₹)</label>
              <input type="number" id="price" placeholder="e.g. 50" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" min="0.01" step="0.01" required />
              <small class="text-gray-400">How much you sell one unit for.</small>
            </div>
            <div>
              <label for="qty" class="block text-sm font-medium text-gray-700 mb-1">Quantity per Batch</label>
              <input type="number" id="qty" placeholder="e.g. 12" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" min="1" step="1" required />
              <small class="text-gray-400">How many units in one batch.</small>
            </div>
            <div id="form-error" class="text-red-500 text-sm hidden"></div>
            <div class="flex gap-4">
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg w-full font-semibold flex items-center justify-center gap-2 transition">
                <span>Calculate</span>
              </button>
              <button type="button" id="reset-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-lg w-full font-semibold flex items-center justify-center gap-2 transition">
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>
        <!-- Calculation Results -->
        <div class="bg-white rounded-xl shadow p-6 flex flex-col gap-6">
          <h3 class="font-semibold text-xl mb-2">Calculation Results</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg shadow flex flex-col items-start">
              <p class="text-sm font-medium text-blue-700">Total Revenue</p>
              <p id="revenue" class="text-2xl font-bold text-blue-900 mt-1">₹0.00</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg shadow flex flex-col items-start">
              <p class="text-sm font-medium text-red-700">Total Cost</p>
              <p id="costs" class="text-2xl font-bold text-red-900 mt-1">₹0.00</p>
            </div>
            <div id="grossProfitTile" class="bg-green-50 p-4 rounded-lg shadow flex flex-col items-start transition-colors duration-300">
              <p class="text-sm font-medium text-green-700">Gross Profit</p>
              <p id="profit" class="text-2xl font-bold text-green-900 mt-1">₹0.00</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg shadow flex flex-col items-start">
              <p class="text-sm font-medium text-purple-700">Profit Margin</p>
              <p id="margin" class="text-2xl font-bold text-purple-900 mt-1">0.00%</p>
            </div>
          </div>
          <button id="save-preset-btn" class="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-lg w-full font-semibold flex items-center justify-center gap-2 transition hover:scale-105">
            <span>Save as Preset</span>
          </button>
          <div id="save-loading" class="hidden mt-2 flex items-center gap-2 text-gray-500 text-sm animate-pulse">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>Saving...</span>
          </div>
        </div>
      </div>
      <!-- Preset List Section -->
      <div class="mt-12">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">📌 Common Batches</h3>
        <div id="preset-loading" class="hidden flex items-center gap-2 text-gray-500 text-sm mb-2 animate-pulse">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>Loading presets...</span>
        </div>
        <div id="preset-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"></div>
      </div>
    </section>
  `;

  // Reference to the database (assumed to be set up elsewhere)
  const db = window.db;

  // Helper functions for UI feedback
  const showError = (msg) => {
    const errorDiv = document.getElementById("form-error");
    errorDiv.innerText = msg;
    errorDiv.classList.remove("hidden");
    errorDiv.classList.add("animate-shake");
    setTimeout(() => errorDiv.classList.remove("animate-shake"), 500);
  };
  const hideError = () => {
    const errorDiv = document.getElementById("form-error");
    errorDiv.innerText = "";
    errorDiv.classList.add("hidden");
  };
  const setProfitTileColor = (profit) => {
    const tile = document.getElementById("grossProfitTile");
    tile.classList.remove("bg-green-50", "bg-red-50", "bg-yellow-50");
    if (profit > 0) tile.classList.add("bg-green-50");
    else if (profit < 0) tile.classList.add("bg-red-50");
    else tile.classList.add("bg-yellow-50");
  };

  // Calculation logic, called on input and submit
  const calculateAndDisplay = () => {
    const cost = parseFloat(document.getElementById("cost").value);
    const price = parseFloat(document.getElementById("price").value);
    const qty = parseFloat(document.getElementById("qty").value);

    if (isNaN(cost) || isNaN(price) || isNaN(qty) || cost <= 0 || price <= 0 || qty <= 0) {
      showError("Please enter valid positive numbers for all fields.");
      document.getElementById("revenue").innerText = `₹0.00`;
      document.getElementById("costs").innerText = `₹0.00`;
      document.getElementById("profit").innerText = `₹0.00`;
      document.getElementById("margin").innerText = `0.00%`;
      setProfitTileColor(0);
      return false;
    }
    hideError();

    const totalRevenue = price * qty;
    const totalCost = cost * qty;
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue === 0 ? 0 : (profit / totalRevenue) * 100;

    document.getElementById("revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("costs").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("profit").innerText = `₹${profit.toFixed(2)}`;
    document.getElementById("margin").innerText = `${margin.toFixed(2)}%`;
    setProfitTileColor(profit);

    return { cost, price, qty, profit };
  };

  // Reset form and results
  const resetFormAndResults = () => {
    document.getElementById("batch-form").reset();
    document.getElementById("revenue").innerText = `₹0.00`;
    document.getElementById("costs").innerText = `₹0.00`;
    document.getElementById("profit").innerText = `₹0.00`;
    document.getElementById("margin").innerText = `0.00%`;
    setProfitTileColor(0);
    hideError();
  };

  // Event listeners
  document.getElementById("reset-btn").addEventListener("click", resetFormAndResults);

  // Calculate on form submit
  document.getElementById("batch-form").addEventListener("submit", (e) => {
    e.preventDefault();
    calculateAndDisplay();
  });

  // Auto-calculate on input change
  ["cost", "price", "qty"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateAndDisplay);
  });

  // Preset management
  const showPresetLoading = () => {
    document.getElementById("preset-loading").classList.remove("hidden");
  };
  const hidePresetLoading = () => {
    document.getElementById("preset-loading").classList.add("hidden");
  };
  const showSaveLoading = () => {
    document.getElementById("save-loading").classList.remove("hidden");
  };
  const hideSaveLoading = () => {
    document.getElementById("save-loading").classList.add("hidden");
  };

  // Load and display presets
  async function loadPresets() {
    showPresetLoading();
    const presetList = document.getElementById("preset-list");
    presetList.innerHTML = "";
    try {
      const snapshot = await db.collection("batchPresets").orderBy("createdAt", "desc").get();
      if (snapshot.empty) {
        presetList.innerHTML = `<p class='text-sm text-gray-500'>No saved batches yet.</p>`;
      } else {
        snapshot.forEach(doc => {
          const d = doc.data();
          const card = document.createElement("div");
          card.className = "bg-white p-5 rounded-xl border shadow-lg hover:shadow-2xl transition flex flex-col gap-3 h-full cursor-pointer group relative";
          card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
              <span class="font-semibold text-gray-900 truncate group-hover:underline" title="${d.name}">${d.name}</span>
              <div class="relative">
                <button onclick="toggleDropdown('${doc.id}'); event.stopPropagation();" class="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" title="More actions" aria-haspopup="true" aria-expanded="false">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
                <div id="dropdown-${doc.id}" class="hidden absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-10">
                  <button class="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg" onclick='editPreset("${doc.id}", ${JSON.stringify(d)}); closeDropdown("${doc.id}"); event.stopPropagation();'>
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg" onclick='deletePreset("${doc.id}", "${d.name}"); closeDropdown("${doc.id}"); event.stopPropagation();'>
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-600 flex flex-col gap-1">
              <span>Cost: <span class="font-medium text-gray-900">₹${d.cost}</span></span>
              <span>Price: <span class="font-medium text-gray-900">₹${d.price}</span></span>
              <span>Qty: <span class="font-medium text-gray-900">${d.qty}</span></span>
            </div>
          `;
          card.addEventListener('click', () => {
            window.applyPreset(d);
          });
          presetList.appendChild(card);
        });
      }
    } catch (e) {
      presetList.innerHTML = `<p class='text-sm text-red-500'>Failed to load presets.</p>`;
    }
    hidePresetLoading();
  }

  // Save as preset
  document.getElementById("save-preset-btn").addEventListener("click", async () => {
    const cost = parseFloat(document.getElementById("cost").value);
    const price = parseFloat(document.getElementById("price").value);
    const qty = parseFloat(document.getElementById("qty").value);

    if (isNaN(cost) || isNaN(price) || isNaN(qty) || cost <= 0 || price <= 0 || qty <= 0) {
      showError("Please enter valid batch details before saving as a preset.");
      return;
    }
    hideError();

    const name = prompt("Label this batch (e.g., Brownie ₹50):");
    if (!name) return;

    showSaveLoading();
    await db.collection("batchPresets").add({ name, cost, price, qty, createdAt: new Date() });
    hideSaveLoading();
    loadPresets();
  });

  // Apply preset to form
  window.applyPreset = (data) => {
    document.getElementById("cost").value = data.cost;
    document.getElementById("price").value = data.price;
    document.getElementById("qty").value = data.qty;
    calculateAndDisplay();
  };

  // Delete preset with confirmation
  window.deletePreset = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the preset "${name}"?`)) return;
    await db.collection("batchPresets").doc(id).delete();
    loadPresets();
  };

  // Edit preset (name, cost, price, qty)
  window.editPreset = async (id, data) => {
    const newName = prompt("Edit batch label:", data.name) || data.name;
    const newCost = parseFloat(prompt("Edit cost per unit (₹):", data.cost)) || data.cost;
    const newPrice = parseFloat(prompt("Edit selling price per unit (₹):", data.price)) || data.price;
    const newQty = parseInt(prompt("Edit quantity per batch:", data.qty)) || data.qty;
    if (newCost <= 0 || newPrice <= 0 || newQty <= 0) {
      alert("Invalid values. Edit cancelled.");
      return;
    }
    await db.collection("batchPresets").doc(id).update({
      name: newName,
      cost: newCost,
      price: newPrice,
      qty: newQty
    });
    loadPresets();
  };

  // Helper to close dropdown after action
  window.closeDropdown = function(id) {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) dropdown.classList.add('hidden');
  };

  // Initial load
  loadPresets();
});
