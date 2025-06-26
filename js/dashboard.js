// js/monthlyDashboard.js

function animateValue(element, start, end, duration = 1000, prefix = "₹") {
  if (start === end) {
    element.innerText = prefix + end.toFixed(2);
    return;
  }
  const range = end - start;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = start + range * progress;
    element.innerText = prefix + value.toFixed(2);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.innerText = prefix + end.toFixed(2);
    }
  }
  requestAnimationFrame(step);
}

window.loadDashboard = async function () {
  const container = document.getElementById("dashboard");
  if (!container) return;

  container.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-4 text-text flex items-center">
        <span class="mr-2">📊</span> Monthly Dashboard
      </h2>
      <p class="text-sm text-gray-500 mb-6">View your monthly financial summary</p>

      <div class="flex flex-wrap items-center gap-4 mb-6">
        <label class="text-sm text-gray-600">Month:
          <select id="filter-month" class="border p-2 rounded">
            ${[...Array(12).keys()].map(m => `<option value="${m+1}">${new Date(0, m).toLocaleString('default', { month: 'long' })}</option>`).join('')}
          </select>
        </label>
        <label class="text-sm text-gray-600">Year:
          <input id="filter-year" type="number" class="border p-2 rounded w-24" value="${new Date().getFullYear()}" />
        </label>
        <button id="prev-month" class="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300" title="Previous Month">◀</button>
        <button id="next-month" class="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300" title="Next Month">▶</button>
        <button id="apply-filters" class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Apply</button>
        <button id="export-csv" class="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">Export CSV</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" id="summary-cards"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded shadow">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-semibold text-gray-600">Revenue Trend</h3>
            <button id="toggle-trend" class="text-xs text-blue-600 hover:underline">Hide</button>
          </div>
          <div class="w-full h-64" id="trendChart-container">
            <canvas id="trendChart" class="w-full h-full" aria-label="Revenue Trend Bar Chart" role="img"></canvas>
          </div>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-semibold text-gray-600">Cost Breakdown</h3>
            <button id="toggle-cost" class="text-xs text-blue-600 hover:underline">Hide</button>
          </div>
          <div class="w-full h-64 flex items-center justify-center" id="costChart-container">
            <canvas id="costChart" class="w-full h-full max-w-[300px]" aria-label="Cost Breakdown Pie Chart" role="img"></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded shadow">
          <h4 class="font-semibold mb-2">Top 3 Best-Selling Items</h4>
          <table class="w-full text-sm border rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-1">Item</th>
                <th class="border p-1">Qty Sold</th>
                <th class="border p-1">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody id="top-sellers-tbody"></tbody>
          </table>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h4 class="font-semibold mb-2">Top Clients</h4>
          <table class="w-full text-sm border rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-1">Client</th>
                <th class="border p-1">Orders</th>
                <th class="border p-1">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody id="top-clients-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded shadow">
          <h4 class="font-semibold mb-2">Top Clients by Revenue</h4>
          <table class="w-full text-sm border rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-1">Client</th>
                <th class="border p-1">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody id="revenue-per-client-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="bg-white p-4 rounded shadow mb-6">
        <h4 class="font-semibold mb-2">Expense Breakdown</h4>
        <table class="w-full text-sm border rounded">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-1">Category</th>
              <th class="border p-1">Amount (₹)</th>
            </tr>
          </thead>
          <tbody id="expense-breakdown-tbody"></tbody>
        </table>
      </div>

      <div class="bg-white p-4 rounded shadow mb-6">
        <h4 class="font-semibold mb-2">Revenue & Profit Over Time</h4>
        <canvas id="lineChart" class="w-full h-64"></canvas>
      </div>

      <div class="bg-white p-4 rounded shadow">
        <h4 class="font-semibold mb-2">Summary Table</h4>
        <table class="w-full text-sm border rounded">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-1">Metric</th>
              <th class="border p-1">Value (₹)</th>
            </tr>
          </thead>
          <tbody id="summary-table-tbody"></tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("filter-month").value = new Date().getMonth() + 1;

  document.getElementById("prev-month").addEventListener("click", () => {
    let m = parseInt(document.getElementById("filter-month").value);
    let y = parseInt(document.getElementById("filter-year").value);
    m--;
    if (m < 1) { m = 12; y--; }
    document.getElementById("filter-month").value = m;
    document.getElementById("filter-year").value = y;
    loadDashboardData(m, y);
  });
  document.getElementById("next-month").addEventListener("click", () => {
    let m = parseInt(document.getElementById("filter-month").value);
    let y = parseInt(document.getElementById("filter-year").value);
    m++;
    if (m > 12) { m = 1; y++; }
    document.getElementById("filter-month").value = m;
    document.getElementById("filter-year").value = y;
    loadDashboardData(m, y);
  });

  document.getElementById("apply-filters").addEventListener("click", () => {
    const m = parseInt(document.getElementById("filter-month").value);
    const y = parseInt(document.getElementById("filter-year").value);
    loadDashboardData(m, y);
  });

  document.getElementById("export-csv").addEventListener("click", () => {
    exportDashboardCSV();
  });

  document.getElementById("toggle-trend").addEventListener("click", function() {
    const el = document.getElementById("trendChart-container");
    if (el.style.display === "none") {
      el.style.display = "";
      this.innerText = "Hide";
    } else {
      el.style.display = "none";
      this.innerText = "Show";
    }
  });
  document.getElementById("toggle-cost").addEventListener("click", function() {
    const el = document.getElementById("costChart-container");
    if (el.style.display === "none") {
      el.style.display = "";
      this.innerText = "Hide";
    } else {
      el.style.display = "none";
      this.innerText = "Show";
    }
  });

  await loadDashboardData(new Date().getMonth() + 1, new Date().getFullYear());
};

