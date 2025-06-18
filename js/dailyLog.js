// js/dailyLogs.js

document.addEventListener("DOMContentLoaded", () => {
  const dailyLogSection = document.getElementById("dailyLog");
  dailyLogSection.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-2 text-text flex items-center">
        <span class="mr-2">📒</span> Daily Logs
      </h2>
      <p class="text-sm text-gray-500 mb-6">Track your daily sales and expenses</p>

      <!-- SUMMARY CARDS AT THE TOP -->
      <div>
        <input type="date" id="summary-date" class="w-full p-2 border rounded mb-4" />
        <div class="flex gap-2 mb-6">
          <div class="bg-blue-100 p-4 rounded shadow flex-1 hover:shadow-lg transition flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700">Total Revenue</p>
              <p id="summary-revenue" class="text-xl font-bold text-blue-900">₹0.00</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div class="bg-red-100 p-4 rounded shadow flex-1 hover:shadow-lg transition flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-red-700">Total Cost</p>
              <p id="summary-cost" class="text-xl font-bold text-red-900">₹0.00</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-red-700">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div class="bg-green-100 p-4 rounded shadow flex-1 hover:shadow-lg transition flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700">Total Profit</p>
              <p id="summary-profit" class="text-xl font-bold text-green-900">₹0.00</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-green-900">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
        </div>
      </div>

      <!-- DAILY LOG ENTRY FORM -->
      <div class="mb-8">
        <form id="daily-log-form" class="space-y-4">
          <input type="date" id="log-date" class="w-full p-2 border rounded" required />
          <input type="text" id="client" placeholder="Client/Order Name" class="w-full p-2 border rounded" required />

          <table id="items-table" class="w-full mb-2 border rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left">Item</th>
                <th class="text-left">Qty</th>
                <th class="text-left">Revenue (₹)</th>
                <th class="text-left">Ingredients (₹)</th>
                <th class="text-left">Packaging (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="items-tbody">
              <!-- JS will add at least one row here -->
            </tbody>
          </table>
          <button type="button" id="add-item-row" class="bg-blue-100 text-blue-700 px-2 py-1 rounded mb-2">+ Add Item</button>

          <input type="number" id="calculatedProfit" placeholder="Calculated Profit" class="w-full p-2 border rounded bg-green-100" readonly />

          <div>
            <a href="#" id="toggle-notes" class="text-blue-600 text-sm hover:underline">Show Notes</a>
            <textarea id="notes" placeholder="Notes (Optional)" class="w-full p-2 border rounded mt-2 hidden"></textarea>
          </div>

          <button type="submit" class="bg-black text-white px-4 py-2 rounded w-full">+ Add Entry</button>
        </form>
      </div>

      <!-- ENTRIES LIST -->
      <div class="bg-white rounded shadow p-4">
        <h3 class="text-lg font-semibold mb-2">Entries for <span id="log-date-display">[Date]</span></h3>
        <div id="log-entries" class="text-sm text-gray-700 bg-gray-50 p-4 rounded border">No entries found for this date. Add your first entry above!</div>
        <div class="mt-4 text-right">
          <button id="show-latest-entries" class="text-sm text-blue-600 hover:underline">Show latest 10 entries</button>
          <button id="hide-entries" class="text-sm text-gray-600 hover:underline hidden">Hide entries</button>
        </div>
      </div>
    </section>
  `;

  let editingId = null;
  let showingLatest = false;
  let lastSelectedDate = null;
  const db = window.db;

  function addItemRow(item = {}) {
    const tbody = document.getElementById('items-tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="item-name p-1 border rounded w-full text-left" style="text-align:left" value="${item.name || ''}" required></td>
      <td><input type="number" class="item-qty p-1 border rounded w-full text-left" style="text-align:left" value="${item.qty || ''}" required></td>
      <td><input type="number" class="item-revenue p-1 border rounded w-full text-left" style="text-align:left" value="${item.revenue || ''}" required></td>
      <td><input type="number" class="item-ingredients p-1 border rounded w-full text-left" style="text-align:left" value="${item.ingredients || ''}" required></td>
      <td><input type="number" class="item-packaging p-1 border rounded w-full text-left" style="text-align:left" value="${item.packaging || ''}" required></td>
      <td><button type="button" class="remove-item text-red-500">🗑️</button></td>
    `;
    tbody.appendChild(tr);
    updateProfit();
  }

  function ensureAtLeastOneItemRow() {
    const tbody = document.getElementById('items-tbody');
    if (tbody.children.length === 0) {
      addItemRow();
    }
  }

  document.getElementById('add-item-row').addEventListener('click', () => addItemRow());

  document.getElementById('items-tbody').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item')) {
      e.target.closest('tr').remove();
      ensureAtLeastOneItemRow();
      updateProfit();
    }
  });

  document.getElementById('items-tbody').addEventListener('input', function(e) {
    if (
      e.target.classList.contains('item-name') ||
      e.target.classList.contains('item-qty') ||
      e.target.classList.contains('item-revenue') ||
      e.target.classList.contains('item-ingredients') ||
      e.target.classList.contains('item-packaging')
    ) {
      updateProfit();
    }
  });

  function updateProfit() {
    const items = Array.from(document.querySelectorAll("#items-tbody tr")).map(row => {
      return {
        name: row.querySelector(".item-name").value,
        qty: parseInt(row.querySelector(".item-qty").value) || 0,
        revenue: parseFloat(row.querySelector(".item-revenue").value) || 0,
        ingredients: parseFloat(row.querySelector(".item-ingredients").value) || 0,
        packaging: parseFloat(row.querySelector(".item-packaging").value) || 0,
      };
    });
    let totalRevenue = 0, totalCost = 0;
    items.forEach(item => {
      totalRevenue += item.revenue;
      totalCost += item.ingredients + item.packaging;
    });
    const profit = totalRevenue - totalCost;
    const profitInput = document.getElementById("calculatedProfit");
    profitInput.value = profit ? profit.toFixed(2) : "";
    profitInput.placeholder = "Calculated Profit";
  }

  document.getElementById("toggle-notes").addEventListener("click", function(e) {
    e.preventDefault();
    const notes = document.getElementById("notes");
    notes.classList.toggle("hidden");
    this.innerText = notes.classList.contains("hidden") ? "Show Notes" : "Hide Notes";
  });

  function renderEntriesTable(entries) {
    if (!entries.length) {
      return "No entries found for this date. Add your first entry above!";
    }
    let html = `
      <table class="w-full text-sm border rounded">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-1">Client</th>
            <th class="border p-1">Date</th>
            <th class="border p-1">Item</th>
            <th class="border p-1">Qty</th>
            <th class="border p-1">Revenue (₹)</th>
            <th class="border p-1">Ingredients (₹)</th>
            <th class="border p-1">Packaging (₹)</th>
            <th class="border p-1">Profit (₹)</th>
            <th class="border p-1">Notes</th>
            <th class="border p-1"></th>
          </tr>
        </thead>
        <tbody>
    `;
    entries.forEach(({ docId, d }) => {
      (d.items || []).forEach(item => {
        html += `
          <tr>
            <td class="border p-1">${d.client || ""}</td>
            <td class="border p-1">${d.date || ""}</td>
            <td class="border p-1">${item.name || ""}</td>
            <td class="border p-1">${item.qty || ""}</td>
            <td class="border p-1">₹${item.revenue?.toFixed(2) ?? ""}</td>
            <td class="border p-1">₹${item.ingredients?.toFixed(2) ?? ""}</td>
            <td class="border p-1">₹${item.packaging?.toFixed(2) ?? ""}</td>
            <td class="border p-1 text-green-700 font-semibold">₹${((item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0))).toFixed(2)}</td>
            <td class="border p-1">${d.notes || ""}</td>
            <td class="border p-1">
              <button onclick="editEntry('${docId}', ${JSON.stringify(d).replace(/"/g, '&quot;')})" class="text-blue-500 hover:text-blue-700" title="Edit">✏️</button>
              <button onclick="deleteEntry('${docId}', '${d.date}')" class="text-red-500 hover:text-red-700" title="Delete">🗑️</button>
            </td>
          </tr>
        `;
      });
    });
    html += `</tbody></table>`;
    return html;
  }

  async function loadDailySummary(date) {
    lastSelectedDate = date;
    showingLatest = false;
    document.getElementById("log-date-display").innerText = date;
    document.getElementById("summary-date").value = date;
    document.getElementById("hide-entries").classList.add("hidden");
    document.getElementById("show-latest-entries").classList.remove("hidden");
    document.getElementById("log-entries").style.display = "";

    const snapshot = await db.collection("dailyLogs").where("date", "==", date).get();

    let totalRevenue = 0, totalCost = 0, totalProfit = 0;
    const entries = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.items && Array.isArray(d.items)) {
        d.items.forEach(item => {
          totalRevenue += item.revenue || 0;
          totalCost += (item.ingredients || 0) + (item.packaging || 0);
          totalProfit += (item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0));
        });
      }
      entries.push({ docId: doc.id, d });
    });

    document.getElementById("summary-revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("summary-cost").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("summary-profit").innerText = `₹${totalProfit.toFixed(2)}`;
    document.getElementById("log-entries").innerHTML = renderEntriesTable(entries);
  }

  async function loadRecentEntries(limit = 10) {
    showingLatest = true;
    document.getElementById("log-date-display").innerText = "Recent Entries";
    document.getElementById("hide-entries").classList.remove("hidden");
    document.getElementById("show-latest-entries").classList.add("hidden");
    document.getElementById("log-entries").style.display = "";

    const snapshot = await db.collection("dailyLogs").orderBy("date", "desc").limit(limit).get();
    const entries = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      entries.push({ docId: doc.id, d });
    });
    document.getElementById("log-entries").innerHTML = renderEntriesTable(entries);
  }

  document.getElementById("hide-entries").addEventListener("click", () => {
    document.getElementById("log-entries").style.display = "none";
    document.getElementById("hide-entries").classList.add("hidden");
    document.getElementById("show-latest-entries").classList.remove("hidden");
  });

  document.getElementById("daily-log-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("log-date").value;
    const client = document.getElementById("client").value;
    const notes = document.getElementById("notes").value;

    const items = Array.from(document.querySelectorAll("#items-tbody tr")).map(row => {
      return {
        name: row.querySelector(".item-name").value,
        qty: parseInt(row.querySelector(".item-qty").value) || 0,
        revenue: parseFloat(row.querySelector(".item-revenue").value) || 0,
        ingredients: parseFloat(row.querySelector(".item-ingredients").value) || 0,
        packaging: parseFloat(row.querySelector(".item-packaging").value) || 0,
      };
    });

    let totalRevenue = 0, totalCost = 0;
    items.forEach(item => {
      totalRevenue += item.revenue;
      totalCost += item.ingredients + item.packaging;
    });
    const profit = totalRevenue - totalCost;

    if (editingId) {
      await db.collection("dailyLogs").doc(editingId).update({
        date, client, items, totalRevenue, totalCost, profit, notes
      });
      editingId = null;
    } else {
      await db.collection("dailyLogs").add({
        date, client, items, totalRevenue, totalCost, profit, notes, createdAt: new Date()
      });
    }

    document.getElementById("daily-log-form").reset();
    document.getElementById("items-tbody").innerHTML = "";
    document.getElementById("calculatedProfit").value = "";
    addItemRow(); // Always add one row after reset
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("log-date").value = today;
    document.getElementById("summary-date").value = today;
    loadDailySummary(today);
  });

  document.getElementById("summary-date").addEventListener("change", (e) => {
    loadDailySummary(e.target.value);
  });

  document.getElementById("show-latest-entries").addEventListener("click", () => {
    document.getElementById("log-entries").style.display = "";
    loadRecentEntries(10);
  });

  // Set today's date as default for both date pickers and load today's entries
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("log-date").value = today;
  document.getElementById("summary-date").value = today;
  addItemRow(); // Always show one item row on load
  loadDailySummary(today);

  window.editEntry = function (id, data) {
    editingId = id;
    document.getElementById("log-date").value = data.date;
    document.getElementById("client").value = data.client;
    document.getElementById("notes").value = data.notes || "";
    document.getElementById("items-tbody").innerHTML = "";
    (data.items || []).forEach(item => addItemRow(item));
    ensureAtLeastOneItemRow();
    document.getElementById("calculatedProfit").value = data.profit.toFixed(2);
    updateProfit();
  };

  window.deleteEntry = async function (id, date) {
    await db.collection("dailyLogs").doc(id).delete();
    if (showingLatest) {
      loadRecentEntries(10);
    } else {
      loadDailySummary(date);
    }
  };
});
