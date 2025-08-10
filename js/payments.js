// payments-dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const paymentsSection = document.getElementById("payments");
  const db = window.db; // Firestore instance

  // --- Helper: Get current month/year as YYYY-MM ---
  function getCurrentMonthYear() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  // --- Helper: Get all clients ---
  async function getAllClients() {
    const salesSnapshot = await db.collection("dailyLogs").get();
    const paymentsSnapshot = await db.collection("payments").get();
    const clients = new Set();
    salesSnapshot.forEach(doc => {
      const d = doc.data();
      if (d.client) clients.add(d.client);
    });
    paymentsSnapshot.forEach(doc => {
      const p = doc.data();
      if (p.client) clients.add(p.client);
    });
    return Array.from(clients).sort();
  }

  // --- Helper: Render summary cards (top) ---
  function renderSummaryCards(insights) {
    return `
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex-1 min-w-[160px] rounded-xl shadow-lg p-5 flex flex-col items-center bg-gradient-to-br from-[#C8AFF0] to-[#F6F2FF]">
          <div class="text-lg font-bold text-black mb-1">₹${insights.totalOutstanding.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div class="text-xs font-medium text-black">Outstanding</div>
        </div>
        <div class="flex-1 min-w-[160px] rounded-xl shadow-lg p-5 flex flex-col items-center bg-gradient-to-br from-[#B9FBC0] to-[#F6F2FF]">
          <div class="text-lg font-bold text-green-700 mb-1">₹${insights.totalReceived.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div class="text-xs font-medium text-black">Received</div>
        </div>
        <div class="flex-1 min-w-[160px] rounded-xl shadow-lg p-5 flex flex-col items-center bg-gradient-to-br from-[#F3F0FF] to-[#C8AFF0]">
          <div class="text-lg font-bold text-black mb-1">${insights.closedCount}</div>
          <div class="text-xs font-medium text-black">Closed Accounts</div>
        </div>
        <div class="flex-1 min-w-[160px] rounded-xl shadow-lg p-5 flex flex-col items-center bg-gradient-to-br from-[#F7D358] to-[#F3F0FF]">
          <div class="text-lg font-bold text-[#3B2F7F] mb-1">${insights.topDebtor || '-'}</div>
          <div class="text-xs font-medium text-[#3B2F7F]">Top Debtor</div>
        </div>
        <div class="flex-1 min-w-[160px] rounded-xl shadow-lg p-5 flex flex-col items-center bg-gradient-to-br from-[#B9FBC0] to-[#F3F0FF]">
          <div class="text-lg font-bold text-[#3B2F7F] mb-1">${insights.fastestPayer || '-'}</div>
          <div class="text-xs font-medium text-[#3B2F7F]">Fastest Payer</div>
        </div>
      </div>
    `;
  }

  // --- Helper: Render attention section ---
  function renderAttentionSection(attentionClients) {
    if (!attentionClients.length) return '';
    return `
      <div class="mb-6">
        <div class="rounded-xl shadow-lg p-5 bg-[#FFF3F0] border-2 border-[#F7D358]">
          <div class="text-base font-bold text-[#D7263D] mb-2">⚠️ Needs Attention</div>
          <div class="flex flex-wrap gap-3">
            ${attentionClients.map(c => `
              <div class="rounded-lg bg-[#F7D358] p-3 min-w-[180px] flex flex-col items-center border border-[#3B2F7F]">
                <div class="text-sm font-bold text-[#3B2F7F]">${c.client}</div>
                <div class="text-lg font-extrabold text-[#D7263D]">₹${c.outstanding.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                <div class="text-xs text-[#3B2F7F]">Overdue by ${c.daysOverdue} days</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- Helper: Render payment trend chart ---
  function renderPaymentTrendChart(payments) {
    // Prepare data for Chart.js
    const dates = {};
    payments.forEach(p => {
      if (!p.date || !p.amount) return;
      dates[p.date] = (dates[p.date] || 0) + p.amount;
    });
    const sortedDates = Object.keys(dates).sort();
    const chartLabels = sortedDates;
    const chartData = sortedDates.map(d => dates[d]);

    // Chart container
    return `
      <div class="mb-6">
        <div class="rounded-xl shadow-lg p-5 bg-white">
          <div class="text-base font-bold text-black mb-2">Payment Timeline</div>
          <canvas id="payment-trend-chart" height="80"></canvas>
        </div>
      </div>
    `;
  }

  // --- Helper: Render filter controls ---
  function renderFilterControls(selectedMonthYear, clients, selectedClient, selectedStatus, dateRange) {
    return `
      <form id="dashboard-filter-form" class="mb-4 flex flex-wrap gap-3 items-center">
        <label class="font-medium text-gray-700 text-[13px]">Month:</label>
        <input type="month" id="filter-month" name="month" value="${selectedMonthYear}" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" />
        <label class="font-medium text-gray-700 text-[13px]">Client:</label>
        <select id="filter-client" name="client" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]">
          <option value="">All</option>
          ${clients.map(c => `<option value="${c}" ${selectedClient === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <label class="font-medium text-gray-700 text-[13px]">Status:</label>
        <select id="filter-status" name="status" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]">
          <option value="">All</option>
          <option value="open" ${selectedStatus === 'open' ? 'selected' : ''}>Open</option>
          <option value="closed" ${selectedStatus === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
        <label class="font-medium text-gray-700 text-[13px]">Date Range:</label>
        <input type="date" id="filter-date-from" name="dateFrom" value="${dateRange.from || ''}" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" />
        <span>-</span>
        <input type="date" id="filter-date-to" name="dateTo" value="${dateRange.to || ''}" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" />
        <button type="submit" class="bg-[#C8AFF0] text-black px-3 py-1 rounded-md shadow hover:bg-[#b39ddb] focus:outline-none focus:ring-2 focus:ring-[#C8AFF0] transition text-xs">Apply</button>
      </form>
    `;
  }

  // --- Main render function ---
  async function renderPaymentsDashboard({
    selectedMonthYear = getCurrentMonthYear(),
    selectedClient = "",
    selectedStatus = "",
    dateRange = { from: "", to: "" }
  } = {}) {
    if (!paymentsSection) return;

    // --- Get all clients for filter dropdown ---
    const clients = await getAllClients();

    // --- Get all sales and payments ---
    const salesSnapshot = await db.collection("dailyLogs").get();
    const paymentsSnapshot = await db.collection("payments").get();

    // --- Prepare client totals ---
    const clientTotals = {};
    const paymentsList = [];
    salesSnapshot.forEach(doc => {
      const d = doc.data();
      if (!d.client || !d.date) return;
      // Filter by month/year
      if (selectedMonthYear && !d.date.startsWith(selectedMonthYear)) return;
      if (selectedClient && d.client !== selectedClient) return;
      if (!clientTotals[d.client]) {
        clientTotals[d.client] = { sales: 0, paid: 0, payments: [], salesDates: [] };
      }
      clientTotals[d.client].sales += d.totalRevenue || 0;
      clientTotals[d.client].salesDates.push(d.date);
    });
    paymentsSnapshot.forEach(doc => {
      const p = doc.data();
      if (!p.client || !p.date) return;
      // Filter by month/year
      if (selectedMonthYear && !p.date.startsWith(selectedMonthYear)) return;
      if (selectedClient && p.client !== selectedClient) return;
      // Filter by date range
      if (dateRange.from && p.date < dateRange.from) return;
      if (dateRange.to && p.date > dateRange.to) return;
      if (!clientTotals[p.client]) {
        clientTotals[p.client] = { sales: 0, paid: 0, payments: [], salesDates: [] };
      }
      clientTotals[p.client].paid += p.amount || 0;
      clientTotals[p.client].payments.push({ ...p, id: doc.id });
      paymentsList.push({ ...p, client: p.client });
    });

    // --- Prepare sorted client list ---
    const openAccounts = [];
    const closedAccounts = [];
    Object.entries(clientTotals).forEach(([client, data]) => {
      const outstanding = data.sales - data.paid;
      if (selectedStatus === "open" && outstanding <= 0) return;
      if (selectedStatus === "closed" && outstanding > 0) return;
      if (outstanding > 0) {
        openAccounts.push({ client, ...data, outstanding });
      } else {
        closedAccounts.push({ client, ...data, outstanding });
      }
    });
    openAccounts.sort((a, b) => b.outstanding - a.outstanding);
    closedAccounts.sort((a, b) => a.client.localeCompare(b.client));
    const sortedClients = [...openAccounts, ...closedAccounts];

    // --- Insights calculations ---
    let totalOutstanding = 0;
    let totalReceived = 0;
    let closedCount = closedAccounts.length;
    let topDebtor = openAccounts[0]?.client || "";
    let fastestPayer = "";
    openAccounts.forEach(data => { totalOutstanding += data.outstanding; });
    Object.values(clientTotals).forEach(data => { totalReceived += data.paid; });

    // Fastest payer: client who paid full earliest in the month
    let fastestPayerObj = closedAccounts
      .map(c => ({
        client: c.client,
        lastPaidDate: c.payments.length ? c.payments.sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].date : ""
      }))
      .filter(c => c.lastPaidDate)
      .sort((a, b) => a.lastPaidDate.localeCompare(b.lastPaidDate))[0];
    if (fastestPayerObj) fastestPayer = fastestPayerObj.client;

    // --- Attention section: overdue/large outstanding ---
    const today = new Date();
    const attentionClients = openAccounts
      .map(c => {
        // Overdue: last payment > 15 days ago, or outstanding > 10,000
        let lastPaidDate = c.payments.length ? c.payments.sort((a, b) => b.date.localeCompare(a.date))[0].date : "";
        let daysOverdue = lastPaidDate ? Math.floor((today - new Date(lastPaidDate)) / (1000 * 60 * 60 * 24)) : "";
        return {
          client: c.client,
          outstanding: c.outstanding,
          daysOverdue: daysOverdue || "N/A"
        };
      })
      .filter(c => c.outstanding > 10000 || (c.daysOverdue !== "N/A" && c.daysOverdue > 15));

    // --- Render HTML ---
    let html = `
      <div class="max-w-5xl mx-auto py-6 text-[13px]">
        <h2 class="text-2xl font-bold mb-4 text-black flex items-center gap-2">
          <span>💸</span> Payments Dashboard
        </h2>
        ${renderFilterControls(selectedMonthYear, clients, selectedClient, selectedStatus, dateRange)}
        ${renderSummaryCards({ totalOutstanding, totalReceived, closedCount, topDebtor, fastestPayer })}
        ${renderAttentionSection(attentionClients)}
        ${renderPaymentTrendChart(paymentsList)}
        <div class="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table class="min-w-full text-xs text-gray-800">
            <thead>
              <tr style="background: rgba(200, 175, 240, 0.8);" class="uppercase text-[11px] tracking-wider text-black">
                <th class="p-3 text-left">Client</th>
                <th class="p-3 text-right">Total Sales (₹)</th>
                <th class="p-3 text-right">Total Paid (₹)</th>
                <th class="p-3 text-right">Outstanding (₹)</th>
                <th class="p-3 text-center">Log Payment</th>
                <th class="p-3 text-center">History</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (sortedClients.length === 0) {
      html += `
        <tr>
          <td colspan="6" class="p-6 text-center text-gray-400">No client sales or payments found for this filter.</td>
        </tr>
      `;
    } else {
      sortedClients.forEach((data, idx) => {
        html += `
          <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F2FF]'} hover:bg-[#E9E0FA] transition">
            <td class="p-3 font-semibold text-black">${data.client}</td>
            <td class="p-3 text-right text-black">₹${data.sales.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-3 text-right text-green-700 font-semibold">₹${data.paid.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-3 text-right ${data.outstanding > 0 ? 'text-red-600 font-bold' : 'text-gray-500'}">
              ₹${data.outstanding.toLocaleString(undefined, {minimumFractionDigits:2})}
            </td>
            <td class="p-3 text-center">
              <button class="log-payment-btn bg-[#C8AFF0] text-black px-3 py-1 rounded-md shadow hover:bg-[#b39ddb] focus:outline-none focus:ring-2 focus:ring-[#C8AFF0] transition text-xs" data-client="${data.client}">
                + Payment
              </button>
            </td>
            <td class="p-3 text-center">
              <button class="show-history-btn text-black hover:underline font-medium text-xs" data-client="${data.client}">
                View
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
        <div id="payment-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
        <div id="payment-history-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
      </div>
    `;

    paymentsSection.innerHTML = html;

    // --- Chart.js: Payment Trend ---
    setTimeout(() => {
      if (window.Chart && document.getElementById('payment-trend-chart')) {
        const ctx = document.getElementById('payment-trend-chart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: paymentsList.map(p => p.date),
            datasets: [{
              label: 'Payments (₹)',
              data: paymentsList.map(p => p.amount),
              borderColor: '#3B2F7F',
              backgroundColor: 'rgba(200,175,240,0.2)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: true }, y: { display: true } }
          }
        });
      }
    }, 300);

    // --- Filter controls events ---
    document.getElementById('dashboard-filter-form').onsubmit = e => {
      e.preventDefault();
      const month = document.getElementById('filter-month').value;
      const client = document.getElementById('filter-client').value;
      const status = document.getElementById('filter-status').value;
      const dateFrom = document.getElementById('filter-date-from').value;
      const dateTo = document.getElementById('filter-date-to').value;
      renderPaymentsDashboard({
        selectedMonthYear: month,
        selectedClient: client,
        selectedStatus: status,
        dateRange: { from: dateFrom, to: dateTo }
      });
    };

    // Add event listeners for log payment buttons
    document.querySelectorAll('.log-payment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showPaymentForm(e.target.dataset.client, selectedMonthYear);
      });
    });

    // Add event listeners for show history buttons
    document.querySelectorAll('.show-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showPaymentHistory(
          e.target.dataset.client,
          clientTotals[e.target.dataset.client]?.payments || []
        );
      });
    });
  }

  // --- Payment form modal (same as before) ---
  function showPaymentForm(client, selectedMonthYear) {
    const modal = document.getElementById('payment-form-modal');
    let defaultDate = new Date();
    if (selectedMonthYear) {
      const [y, m] = selectedMonthYear.split("-");
      defaultDate = new Date(Number(y), Number(m) - 1, defaultDate.getDate());
    }
    const defaultDateStr = defaultDate.toISOString().split('T')[0];

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative animate-fadeIn border-2 border-[#C8AFF0] text-[13px]">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold" id="close-payment-form" title="Close">&times;</button>
        <h3 class="text-lg font-bold mb-3 text-black">Log Payment for <span class="text-[#C8AFF0]">${client}</span></h3>
        <form id="log-payment-form" class="space-y-3">
          <input type="hidden" name="client" value="${client}" />
          <div>
            <label class="block text-xs font-medium mb-1 text-black" for="payment-date">Date</label>
            <input type="date" name="date" id="payment-date" class="w-full p-1 border rounded focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" required value="${defaultDateStr}" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 text-black" for="payment-amount">Amount (₹)</label>
            <input type="number" name="amount" id="payment-amount" class="w-full p-1 border rounded focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" placeholder="Amount" required min="1" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 text-black" for="payment-notes">Notes (optional)</label>
            <input type="text" name="notes" id="payment-notes" class="w-full p-1 border rounded focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" placeholder="Notes" />
          </div>
          <div class="flex gap-2 mt-3">
            <button type="submit" class="flex-1 bg-[#C8AFF0] text-black px-3 py-1 rounded-md shadow hover:bg-[#b39ddb] focus:outline-none focus:ring-2 focus:ring-[#C8AFF0] transition text-xs">Save</button>
            <button type="button" id="cancel-payment-form" class="flex-1 bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 transition text-xs">Cancel</button>
          </div>
        </form>
      </div>
    `;
    modal.classList.remove('hidden');

    document.getElementById('close-payment-form').onclick =
    document.getElementById('cancel-payment-form').onclick = () => {
      modal.classList.add('hidden');
      modal.innerHTML = '';
    };

    document.getElementById('log-payment-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const client = form.client.value;
      const date = form.date.value;
      const amount = parseFloat(form.amount.value);
      const notes = form.notes.value;
      try {
        await db.collection("payments").add({ client, date, amount, notes, createdAt: new Date() });
        modal.classList.add('hidden');
        modal.innerHTML = '';
        renderPaymentsDashboard();
      } catch (err) {
        alert("Failed to save payment: " + err.message);
      }
    };
  }

  // --- Payment history modal (same as before) ---
  function showPaymentHistory(client, payments) {
    const modal = document.getElementById('payment-history-modal');
    let html = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fadeIn border-2 border-[#C8AFF0] text-[13px]">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold" id="close-history-modal" title="Close">&times;</button>
        <h3 class="text-lg font-bold mb-3 text-black">Payment History for <span class="text-[#C8AFF0]">${client}</span></h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-xs text-gray-800 mb-3">
            <thead>
              <tr style="background: rgba(200, 175, 240, 0.8);" class="uppercase text-[11px] tracking-wider text-black">
                <th class="p-2 text-left">Date</th>
                <th class="p-2 text-right">Amount (₹)</th>
                <th class="p-2 text-left">Notes</th>
                <th class="p-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
    `;
    if (!payments || payments.length === 0) {
      html += `<tr><td colspan="4" class="p-4 text-center text-gray-400">No payments logged.</td></tr>`;
    } else {
      payments.sort((a, b) => (a.date > b.date ? -1 : 1)).forEach(p => {
        html += `
          <tr class="hover:bg-[#F6F2FF] transition">
            <td class="p-2 text-black">${p.date}</td>
            <td class="p-2 text-right text-green-700 font-semibold">₹${p.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-2 text-black">${p.notes || ''}</td>
            <td class="p-2 text-center">
              <button class="delete-payment-btn text-red-600 hover:underline text-xs" data-id="${p.id || ''}">Delete</button>
            </td>
          </tr>
        `;
      });
    }
    html += `
            </tbody>
          </table>
        </div>
        <div class="flex justify-end">
          <button id="close-history-modal-btn" class="bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 transition text-xs">Close</button>
        </div>
      </div>
    `;
    modal.innerHTML = html;
    modal.classList.remove('hidden');
    document.getElementById('close-history-modal').onclick =
    document.getElementById('close-history-modal-btn').onclick = () => {
      modal.classList.add('hidden');
      modal.innerHTML = '';
    };

    // Add delete event listeners
    document.querySelectorAll('.delete-payment-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!id) return alert("Cannot delete: missing payment ID.");
        if (!confirm("Are you sure you want to delete this payment?")) return;
        try {
          await db.collection("payments").doc(id).delete();
          alert("Payment deleted.");
          modal.classList.add('hidden');
          modal.innerHTML = '';
          renderPaymentsDashboard();
        } catch (err) {
          alert("Failed to delete payment: " + err.message);
        }
      };
    });
  }

  // --- Animation and styles ---
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98);}
      to   { opacity: 1; transform: scale(1);}
    }
    .animate-fadeIn { animation: fadeIn 0.2s; }
    #payments, #payments * {
      font-size: 13px !important;
      line-height: 1.3 !important;
    }
    #payments h2, #payments h3 {
      font-size: 1.1rem !important;
    }
    #payments table th, #payments table td {
      white-space: nowrap;
    }
    @media (max-width: 600px) {
      #payments, #payments * {
        font-size: 12px !important;
      }
      #payments h2, #payments h3 {
        font-size: 1rem !important;
      }
    }
    .rounded-xl, .rounded-lg {
      box-shadow: 0 4px 24px 0 rgba(59,47,127,0.10);
    }
  `;
  document.head.appendChild(style);

  // Expose the render function globally for navigation
  window.renderPaymentsDashboard = renderPaymentsDashboard;

  // Initial render
  renderPaymentsDashboard();
});