async function loadDashboardData(month, year) {
  const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
  const logsSnap = await window.db.collection("dailyLogs")
    .where("date", ">=", `${datePrefix}-01`)
    .where("date", "<=", `${datePrefix}-31`)
    .get();

  let totalRevenue = 0, totalIngredients = 0, totalPackaging = 0;
  let allItems = [], clientMap = {};
  logsSnap.forEach(doc => {
    const d = doc.data();
    if (d.items && Array.isArray(d.items)) {
      d.items.forEach(item => {
        allItems.push({ ...item, date: d.date, client: d.client });
        totalRevenue += item.revenue || 0;
        totalIngredients += item.ingredients || 0;
        totalPackaging += item.packaging || 0;
      });
    }
    if (d.client) {
      if (!clientMap[d.client]) clientMap[d.client] = { orders: 0, revenue: 0 };
      clientMap[d.client].orders += 1;
      if (d.items && Array.isArray(d.items)) {
        d.items.forEach(item => {
          clientMap[d.client].revenue += item.revenue || 0;
        });
      }
    }
  });

  // --- New Metrics ---
  const orderCount = logsSnap.size;
  const avgOrderValue = orderCount ? totalRevenue / orderCount : 0;
  const repeatCustomers = Object.values(clientMap).filter(c => c.orders > 1).length;
  const revenuePerClient = Object.entries(clientMap)
    .map(([name, stats]) => ({ name, revenue: stats.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Product performance
  const itemMap = {};
  allItems.forEach(item => {
    if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0, profit: 0, category: item.category || "Uncategorized" };
    itemMap[item.name].qty += item.qty || 0;
    itemMap[item.name].revenue += item.revenue || 0;
    itemMap[item.name].profit += (item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0));
  });
  const itemsArr = Object.entries(itemMap).map(([name, stats]) => ({ name, ...stats }));
  const bestSelling = itemsArr.sort((a, b) => b.qty - a.qty)[0];
  const worstSelling = itemsArr.sort((a, b) => a.qty - b.qty)[0];
  const mostProfitable = itemsArr.sort((a, b) => b.profit - a.profit)[0];

  // Previous month for % change
  let prevMonth = month - 1, prevYear = year;
  if (prevMonth < 1) { prevMonth = 12; prevYear--; }
  const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  const prevSnap = await window.db.collection("dailyLogs")
    .where("date", ">=", `${prevPrefix}-01`)
    .where("date", "<=", `${prevPrefix}-31`)
    .get();
  let prevRevenue = 0, prevCost = 0, prevProfit = 0;
  prevSnap.forEach(doc => {
    const d = doc.data();
    if (d.items && Array.isArray(d.items)) {
      d.items.forEach(item => {
        prevRevenue += item.revenue || 0;
        prevCost += (item.ingredients || 0) + (item.packaging || 0);
        prevProfit += (item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0));
      });
    }
  });

  const grossProfit = totalRevenue - (totalIngredients + totalPackaging);
  const netProfit = grossProfit;

  function pctChange(current, prev) {
    if (prev === 0) return current === 0 ? "0%" : "▲ 100%";
    const pct = ((current - prev) / Math.abs(prev)) * 100;
    return (pct >= 0 ? "▲ " : "▼ ") + Math.abs(pct).toFixed(1) + "%";
  }

  // --- Summary Cards ---
  document.getElementById("summary-cards").innerHTML = `
    <div class="summary-card bg-blue-100 p-4 rounded flex flex-col items-start justify-between cursor-pointer">
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="text-sm font-medium text-blue-700">Total Revenue</p>
          <p class="text-xl font-bold text-blue-900 flex items-center">
            <span id="dash-revenue">${"₹" + totalRevenue.toFixed(2)}</span>
            <span class="ml-2 text-xs ${totalRevenue - prevRevenue >= 0 ? 'text-green-600' : 'text-red-600'}">${pctChange(totalRevenue, prevRevenue)}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="summary-card bg-red-100 p-4 rounded flex flex-col items-start justify-between cursor-pointer">
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="text-sm font-medium text-red-700">Total Cost</p>
          <p class="text-xl font-bold text-red-900 flex items-center">
            <span id="dash-cost">${"₹" + (totalIngredients + totalPackaging).toFixed(2)}</span>
            <span class="ml-2 text-xs ${totalIngredients + totalPackaging - prevCost >= 0 ? 'text-red-600' : 'text-green-600'}">${pctChange(totalIngredients + totalPackaging, prevCost)}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="summary-card bg-green-100 p-4 rounded flex flex-col items-start justify-between cursor-pointer">
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="text-sm font-medium text-green-700">Gross Profit</p>
          <p class="text-xl font-bold text-green-900 flex items-center">
            <span id="dash-gross">${"₹" + grossProfit.toFixed(2)}</span>
            <span class="ml-2 text-xs ${grossProfit - prevProfit >= 0 ? 'text-green-600' : 'text-red-600'}">${pctChange(grossProfit, prevProfit)}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="summary-card bg-purple-100 p-4 rounded flex flex-col items-start justify-between cursor-pointer">
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="text-sm font-medium text-purple-700">Net Profit</p>
          <p class="text-xl font-bold text-purple-900 flex items-center">
            <span id="dash-net">${"₹" + netProfit.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="summary-card bg-yellow-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-yellow-700">Orders</p>
      <p class="text-xl font-bold text-yellow-900">${orderCount}</p>
    </div>
    <div class="summary-card bg-pink-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-pink-700">Avg Order Value</p>
      <p class="text-xl font-bold text-pink-900">₹${avgOrderValue.toFixed(2)}</p>
    </div>
    <div class="summary-card bg-green-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-green-700">Repeat Customers</p>
      <p class="text-xl font-bold text-green-900">${repeatCustomers}</p>
    </div>
    <div class="summary-card bg-blue-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-blue-700">Best Seller</p>
      <p class="text-base font-bold text-blue-900">${bestSelling ? bestSelling.name : "N/A"}</p>
      <p class="text-xs text-blue-700">Qty: ${bestSelling ? bestSelling.qty : 0}</p>
    </div>
    <div class="summary-card bg-gray-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-gray-700">Worst Seller</p>
      <p class="text-base font-bold text-gray-900">${worstSelling ? worstSelling.name : "N/A"}</p>
      <p class="text-xs text-gray-700">Qty: ${worstSelling ? worstSelling.qty : 0}</p>
    </div>
    <div class="summary-card bg-orange-100 p-4 rounded flex flex-col items-start justify-between">
      <p class="text-sm font-medium text-orange-700">Most Profitable</p>
      <p class="text-base font-bold text-orange-900">${mostProfitable ? mostProfitable.name : "N/A"}</p>
      <p class="text-xs text-orange-700">Profit: ₹${mostProfitable ? mostProfitable.profit.toFixed(2) : 0}</p>
    </div>
  `;

  // Animate on hover
  document.querySelectorAll('.summary-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (card.querySelector('#dash-revenue')) {
        animateValue(card.querySelector('#dash-revenue'), 0, totalRevenue);
      }
      if (card.querySelector('#dash-cost')) {
        animateValue(card.querySelector('#dash-cost'), 0, totalIngredients + totalPackaging);
      }
      if (card.querySelector('#dash-gross')) {
        animateValue(card.querySelector('#dash-gross'), 0, grossProfit);
      }
      if (card.querySelector('#dash-net')) {
        animateValue(card.querySelector('#dash-net'), 0, netProfit);
      }
    });
  });

  // Top 3 best-selling items
  const topItems = itemsArr.sort((a, b) => b.qty - a.qty).slice(0, 3);
  document.getElementById("top-sellers-tbody").innerHTML = topItems.map(item => `
    <tr>
      <td class="border p-1">${item.name}</td>
      <td class="border p-1">${item.qty}</td>
      <td class="border p-1">₹${item.revenue.toFixed(2)}</td>
    </tr>
  `).join('');

  // Top clients
  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 3);
  document.getElementById("top-clients-tbody").innerHTML = topClients.map(([name, stats]) => `
    <tr>
      <td class="border p-1">${name}</td>
      <td class="border p-1">${stats.orders}</td>
      <td class="border p-1">₹${stats.revenue.toFixed(2)}</td>
    </tr>
  `).join('');

  // Revenue per client table
  document.getElementById("revenue-per-client-tbody").innerHTML = revenuePerClient.map(c => `
    <tr>
      <td class="border p-1">${c.name}</td>
      <td class="border p-1">₹${c.revenue.toFixed(2)}</td>
    </tr>
  `).join('');

  // Expense breakdown
  document.getElementById("expense-breakdown-tbody").innerHTML = `
    <tr>
      <td class="border p-1">Ingredients</td>
      <td class="border p-1">₹${totalIngredients.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="border p-1">Packaging</td>
      <td class="border p-1">₹${totalPackaging.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="border p-1 font-semibold">Gross Profit</td>
      <td class="border p-1 font-semibold">₹${grossProfit.toFixed(2)}</td>
    </tr>
  `;

  // Summary table
  document.getElementById("summary-table-tbody").innerHTML = `
    <tr><td class="border p-1">Total Revenue</td><td class="border p-1">₹${totalRevenue.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Total Cost</td><td class="border p-1">₹${(totalIngredients + totalPackaging).toFixed(2)}</td></tr>
    <tr><td class="border p-1">Gross Profit</td><td class="border p-1">₹${grossProfit.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Net Profit</td><td class="border p-1">₹${netProfit.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Ingredients</td><td class="border p-1">₹${totalIngredients.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Packaging</td><td class="border p-1">₹${totalPackaging.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Orders</td><td class="border p-1">${orderCount}</td></tr>
    <tr><td class="border p-1">Avg Order Value</td><td class="border p-1">₹${avgOrderValue.toFixed(2)}</td></tr>
    <tr><td class="border p-1">Repeat Customers</td><td class="border p-1">${repeatCustomers}</td></tr>
  `;

  // Cost chart
  renderCostChart(totalIngredients, totalPackaging, grossProfit);

  // Trend chart (bar)
  renderTrendChart(logsSnap);

  // Line chart: Revenue & Profit Over Time
  renderLineChart(allItems);

  document.getElementById("trendChart").setAttribute("aria-label", "Bar chart showing daily revenue trend for the selected month.");
  document.getElementById("costChart").setAttribute("aria-label", "Pie chart showing cost breakdown for the selected month.");
}

