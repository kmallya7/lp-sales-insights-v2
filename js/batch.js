// batch.js

document.addEventListener("DOMContentLoaded", () => {
  const batchSection = document.getElementById("batchCalculator");
  batchSection.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-2 text-text flex items-center">
        <span class="mr-2">🧮</span> Batch Calculator
      </h2>
      <p class="text-sm text-gray-500 mb-6">Calculate profits for your pastry batches</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold text-lg mb-2">Batch Details</h3>
          <form id="batch-form" class="space-y-4">
            <input type="number" id="cost" placeholder="Cost per Unit (₹)" class="w-full p-2 border rounded" required />
            <input type="number" id="price" placeholder="Selling Price per Unit (₹)" class="w-full p-2 border rounded" required />
            <input type="number" id="qty" placeholder="Quantity per Batch" class="w-full p-2 border rounded" required />
            <div class="flex gap-3">
              <button type="submit" class="bg-black text-white px-4 py-2 rounded w-full">Calculate</button>
              <button type="button" id="reset-btn" class="bg-gray-200 text-gray-800 px-4 py-2 rounded w-full">Reset</button>
            </div>
          </form>
        </div>
        <div>
          <h3 class="font-semibold text-lg mb-2">Calculation Results</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-100 p-4 rounded shadow flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-blue-700">Total Revenue</p>
                <p id="revenue" class="text-xl font-bold text-blue-900">₹0.00</p>
              </div>
            </div>
            <div class="bg-red-100 p-4 rounded shadow flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-red-700">Total Cost</p>
                <p id="costs" class="text-xl font-bold text-red-900">₹0.00</p>
              </div>
            </div>
            <div id="grossProfitTile" class="bg-green-100 p-4 rounded shadow flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-green-700">Gross Profit</p>
                <p id="profit" class="text-xl font-bold text-green-900">₹0.00</p>
              </div>
            </div>
            <div class="bg-purple-100 p-4 rounded shadow flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-purple-700">Profit Margin</p>
                <p id="margin" class="text-xl font-bold text-purple-900">0.00%</p>
              </div>
            </div>
          </div>
          <button id="save-preset-btn" class="mt-6 bg-black text-white px-4 py-2 rounded w-full">Save as Preset</button>
        </div>
      </div>

      <div class="mt-10">
        <h3 class="text-lg font-semibold mb-4">📌 Common Batches</h3>
        <div id="preset-list" class="grid gap-4"></div>
      </div>
    </section>
  `;

  const db = window.db;

  // Reset form and results
  const resetFormAndResults = () => {
    document.getElementById("batch-form").reset();
    document.getElementById("revenue").innerText = `₹0.00`;
    document.getElementById("costs").innerText = `₹0.00`;
    document.getElementById("profit").innerText = `₹0.00`;
    document.getElementById("margin").innerText = `0.00%`;
  };

  document.getElementById("reset-btn").addEventListener("click", resetFormAndResults);

  // Calculate only (no save)
  document.getElementById("batch-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const cost = parseFloat(document.getElementById("cost").value);
    const price = parseFloat(document.getElementById("price").value);
    const qty = parseFloat(document.getElementById("qty").value);

    if (cost <= 0 || price <= 0 || qty <= 0) return;

    const totalRevenue = price * qty;
    const totalCost = cost * qty;
    const profit = totalRevenue - totalCost;
    const margin = (profit / totalRevenue) * 100;

    document.getElementById("revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("costs").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("profit").innerText = `₹${profit.toFixed(2)}`;
    document.getElementById("margin").innerText = `${margin.toFixed(2)}%`;

    if (profit > 0) launchConfettiAndSound();
  });

  // Save as preset (only when user clicks)
  document.getElementById("save-preset-btn").addEventListener("click", async () => {
    const cost = parseFloat(document.getElementById("cost").value);
    const price = parseFloat(document.getElementById("price").value);
    const qty = parseFloat(document.getElementById("qty").value);

    if (isNaN(cost) || isNaN(price) || isNaN(qty) || cost <= 0 || price <= 0 || qty <= 0) {
      alert("Please enter valid batch details before saving as a preset.");
      return;
    }

    const name = prompt("Label this batch (e.g., Brownie ₹50):");
    if (!name) return;

    await db.collection("batchPresets").add({ name, cost, price, qty, createdAt: new Date() });
    loadPresets();
  });

  // Load and display presets
  async function loadPresets() {
    const presetList = document.getElementById("preset-list");
    const snapshot = await db.collection("batchPresets").orderBy("createdAt", "desc").get();
    presetList.innerHTML = snapshot.empty ? `<p class='text-sm text-gray-500'>No saved batches yet.</p>` : "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "bg-gray-50 p-4 rounded border hover:shadow transition";
      card.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <span class="font-medium text-gray-800">${d.name}</span>
          <div class="flex gap-2">
            <button class="text-sm text-blue-600 hover:underline" onclick='applyPreset(${JSON.stringify(d)})'>Apply</button>
            <button class="text-sm text-red-500 hover:underline" onclick='deletePreset("${doc.id}")'>Delete</button>
          </div>
        </div>
        <p class="text-sm text-gray-600">Cost: ₹${d.cost} | Price: ₹${d.price} | Qty: ${d.qty}</p>
      `;
      presetList.appendChild(card);
    });
  }

  window.applyPreset = (data) => {
    document.getElementById("cost").value = data.cost;
    document.getElementById("price").value = data.price;
    document.getElementById("qty").value = data.qty;
    resetFormAndResults(); // Clear old results when applying
  };

  window.deletePreset = async (id) => {
    await db.collection("batchPresets").doc(id).delete();
    loadPresets();
  };

  loadPresets();
});

function launchConfettiAndSound() {
  const tile = document.getElementById("grossProfitTile");
  if (window.confetti && tile) {
    const rect = tile.getBoundingClientRect();
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
    });
  }
  const sound = document.getElementById("successSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}
