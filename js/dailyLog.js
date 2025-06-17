// js/dailyLog.js

document.addEventListener("DOMContentLoaded", () => {
  const dailyLogSection = document.getElementById("dailyLog");
  dailyLogSection.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-2 text-text flex items-center">
        <span class="mr-2">📒</span> Daily Logs
      </h2>
      <p class="text-sm text-gray-500 mb-6">Track your daily sales and expenses</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form id="daily-log-form" class="space-y-4">
            <input type="date" id="log-date" class="w-full p-2 border rounded" required />
            <input type="text" id="client" placeholder="Client/Order Name" class="w-full p-2 border rounded" />
            <input type="text" id="item" placeholder="Item (e.g., Brownies)" class="w-full p-2 border rounded" required />
            <input type="number" id="qtySold" placeholder="Quantity Sold" class="w-full p-2 border rounded" required />
            <input type="number" id="log-revenue" placeholder="Revenue (₹)" class="w-full p-2 border rounded" required />
            <input type="number" id="ingredientsCost" placeholder="Cost of Ingredients (₹)" class="w-full p-2 border rounded" required />
            <input type="number" id="packaging" placeholder="Packaging Cost (₹)" class="w-full p-2 border rounded" required />
            <input type="number" id="calculatedProfit" placeholder="Calculated Profit" class="w-full p-2 border rounded bg-green-100" readonly />
            <textarea id="notes" placeholder="Notes (Optional)" class="w-full p-2 border rounded"></textarea>
            <button type="submit" class="bg-black text-white px-4 py-2 rounded w-full">+ Add Entry</button>
          </form>
        </div>
        <div>
          <input type="date" id="summary-date" class="w-full p-2 border rounded mb-4" />
          <div class="bg-blue-100 p-4 mb-2 rounded shadow flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-blue-700">Total Revenue</p>
              <p id="summary-revenue" class="text-xl font-bold text-blue-900">₹0.00</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div class="bg-red-100 p-4 mb-2 rounded shadow flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-red-700">Total Cost</p>
              <p id="summary-cost" class="text-xl font-bold text-red-900">₹0.00</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-red-700">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div class="bg-green-100 p-4 mb-2 rounded shadow flex justify-between items-center">
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

      <div class="bg-white rounded shadow p-4 mt-6">
        <h3 class="text-lg font-semibold mb-2">Entries for <span id="log-date-display">[Date]</span></h3>
        <div id="log-entries" class="text-sm text-gray-700 bg-gray-50 p-4 rounded border">No entries found for this date. Add your first entry above!</div>
        <div class="mt-4 text-right">
          <button id="show-latest-entries" class="text-sm text-blue-600 hover:underline">Show latest 10 entries</button>
        </div>
      </div>
    </section>
  `;

  let editingId = null;
  const db = window.db;

  async function loadDailySummary(date) {
    document.getElementById("log-date-display").innerText = date;
    document.getElementById("summary-date").value = date;
    const snapshot = await db.collection("dailyLogs").where("date", "==", date).get();

    let totalRevenue = 0, totalCost = 0, totalProfit = 0, count = 0, entriesHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      totalRevenue += d.revenue || 0;
      totalCost += (d.ingredients || 0) + (d.packaging || 0);
      totalProfit += d.profit || 0;
      count++;

      entriesHTML += `<div class='flex justify-between items-center p-4 mb-2 rounded border'>
        <div>
          <strong>${d.client}</strong> <span class='text-gray-500 ml-2'>${d.item}</span> <span class='ml-2 text-gray-400'>Qty: ${d.qty}</span><br/>
          <span class='text-sm'>Revenue: ₹${d.revenue.toFixed(2)}</span>
          <span class='text-sm ml-4'>Ingredients: ₹${d.ingredients.toFixed(2)}</span>
          <span class='text-sm ml-4'>Packaging: ₹${d.packaging.toFixed(2)}</span>
          <span class='text-sm ml-4 text-green-700 font-semibold'>Profit: ₹${d.profit.toFixed(2)}</span>
        </div>
        <div class='flex space-x-2'>
          <button onclick="editEntry('${doc.id}', ${JSON.stringify(d).replace(/"/g, '&quot;')})" class='text-blue-500 hover:text-blue-700'>✏️</button>
          <button onclick="deleteEntry('${doc.id}', '${date}')" class='text-red-500 hover:text-red-700'>🗑️</button>
        </div>
      </div>`;
    });

    document.getElementById("summary-revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById("summary-cost").innerText = `₹${totalCost.toFixed(2)}`;
    document.getElementById("summary-profit").innerText = `₹${totalProfit.toFixed(2)}`;
    document.getElementById("summary-count").innerText = `${count} entries for ${date}`;
    document.getElementById("log-entries").innerHTML = count > 0 ? entriesHTML : "No entries found for this date.";
  }

  async function loadRecentEntries(limit = 10) {
    const snapshot = await db.collection("dailyLogs").orderBy("date", "desc").limit(limit).get();
    let entriesHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      entriesHTML += `<div class='flex justify-between items-center p-4 mb-2 rounded border'>
        <div>
          <strong>${d.client}</strong> <span class='text-gray-500 ml-2'>${d.item}</span> <span class='ml-2 text-gray-400'>Qty: ${d.qty}</span><br/>
          <span class='text-sm'>Revenue: ₹${d.revenue.toFixed(2)}</span>
          <span class='text-sm ml-4'>Ingredients: ₹${d.ingredients.toFixed(2)}</span>
          <span class='text-sm ml-4'>Packaging: ₹${d.packaging.toFixed(2)}</span>
          <span class='text-sm ml-4 text-green-700 font-semibold'>Profit: ₹${d.profit.toFixed(2)}</span>
        </div>
        <div class='flex space-x-2'>
          <button onclick="editEntry('${doc.id}', ${JSON.stringify(d).replace(/"/g, '&quot;')})" class='text-blue-500 hover:text-blue-700'>✏️</button>
          <button onclick="deleteEntry('${doc.id}', '${d.date}')" class='text-red-500 hover:text-red-700'>🗑️</button>
        </div>
      </div>`;
    });
    document.getElementById("log-date-display").innerText = "Recent Entries";
    document.getElementById("log-entries").innerHTML = entriesHTML || "No entries available.";
  }

  document.getElementById("daily-log-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("log-date").value;
    const client = document.getElementById("client").value;
    const item = document.getElementById("item").value;
    const qty = parseInt(document.getElementById("qtySold").value);
    const revenue = parseFloat(document.getElementById("log-revenue").value);
    const ingredients = parseFloat(document.getElementById("ingredientsCost").value);
    const packaging = parseFloat(document.getElementById("packaging").value);
    const profit = revenue - (ingredients + packaging);
    const notes = document.getElementById("notes").value;

    document.getElementById("calculatedProfit").value = profit.toFixed(2);

    if (editingId) {
      await db.collection("dailyLogs").doc(editingId).update({ date, client, item, qty, revenue, ingredients, packaging, profit, notes });
      editingId = null;
    } else {
      await db.collection("dailyLogs").add({ date, client, item, qty, revenue, ingredients, packaging, profit, notes, createdAt: new Date() });
    }

    document.getElementById("daily-log-form").reset();
    document.getElementById("calculatedProfit").value = "";
    loadDailySummary(date);
  });

  document.getElementById("summary-date").addEventListener("change", (e) => {
    loadDailySummary(e.target.value);
  });

  document.getElementById("show-latest-entries").addEventListener("click", () => {
    loadRecentEntries(10);
  });

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("log-date").value = today;
  document.getElementById("summary-date").value = today;
  loadDailySummary(today);

  window.editEntry = function (id, data) {
    editingId = id;
    document.getElementById("log-date").value = data.date;
    document.getElementById("client").value = data.client;
    document.getElementById("item").value = data.item;
    document.getElementById("qtySold").value = data.qty;
    document.getElementById("log-revenue").value = data.revenue;
    document.getElementById("ingredientsCost").value = data.ingredients;
    document.getElementById("packaging").value = data.packaging;
    document.getElementById("notes").value = data.notes;
    document.getElementById("calculatedProfit").value = data.profit.toFixed(2);
  };

  window.deleteEntry = async function (id, date) {
    await db.collection("dailyLogs").doc(id).delete();
    loadDailySummary(date);
  };
});