function renderCostChart(ingredients, packaging, profit) {
  const ctx = document.getElementById("costChart").getContext("2d");
  if (window.costChartInstance) window.costChartInstance.destroy();
  window.costChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ["Ingredients", "Packaging", "Gross Profit"],
      datasets: [{
        data: [ingredients, packaging, profit],
        backgroundColor: ["#ff4d4d", "#ffcd38", "#33cc99"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#374151',
            font: {
              size: 13,
              family: 'Poppins'
            },
            boxWidth: 15,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ₹${context.parsed.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}

function renderTrendChart(logsSnap) {
  const dailyTotals = {};
  logsSnap.forEach(doc => {
    const d = doc.data();
    const date = d.date;
    if (!dailyTotals[date]) dailyTotals[date] = 0;
    if (d.items && Array.isArray(d.items)) {
      d.items.forEach(item => {
        dailyTotals[date] += item.revenue || 0;
      });
    }
  });

  // Format dates as "18 Jun 2025"
  const rawDates = Object.keys(dailyTotals).sort();
  const labels = rawDates.map(dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });
  const data = rawDates.map(date => dailyTotals[date]);
  const peakIndex = data.indexOf(Math.max(...data));
  const ctx = document.getElementById("trendChart").getContext("2d");
  if (window.trendChartInstance) window.trendChartInstance.destroy();
  window.trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data,
        backgroundColor: labels.map((_, i) => i === peakIndex ? "#f97316" : "#60a5fa")
      }]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: "Date", color: '#6b7280' },
          ticks: { color: '#374151' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Amount (₹)", color: '#6b7280' },
          ticks: { color: '#374151' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ₹${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      }
    }
  });

  // Add a simple custom legend below the chart
  const legendHtml = `
    <div class="flex items-center gap-4 mt-2 text-xs">
      <span class="flex items-center"><span style="display:inline-block;width:16px;height:10px;background:#f97316;margin-right:4px;border-radius:2px"></span>Highest Revenue Day</span>
      <span class="flex items-center"><span style="display:inline-block;width:16px;height:10px;background:#60a5fa;margin-right:4px;border-radius:2px"></span>Other Days</span>
    </div>
  `;
  const chartContainer = document.getElementById("trendChart-container");
  let legendDiv = chartContainer.querySelector('.custom-legend');
  if (!legendDiv) {
    legendDiv = document.createElement('div');
    legendDiv.className = 'custom-legend';
    chartContainer.appendChild(legendDiv);
  }
  legendDiv.innerHTML = legendHtml;
}

