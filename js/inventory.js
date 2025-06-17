// js/inventory.js

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("inventory");
  container.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold text-orange-500 flex items-center mb-1">
        <span class="mr-2">📦</span> Inventory Tracker
      </h2>
      <p class="text-sm text-gray-500 mb-6">Track your ingredient purchases and stock levels</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Items</p>
            <p id="inv-total-items" class="text-2xl font-bold text-blue-900">0</p>
          </div>
          <span class="text-blue-400 text-3xl">📦</span>
        </div>
        <div class="bg-green-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Inventory Value</p>
            <p id="inv-value" class="text-2xl font-bold text-green-800">₹0.00</p>
          </div>
          <span class="text-green-400 text-3xl">📈</span>
        </div>
        <div class="bg-red-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Low Stock Items</p>
            <p id="inv-low-stock" class="text-2xl font-bold text-red-700">0</p>
          </div>
          <span class="text-red-400 text-3xl">⚠️</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="md:col-span-2 space-y-4 bg-gray-50 p-4 rounded shadow">
          <h3 class="text-lg font-semibold text-gray-700">Add New Purchase</h3>
          <input id="inv-name" type="text" placeholder="Item Name (e.g., All-Purpose Flour)" class="w-full p-2 border rounded" required />
          <div class="flex gap-4">
            <input id="inv-qty" type="number" placeholder="Quantity Bought" class="w-full p-2 border rounded" />
            <input id="inv-cost" type="number" placeholder="Cost per Unit (₹)" class="w-full p-2 border rounded" />
          </div>
          <input id="inv-date" type="date" class="w-full p-2 border rounded" />
          <p class="text-green-700 font-semibold bg-green-50 p-2 rounded">Total Cost: <span id="inv-total">₹0.00</span></p>
          <button id="add-inv-btn" class="w-full bg-black text-white py-2 rounded">+ Add Item</button>
        </div>

        <div class="bg-white p-4 rounded shadow space-y-2">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Purchase Summary</h3>
          <div class="text-sm space-y-1">
            <p><span class="text-gray-500">Item Name:</span> <span id="inv-summary-name" class="text-blue-900 font-medium">Not specified</span></p>
            <p><span class="text-gray-500">Quantity:</span> <span id="inv-summary-qty" class="text-green-800">0 units</span></p>
            <p><span class="text-gray-500">Cost per Unit:</span> <span id="inv-summary-cost" class="text-purple-700">₹0.00</span></p>
            <p><span class="text-gray-500">Purchase Date:</span> <span id="inv-summary-date" class="text-orange-700">--</span></p>
            <hr />
            <p><span class="text-gray-700 font-medium">Total Investment:</span> <span id="inv-summary-total" class="text-black font-bold">₹0.00</span></p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded shadow p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Inventory Items</h3>
        <div id="inventory-list" class="text-sm text-gray-700 bg-gray-50 p-4 rounded border">
          No inventory items recorded yet. Add your first purchase above!
        </div>
      </div>
    </section>
  `;

  const db = window.db;

  function updateSummary(name, qty, cost, date) {
    const total = qty * cost;
    document.getElementById("inv-summary-name").innerText = name;
    document.getElementById("inv-summary-qty").innerText = `${qty} units`;
    document.getElementById("inv-summary-cost").innerText = `₹${cost.toFixed(2)}`;
    document.getElementById("inv-summary-date").innerText = date;
    document.getElementById("inv-summary-total").innerText = `₹${total.toFixed(2)}`;
    document.getElementById("inv-total").innerText = `₹${total.toFixed(2)}`;
  }

  document.getElementById("inv-name").addEventListener("input", e => updateSummary(e.target.value, getQty(), getCost(), getDate()));
  document.getElementById("inv-qty").addEventListener("input", e => updateSummary(getName(), parseFloat(e.target.value), getCost(), getDate()));
  document.getElementById("inv-cost").addEventListener("input", e => updateSummary(getName(), getQty(), parseFloat(e.target.value), getDate()));
  document.getElementById("inv-date").addEventListener("input", e => updateSummary(getName(), getQty(), getCost(), e.target.value));

  document.getElementById("add-inv-btn").addEventListener("click", async () => {
    const name = getName();
    const qty = getQty();
    const costPerUnit = getCost();
    const date = getDate();
    const totalCost = qty * costPerUnit;

    if (!name || !qty || !costPerUnit || !date) return;

    await db.collection("inventory").add({ name, qty, costPerUnit, date, totalCost });
    renderInventory();
  });

  function getName() { return document.getElementById("inv-name").value.trim(); }
  function getQty() { return parseFloat(document.getElementById("inv-qty").value) || 0; }
  function getCost() { return parseFloat(document.getElementById("inv-cost").value) || 0; }
  function getDate() { return document.getElementById("inv-date").value; }

  async function renderInventory() {
    const snapshot = await db.collection("inventory").orderBy("date", "desc").get();
    let totalItems = 0;
    let totalValue = 0;
    let lowStock = 0;
    let html = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      totalItems++;
      const cost = d.costPerUnit ?? d.cost ?? 0;
      const qty = d.qty ?? 0;
      const total = cost * qty;
      totalValue += total;
      if (qty < 5) lowStock++;
      html += `<div class='p-2 border-b'><strong>${d.name}</strong> - ₹${cost}/unit × ${qty} units (₹${total.toFixed(2)}) on ${d.date}</div>`;
    });

    document.getElementById("inventory-list").innerHTML = html || "No inventory items recorded yet.";
    document.getElementById("inv-total-items").innerText = totalItems;
    document.getElementById("inv-value").innerText = `₹${totalValue.toFixed(2)}`;
    document.getElementById("inv-low-stock").innerText = lowStock;
  }

  renderInventory();
});