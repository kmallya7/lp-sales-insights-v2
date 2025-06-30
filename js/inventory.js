// js/inventory.js

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // Get the main container where the inventory UI will be rendered
  const container = document.getElementById("inventory");

  // Render the main Inventory Tracker UI with your requested fields
  container.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <!-- Header Section -->
      <h2 class="text-2xl font-bold text-orange-500 flex items-center mb-1">
        <span class="mr-2">📦</span> Inventory Tracker
      </h2>
      <p class="text-sm text-gray-500 mb-6">Track your product purchases and stock levels</p>

      <!-- Inventory Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Products</p>
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
            <p class="text-sm text-gray-500">Low Stock Products</p>
            <p id="inv-low-stock" class="text-2xl font-bold text-red-700">0</p>
          </div>
          <span class="text-red-400 text-3xl">⚠️</span>
        </div>
      </div>

      <!-- Add/Edit Product Form and Product Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Add/Edit Product Form -->
        <div class="md:col-span-2 space-y-4 bg-gray-50 p-4 rounded shadow">
          <h3 class="text-lg font-semibold text-gray-700">Add New Product</h3>
          <form id="inv-form" autocomplete="off">
            <div class="mb-2">
              <input id="inv-product" type="text" placeholder="Product Name" class="w-full p-2 border rounded" required autocomplete="off" />
              <div id="error-product" class="error text-red-600 text-xs mt-1 hidden"></div>
            </div>
            <div class="flex gap-4 mb-2">
              <div class="w-full">
                <input id="inv-qty" type="number" placeholder="Quantity" class="w-full p-2 border rounded" min="1" required />
                <div id="error-qty" class="error text-red-600 text-xs mt-1 hidden"></div>
              </div>
              <div class="w-full">
                <input id="inv-unit" type="text" placeholder="Unit (e.g., kg, g, pcs)" class="w-full p-2 border rounded" required />
                <div id="error-unit" class="error text-red-600 text-xs mt-1 hidden"></div>
              </div>
            </div>
            <div class="flex gap-4 mb-2">
              <div class="w-full">
                <input id="inv-mrp" type="number" placeholder="MRP (₹)" class="w-full p-2 border rounded" min="0" step="0.01" required />
                <div id="error-mrp" class="error text-red-600 text-xs mt-1 hidden"></div>
              </div>
              <div class="w-full">
                <input id="inv-rate" type="number" placeholder="Rate (₹)" class="w-full p-2 border rounded" min="0" step="0.01" required />
                <div id="error-rate" class="error text-red-600 text-xs mt-1 hidden"></div>
              </div>
            </div>
            <div class="mb-2">
              <input id="inv-notes" type="text" placeholder="Notes (optional)" class="w-full p-2 border rounded" />
            </div>
            <p class="text-green-700 font-semibold bg-green-50 p-2 rounded">Amount: <span id="inv-amount">₹0.00</span></p>
            <button id="add-inv-btn" type="submit" class="w-full bg-black text-white py-2 rounded">+ Add Product</button>
            <button id="update-inv-btn" type="button" class="w-full bg-blue-600 text-white py-2 rounded hidden">Update Product</button>
            <button id="cancel-edit-btn" type="button" class="w-full bg-gray-300 text-black py-2 rounded hidden">Cancel Edit</button>
          </form>
          <div id="success-msg" class="success text-green-800 text-sm hidden"></div>
        </div>

        <!-- Product Summary Card -->
        <div class="bg-white p-4 rounded shadow space-y-2">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Product Summary</h3>
          <div class="text-sm space-y-1">
            <p><span class="text-gray-500">Product:</span> <span id="inv-summary-product" class="text-blue-900 font-medium">Not specified</span></p>
            <p><span class="text-gray-500">Qty:</span> <span id="inv-summary-qty" class="text-green-800">0</span></p>
            <p><span class="text-gray-500">Unit:</span> <span id="inv-summary-unit" class="text-purple-700">--</span></p>
            <p><span class="text-gray-500">MRP:</span> <span id="inv-summary-mrp" class="text-orange-700">₹0.00</span></p>
            <p><span class="text-gray-500">Rate:</span> <span id="inv-summary-rate" class="text-orange-700">₹0.00</span></p>
            <p><span class="text-gray-500">Notes:</span> <span id="inv-summary-notes" class="text-gray-900">--</span></p>
            <hr />
            <p><span class="text-gray-700 font-medium">Amount:</span> <span id="inv-summary-amount" class="text-black font-bold">₹0.00</span></p>
          </div>
        </div>
      </div>

      <!-- Minimal Excel-like Inventory Table Section -->
      <div class="bg-white rounded shadow p-4">
        <div class="flex items-center mb-2 gap-2">
          <h3 class="text-lg font-semibold text-gray-700">Inventory Products</h3>
          <input id="search-inv" type="text" placeholder="Search products..." class="ml-auto p-2 border rounded text-sm w-48" />
        </div>
        <div class="overflow-x-auto">
          <table id="inventory-table" class="min-w-full border border-gray-200 text-center">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-2 py-2 border">Product</th>
                <th class="px-2 py-2 border">Qty</th>
                <th class="px-2 py-2 border">Unit</th>
                <th class="px-2 py-2 border">MRP</th>
                <th class="px-2 py-2 border">Rate</th>
                <th class="px-2 py-2 border">Amount</th>
                <th class="px-2 py-2 border">Notes</th>
                <th class="px-2 py-2 border">Edit</th>
                <th class="px-2 py-2 border">Delete</th>
              </tr>
            </thead>
            <tbody id="inventory-list">
              <tr><td colspan="9" class="py-4 text-gray-400">No inventory products recorded yet. Add your first product above!</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <style>
      .error.hidden, .success.hidden { display: none; }
      .success { background: #d1fae5; color: #065f46; padding: 0.7em 1em; border-radius: 6px; margin-bottom: 1em; }
      th, td { text-align: center; }
      .edit-btn, .delete-btn { background: none; border: none; cursor: pointer; font-size: 1.1em; }
      .edit-btn { color: #2563eb; }
      .delete-btn { color: #dc2626; }
      .edit-btn:focus, .delete-btn:focus { outline: 2px solid #2563eb; }
    </style>
  `;

  // Reference to the database (assumed to be set up elsewhere)
  const db = window.db;
  let editingId = null;

  // Helper functions to get values from input fields
  function getProduct() { return document.getElementById("inv-product").value.trim(); }
  function getQty() { return parseFloat(document.getElementById("inv-qty").value) || 0; }
  function getUnit() { return document.getElementById("inv-unit").value.trim(); }
  function getMRP() { return parseFloat(document.getElementById("inv-mrp").value) || 0; }
  function getRate() { return parseFloat(document.getElementById("inv-rate").value) || 0; }
  function getNotes() { return document.getElementById("inv-notes").value.trim(); }

  // Validate form fields and show inline errors
  function validateForm() {
    let valid = true;
    if (!getProduct()) { showError("product", "Product name is required."); valid = false; } else { hideError("product"); }
    if (!getQty() || getQty() < 1) { showError("qty", "Quantity must be at least 1."); valid = false; } else { hideError("qty"); }
    if (!getUnit()) { showError("unit", "Unit is required."); valid = false; } else { hideError("unit"); }
    if (getMRP() < 0) { showError("mrp", "MRP cannot be negative."); valid = false; } else { hideError("mrp"); }
    if (getRate() < 0) { showError("rate", "Rate cannot be negative."); valid = false; } else { hideError("rate"); }
    return valid;
  }
  function showError(field, msg) {
    const el = document.getElementById("error-" + field);
    el.textContent = msg;
    el.classList.remove("hidden");
  }
  function hideError(field) {
    const el = document.getElementById("error-" + field);
    el.textContent = "";
    el.classList.add("hidden");
  }

  // Update the product summary and amount display
  function updateSummary(product, qty, unit, mrp, rate, notes) {
    const amount = qty * rate;
    document.getElementById("inv-summary-product").innerText = product || "Not specified";
    document.getElementById("inv-summary-qty").innerText = qty || "0";
    document.getElementById("inv-summary-unit").innerText = unit || "--";
    document.getElementById("inv-summary-mrp").innerText = `₹${mrp.toFixed(2)}`;
    document.getElementById("inv-summary-rate").innerText = `₹${rate.toFixed(2)}`;
    document.getElementById("inv-summary-notes").innerText = notes || "--";
    document.getElementById("inv-summary-amount").innerText = `₹${amount.toFixed(2)}`;
    document.getElementById("inv-amount").innerText = `₹${amount.toFixed(2)}`;
  }

  // Update summary in real-time as the user types
  ["inv-product", "inv-qty", "inv-unit", "inv-mrp", "inv-rate", "inv-notes"].forEach(id => {
    document.getElementById(id).addEventListener("input", () =>
      updateSummary(getProduct(), getQty(), getUnit(), getMRP(), getRate(), getNotes())
    );
  });

  // Autofocus: move to next field on Enter, and allow Enter to submit on last field
  ["inv-product", "inv-qty", "inv-unit", "inv-mrp", "inv-rate", "inv-notes"].forEach((id, idx, arr) => {
    document.getElementById(id).addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (idx < arr.length - 1) {
          document.getElementById(arr[idx + 1]).focus();
        } else {
          document.getElementById("add-inv-btn").focus();
        }
      }
    });
  });

  // Handle Add Product (submit form)
  document.getElementById("inv-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (editingId) return; // Prevent add while editing
    const product = getProduct();
    const qty = getQty();
    const unit = getUnit();
    const mrp = getMRP();
    const rate = getRate();
    const notes = getNotes();
    const amount = qty * rate;
    await db.collection("inventory").add({ product, qty, unit, mrp, rate, notes, amount });
    showSuccess(`${product} added to inventory!`);
    document.getElementById("inv-form").reset();
    updateSummary("", 0, "", 0, 0, "");
    renderInventory();
    document.getElementById("inv-product").focus();
  });

  // Handle Update Product (edit mode)
  document.getElementById("update-inv-btn").addEventListener("click", async () => {
    if (!editingId) return;
    if (!validateForm()) return;
    const product = getProduct();
    const qty = getQty();
    const unit = getUnit();
    const mrp = getMRP();
    const rate = getRate();
    const notes = getNotes();
    const amount = qty * rate;
    await db.collection("inventory").doc(editingId).update({ product, qty, unit, mrp, rate, notes, amount });
    showSuccess(`${product} updated!`);
    editingId = null;
    document.getElementById("add-inv-btn").classList.remove("hidden");
    document.getElementById("update-inv-btn").classList.add("hidden");
    document.getElementById("cancel-edit-btn").classList.add("hidden");
    document.getElementById("inv-form").reset();
    updateSummary("", 0, "", 0, 0, "");
    renderInventory();
    document.getElementById("inv-product").focus();
  });

  // Handle Cancel Edit
  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    editingId = null;
    document.getElementById("add-inv-btn").classList.remove("hidden");
    document.getElementById("update-inv-btn").classList.add("hidden");
    document.getElementById("cancel-edit-btn").classList.add("hidden");
    document.getElementById("inv-form").reset();
    updateSummary("", 0, "", 0, 0, "");
    document.getElementById("inv-product").focus();
  });

  // Show a temporary success message
  function showSuccess(msg) {
    const el = document.getElementById("success-msg");
    el.textContent = msg;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 2000);
  }

  // Search/filter inventory
  document.getElementById("search-inv").addEventListener("input", () => renderInventory());

  // Render the inventory table and update stats (with edit/delete buttons)
  async function renderInventory() {
    const search = document.getElementById("search-inv").value.trim().toLowerCase();
    const snapshot = await db.collection("inventory").orderBy("product", "asc").get();
    let totalItems = 0;
    let totalValue = 0;
    let lowStock = 0;
    let html = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      // Filter by search
      if (search && !d.product.toLowerCase().includes(search)) return;
      totalItems++;
      const qty = d.qty ?? 0;
      const rate = d.rate ?? 0;
      const amount = d.amount ?? (qty * rate);
      totalValue += amount;
      if (qty < 5) lowStock++;
      html += `
        <tr${qty < 5 ? ' style="background:#fff1f2;"' : ''}>
          <td class="border px-2 py-1">${d.product}</td>
          <td class="border px-2 py-1">${qty}</td>
          <td class="border px-2 py-1">${d.unit}</td>
          <td class="border px-2 py-1">₹${(d.mrp ?? 0).toFixed(2)}</td>
          <td class="border px-2 py-1">₹${(d.rate ?? 0).toFixed(2)}</td>
          <td class="border px-2 py-1">₹${amount.toFixed(2)}</td>
          <td class="border px-2 py-1">${d.notes || ""}</td>
          <td class="border px-2 py-1">
            <button class="edit-btn" title="Edit" data-id="${doc.id}">✏️</button>
          </td>
          <td class="border px-2 py-1">
            <button class="delete-btn" title="Delete" data-id="${doc.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    document.getElementById("inventory-list").innerHTML = html || `<tr><td colspan="9" class="py-4 text-gray-400">No inventory products recorded yet. Add your first product above!</td></tr>`;
    document.getElementById("inv-total-items").innerText = totalItems;
    document.getElementById("inv-value").innerText = `₹${totalValue.toFixed(2)}`;
    document.getElementById("inv-low-stock").innerText = lowStock;

    // Attach edit event listeners
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        const docSnap = await db.collection("inventory").doc(id).get();
        const d = docSnap.data();
        // Fill form with item data for editing
        document.getElementById("inv-product").value = d.product;
        document.getElementById("inv-qty").value = d.qty;
        document.getElementById("inv-unit").value = d.unit;
        document.getElementById("inv-mrp").value = d.mrp;
        document.getElementById("inv-rate").value = d.rate;
        document.getElementById("inv-notes").value = d.notes || "";
        updateSummary(d.product, d.qty, d.unit, d.mrp, d.rate, d.notes);
        editingId = id;
        // Show update/cancel buttons, hide add button
        document.getElementById("add-inv-btn").classList.add("hidden");
        document.getElementById("update-inv-btn").classList.remove("hidden");
        document.getElementById("cancel-edit-btn").classList.remove("hidden");
        document.getElementById("inv-product").focus();
      };
    });

    // Attach delete event listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Delete this product?")) {
          await db.collection("inventory").doc(id).delete();
          showSuccess("Product deleted!");
          renderInventory();
        }
      };
    });
  }

  // Initial render of the inventory table and stats
  renderInventory();
});