function renderLineChart(allItems) {
  // Prepare daily data
  const dailyMap = {};
  allItems.forEach(item => {
    const date = item.date || "Unknown";
    if (!dailyMap[date]) dailyMap[date] = { revenue: 0, profit: 0 };
    dailyMap[date].revenue += item.revenue || 0;
    dailyMap[date].profit += (item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0));
  });
  const dates = Object.keys(dailyMap).sort();
  const revenues = dates.map(d => dailyMap[d].revenue);
  const profits = dates.map(d => dailyMap[d].profit);

  const ctxLine = document.getElementById("lineChart").getContext("2d");
  if (window.lineChartInstance) window.lineChartInstance.destroy();
  window.lineChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: "Revenue",
          data: revenues,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.1)",
          fill: true
        },
        {
          label: "Profit",
          data: profits,
          borderColor: "#34d399",
          backgroundColor: "rgba(52,211,153,0.1)",
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}

async function exportDashboardCSV() {
  const month = parseInt(document.getElementById("filter-month").value);
  const year = parseInt(document.getElementById("filter-year").value);
  const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
  const logsSnap = await window.db.collection("dailyLogs")
    .where("date", ">=", `${datePrefix}-01`)
    .where("date", "<=", `${datePrefix}-31`)
    .get();

  let csv = "Date,Client,Item,Qty,Revenue,Ingredients,Packaging,Profit,Notes\n";
  logsSnap.forEach(doc => {
    const d = doc.data();
    (d.items || []).forEach(item => {
      const profit = (item.revenue || 0) - ((item.ingredients || 0) + (item.packaging || 0));
      csv += [
        d.date,
        `"${d.client || ""}"`,
        `"${item.name || ""}"`,
        item.qty || 0,
        item.revenue || 0,
        item.ingredients || 0,
        item.packaging || 0,
        profit,
        `"${d.notes || ""}"`
      ].join(",") + "\n";
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard_${year}_${String(month).padStart(2, '0')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
