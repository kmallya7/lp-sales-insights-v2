// js/dailyLogs.js

/**
 * Daily Logs Manager Script (Month & Date Picker + Client Search)
 * 
 * - By default, shows both the current month and current date entries.
 * - Entries can be filtered by month (using a month picker), by date (using a date picker), and by client name.
 * - The "Entries for" header updates based on the filter.
 * - The client search box filters by client name within the selected month or date.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Helper: Format date as "30-Jun-2025" ---
  function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${parseInt(day, 10)}-${months[parseInt(month, 10) - 1]}-${year}`;
  }

  // --- 1. Render the Daily Logs UI Section ---
  const dailyLogSection = document.getElementById("dailyLog");
  dailyLogSection.innerHTML = `
    <!-- Summary Cards Layer -->
    <section class="max-w-5xl mx-auto mt-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 bg-blue-100 p-4 rounded shadow flex flex-col items-center">
          <span class="text-sm text-blue-700 font-medium">Revenue</span>
          <span id="summary-revenue" class="text-xl font-bold text-blue-900 mt-1">₹0.00</span>
        </div>
        <div class="flex-1 bg-red-100 p-4 rounded shadow flex flex-col items-center">
          <span class="text-sm text-red-700 font-medium">Cost</span>
          <span id="summary-cost" class="text-xl font-bold text-red-900 mt-1">₹0.00</span>
        </div>
        <div class="flex-1 bg-green-100 p-4 rounded shadow flex flex-col items-center">
          <span class="text-sm text-green-700 font-medium">Profit</span>
          <span id="summary-profit" class="text-xl font-bold text-green-900 mt-1">₹0.00</span>
        </div>
      </div>
    </section>
    <!-- Main Section: Header + Entry Form -->
    <section class="max-w-5xl mx-auto p-4">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📒</span>
        <h2 class="text-lg font-bold text-gray-800">Daily Logs</h2>
      </div>
      <p class="text-sm text-gray-500 mb-4">Track your daily sales and expenses</p>
      <!-- Entry Form fills the space below -->
      <div class="flex flex-col md:flex-row gap-8">
        <div class="flex-1 bg-white rounded-lg shadow p-4 space-y-5">
          <form id="daily-log-form" class="space-y-4">
            <!-- Date & Client (centered, one line) -->
            <div class="flex flex-row gap-3 justify-center items-center w-full mb-2">
              <input type="date" id="log-date" class="flex-1 p-2 border rounded text-sm text-center" required />
              <input type="text" id="client" placeholder="Client/Order Name" class="flex-1 p-2 border rounded text-sm text-center" required />
            </div>
            <!-- Items Table -->
            <div>
              <div class="font-semibold text-gray-700 mb-2 text-base">Items</div>
              <div class="overflow-x-auto">
                <table id="items-table" class="w-full text-sm border rounded mb-0">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="p-2">Item</th>
                      <th class="p-2">Qty</th>
                      <th class="p-2">Revenue</th>
                      <th class="p-2">Ingredients</th>
                      <th class="p-2">Packaging</th>
                      <th class="p-2"></th>
                    </tr>
                  </thead>
                  <tbody id="items-tbody"></tbody>
                </table>
              </div>
              <div class="flex mt-2">
                <button type="button" id="add-item-row" class="ml-auto px-3 py-1 bg-blue-600 text-white rounded font-medium text-sm shadow hover:bg-blue-700 transition w-full sm:w-auto">
                  + Add Item
                </button>
              </div>
            </div>
            <!-- Calculated Profit -->
            <div>
              <label for="calculatedProfit" class="block text-sm text-gray-600 mb-1 font-medium">Calculated Profit</label>
              <input type="number" id="calculatedProfit" class="w-full p-2 border rounded bg-green-50 text-green-800 font-semibold text-base" readonly />
            </div>
            <!-- Notes -->
            <div>
              <a href="#" id="toggle-notes" class="text-blue-600 text-sm hover:underline font-medium">Show Notes</a>
              <textarea id="notes" placeholder="Notes (Optional)" class="w-full p-2 border rounded mt-2 hidden text-sm"></textarea>
            </div>
            <!-- Submit -->
            <button type="submit" class="w-full bg-black text-white py-2 rounded text-base font-bold flex items-center justify-center gap-2 shadow hover:bg-gray-900 transition">
              <span>+</span> Add Entry
            </button>
          </form>
        </div>
      </div>
    </section>
    <!-- Entries Table Layer -->
    <section id="entries-layer" class="max-w-5xl mx-auto mt-8">
      <div class="bg-white rounded shadow p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="text-base font-bold">Entries for <span id="log-date-display">[Filter]</span></h3>
            <label for="summary-month" class="text-sm text-gray-600 ml-2 font-medium">View Month:</label>
            <input type="month" id="summary-month" class="p-2 border rounded text-sm" />
            <label for="summary-date" class="text-sm text-gray-600 ml-2 font-medium">or Date:</label>
            <input type="date" id="summary-date" class="p-2 border rounded text-sm" />
          </div>
          <div class="flex gap-2">
            <input type="text" id="client-search" placeholder="Search by client name..." class="p-2 border rounded text-sm" style="min-width:180px;" />
          </div>
        </div>
        <div id="log-entries" class="text-sm text-gray-700 bg-gray-50 p-2 rounded border overflow-x-auto">No entries found. Add your first entry above!</div>
      </div>
    </section>
  `;

  // --- 2. State Variables ---
  let editingId = null;
  let lastSelectedMonth = null;
  let lastSelectedDate = null;
  let allMonthEntries = [];
  let allDateEntries = [];
  let currentFilter = "month"; // or "date"
  const db = window.db;

  // --- 3. Helper: Add a new item row to the items table ---
  function addItemRow(item = {}) {
    const tbody = document.getElementById('items-tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="item-name p-1 border rounded w-full text-sm" value="${item.name || ''}" required></td>
      <td><input type="number" class="item-qty p-1 border rounded w-full text-sm" value="${item.qty || ''}" min="1" required /></td>
      <td><input type="number" class="item-revenue p-1 border rounded w-full text-sm" value="${item.revenue || ''}" min="0" step="0.01" required /></td>
      <td><input type="number" class="item-ingredients p-1 border rounded w-full text-sm" value="${item.ingredients || ''}" min="0" step="0.01" required /></td>
      <td><input type="number" class="item-packaging p-1 border rounded w-full text-sm" value="${item.packaging || ''}" min="0" step="0.01" required /></td>
      <td><button type="button" class="remove-item text-red-500 text-lg" title="Remove Item">🗑️</button></td>
    `;
    tbody.appendChild(tr);
    updateProfit();
  }

  // --- 4. Helper: Ensure at least one item row exists ---
  function ensureAtLeastOneItemRow() {
    const tbody = document.getElementById('items-tbody');
    if (tbody.children.length === 0) addItemRow();
  }

  // --- 5. Event: Add item row button ---
  document.getElementById('add-item-row').addEventListener('click', () => addItemRow());

  // --- 6. Event: Remove item row button (delegated) ---
  document.getElementById('items-tbody').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item')) {
      e.target.closest('tr').remove();
      ensureAtLeastOneItemRow();
      updateProfit();
    }
  });

  // --- 7. Event: Update profit on any item input change (delegated) ---
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

  // --- 8. Helper: Calculate and update profit field in the form ---
  function updateProfit() {
    const items = Array.from(document.querySelectorAll("#items-tbody tr")).map(row => ({
      name: row.querySelector(".item-name").value,
      qty: parseInt(row.querySelector(".item-qty").value) || 0,
      revenue: parseFloat(row.querySelector(".item-revenue").value) || 0,
      ingredients: parseFloat(row.querySelector(".item-ingredients").value) || 0,
      packaging: parseFloat(row.querySelector(".item-packaging").value) || 0,
    }));
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

  // --- 9. Event: Toggle notes textarea visibility ---
  document.getElementById("toggle-notes").addEventListener("click", function(e) {
    e.preventDefault();
    const notes = document.getElementById("notes");
    notes.classList.toggle("hidden");
    this.innerText = notes.classList.contains("hidden") ? "Show Notes" : "Hide Notes";
  });

  // --- 10. Helper: Render entries as a table (for entries list) ---
  function renderEntriesTable(entries, emptyMsg) {
    if (!entries.length) {
      return emptyMsg || "No entries found. Add your first entry above!";
    }
    let html = `
      <div class="overflow-x-auto">
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
            <td class="border p-1">${formatDisplayDate(d.date) || ""}</td>
            <td class="border p-1">${item.name || ""}</td>
            <td class="border p-1">${item.qty || ""}</td>
            <td class="border p-1">₹${item.revenue?.toFixed(2) ?? ""}</td>
            <td class="border p-1">₹${item.ingredients?.toFixed(2) ?? ""}</td>
            <td class="border p-1">₹${item.packaging?.toFixed(2) ?? ""}</td>
            <td class="border p-1 text-green-700 font-semibold">₹${((item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0))).toFixed(2)}</td>
            <td class="border p-1">${d.notes || ""}</td>
            <td class="border p-1 flex gap-1">
              <button onclick="editEntry('${docId}', ${JSON.stringify(d).replace(/"/g, '&quot;')})" class="text-blue-500 hover:text-blue-700 text-base" title="Edit">✏️</button>
              <button onclick="deleteEntry('${docId}', '${d.date}')" class="text-red-500 hover:text-red-700 text-base" title="Delete">🗑️</button>
            </td>
          </tr>
        `;
      });
    });
    html += `</tbody></table></div>`;
    return html;
  }

  // --- 11. Load and display summary and entries for a given month ---
  async function loadMonthlySummary(monthStr) {
    lastSelectedMonth = monthStr;
    lastSelectedDate = null;
    currentFilter = "month";
    const [year, month] = monthStr.split("-");
    document.getElementById("log-date-display").innerText = `${month ? new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' }) : ""} ${year}`;
    document.getElementById("summary-month").value = monthStr;
    document.getElementById("summary-date").value = "";

    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, parseInt(month, 10), 0);
    const endDateStr = `${year}-${month}-${String(endDate.getDate()).padStart(2, "0")}`;

    const snapshot = await db.collection("dailyLogs")
      .where("date", ">=", startDate)
      .where("date", "<=", endDateStr)
      .get();

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

    allMonthEntries = entries;
    document.getElementById("summary-revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("summary-cost").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("summary-profit").innerText = `₹${totalProfit.toFixed(2)}`;
    document.getElementById("log-entries").innerHTML = renderEntriesTable(entries, "No entries found for this month. Add your first entry above!");
    filterEntriesByClient();
  }

  // --- 12. Load and display summary and entries for a given date ---
  async function loadDailySummary(date) {
    lastSelectedDate = date;
    lastSelectedMonth = null;
    currentFilter = "date";
    document.getElementById("log-date-display").innerText = formatDisplayDate(date);
    document.getElementById("summary-date").value = date;
    document.getElementById("summary-month").value = date.slice(0, 7);

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

    allDateEntries = entries;
    document.getElementById("summary-revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("summary-cost").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("summary-profit").innerText = `₹${totalProfit.toFixed(2)}`;
    document.getElementById("log-entries").innerHTML = renderEntriesTable(entries, "No entries found for this date. Add your first entry above!");
    filterEntriesByClient();
  }

  // --- 13. Filter entries by client name in the current view ---
  function filterEntriesByClient() {
    const search = (document.getElementById("client-search")?.value || "").trim().toLowerCase();
    const table = document.querySelector("#log-entries table");
    if (!table) return;
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
      const clientCell = row.querySelector("td");
      if (!clientCell) return;
      const client = clientCell.textContent.trim().toLowerCase();
      row.style.display = client.includes(search) ? "" : "none";
    });
  }
  document.getElementById("client-search").addEventListener("input", filterEntriesByClient);

  // --- 14. Event: Change summary month picker (loads summary for selected month) ---
  document.getElementById("summary-month").addEventListener("change", (e) => {
    if (e.target.value) {
      loadMonthlySummary(e.target.value);
    }
  });

  // --- 15. Event: Change summary date picker (loads summary for selected date) ---
  document.getElementById("summary-date").addEventListener("change", (e) => {
    if (e.target.value) {
      loadDailySummary(e.target.value);
    }
  });

  // --- 16. Event: Form submit (add or update entry) ---
  document.getElementById("daily-log-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("log-date").value;
    const client = document.getElementById("client").value;
    const notes = document.getElementById("notes").value;

    const items = Array.from(document.querySelectorAll("#items-tbody tr")).map(row => ({
      name: row.querySelector(".item-name").value,
      qty: parseInt(row.querySelector(".item-qty").value) || 0,
      revenue: parseFloat(row.querySelector(".item-revenue").value) || 0,
      ingredients: parseFloat(row.querySelector(".item-ingredients").value) || 0,
      packaging: parseFloat(row.querySelector(".item-packaging").value) || 0,
    }));

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
    addItemRow();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("log-date").value = today;
    // After adding, reload the current filter
    if (currentFilter === "date") {
      loadDailySummary(today);
    } else {
      const monthStr = today.slice(0, 7);
      loadMonthlySummary(monthStr);
    }
  });

  // --- 17. On page load: set today's date and load this month's and today's entries ---
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);
  document.getElementById("log-date").value = today;
  document.getElementById("summary-month").value = thisMonth;
  document.getElementById("summary-date").value = today;
  addItemRow();
  // Show both month and date entries by default
  loadMonthlySummary(thisMonth);
  loadDailySummary(today);

  // --- 18. Expose edit and delete functions globally for table buttons ---
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
    document.getElementById("daily-log-form").scrollIntoView({ behavior: "smooth" });
  };

  window.deleteEntry = async function (id, date) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    await db.collection("dailyLogs").doc(id).delete();
    // After delete, reload the current filter
    if (currentFilter === "date" && date) {
      loadDailySummary(date);
    } else if (currentFilter === "month" && date) {
      loadMonthlySummary(date.slice(0, 7));
    } else {
      loadMonthlySummary(thisMonth);
      loadDailySummary(today);
    }
  };
});
