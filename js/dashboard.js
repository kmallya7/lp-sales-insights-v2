window.loadDashboard = async function () {
  const container = document.getElementById("dashboard");
  if (!container) return;

  // Initial dashboard structure
  container.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-4 text-text flex items-center">
        <span class="mr-2">📊</span> Monthly Dashboard
      </h2>
      <p class="text-sm text-gray-500 mb-6">View your monthly financial summary</p>

      <div class="flex items-center gap-4 mb-6">
        <label class="text-sm text-gray-600">Month:
          <select id="filter-month" class="border p-2 rounded">
            ${[...Array(12).keys()].map(m => `<option value="${m+1}">${new Date(0, m).toLocaleString('default', { month: 'long' })}</option>`).join('')}
          </select>
        </label>
        <label class="text-sm text-gray-600">Year:
          <input id="filter-year" type="number" class="border p-2 rounded w-24" value="${new Date().getFullYear()}" />
        </label>
        <button id="apply-filters" class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Apply</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-blue-100 p-4 rounded flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-blue-700">Total Revenue</p>
            <p id="dash-revenue" class="text-xl font-bold text-blue-900">₹0.00</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-blue-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div class="bg-red-100 p-4 rounded flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-red-700">Total Cost</p>
            <p id="dash-cost" class="text-xl font-bold text-red-900">₹0.00</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-red-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div class="bg-green-100 p-4 rounded flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-green-700">Gross Profit</p>
            <p id="dash-gross" class="text-xl font-bold text-green-900">₹0.00</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div class="bg-purple-100 p-4 rounded flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-purple-700">Net Profit</p>
            <p id="dash-net" class="text-xl font-bold text-purple-900">₹0.00</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-purple-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded shadow">
          <h3 class="text-sm font-semibold text-gray-600 mb-2">Revenue Trend</h3>
          <div class="w-full h-64">
            <canvas id="trendChart" class="w-full h-full"></canvas>
          </div>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h3 class="text-sm font-semibold text-gray-600 mb-2">Cost Breakdown</h3>
          <div class="w-full h-64 flex items-center justify-center">
            <canvas id="costChart" class="w-full h-full max-w-[300px]"></canvas>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById("filter-month").value = new Date().getMonth() + 1;
  document.getElementById("apply-filters").addEventListener("click", () => {
    const m = parseInt(document.getElementById("filter-month").value);
    const y = parseInt(document.getElementById("filter-year").value);
    loadDashboardData(m, y);
  });

  await loadDashboardData(new Date().getMonth() + 1, new Date().getFullYear());
};

async function loadDashboardData(month, year) {
  const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
  const logs = await window.db.collection("dailyLogs")
    .where("date", ">=", `${datePrefix}-01`)
    .where("date", "<=", `${datePrefix}-31`)
    .get();

  let totalRevenue = 0, totalIngredients = 0, totalPackaging = 0;

  logs.forEach(doc => {
    const d = doc.data();
    totalRevenue += d.revenue || 0;
    totalIngredients += d.ingredients || 0;
    totalPackaging += d.packaging || 0;
  });

  const grossProfit = totalRevenue - (totalIngredients + totalPackaging);
  const netProfit = grossProfit; // Extend this later with fixed expenses

  document.getElementById("dash-revenue").innerText = `₹${totalRevenue.toFixed(2)}`;
  document.getElementById("dash-cost").innerText = `₹${(totalIngredients + totalPackaging).toFixed(2)}`;
  document.getElementById("dash-gross").innerText = `₹${grossProfit.toFixed(2)}`;
  document.getElementById("dash-net").innerText = `₹${netProfit.toFixed(2)}`;

  renderCostChart(totalIngredients, totalPackaging, grossProfit);
  renderTrendChart(logs);
}

function renderCostChart(ingredients, packaging, profit) {
  const ctx = document.getElementById("costChart").getContext("2d");
  new Chart(ctx, {
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
        }
      }
    }
  });
}

function renderTrendChart(logs) {
  const dailyTotals = {};
  logs.forEach(doc => {
    const d = doc.data();
    const date = d.date;
    if (!dailyTotals[date]) dailyTotals[date] = 0;
    dailyTotals[date] += d.revenue || 0;
  });
  const labels = Object.keys(dailyTotals).sort();
  const data = labels.map(date => dailyTotals[date]);

  const peakIndex = data.indexOf(Math.max(...data));
  const ctx = document.getElementById("trendChart").getContext("2d");
  new Chart(ctx, {
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
}