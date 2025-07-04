// payments.js

document.addEventListener("DOMContentLoaded", () => {
  const paymentsSection = document.getElementById("payments");
  const db = window.db; // Firestore instance

  // --- Helper: Get current month/year as YYYY-MM ---
  function getCurrentMonthYear() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  // --- Helper: Render the payments summary table ---
  async function renderPaymentsTable(selectedMonthYear = getCurrentMonthYear()) {
    if (!paymentsSection || paymentsSection.classList.contains("hidden")) {
      paymentsSection.innerHTML = "";
      return;
    }

    // --- 1. Get all daily logs (sales) for selected month ---
    const salesSnapshot = await db.collection("dailyLogs").get();
    const clientTotals = {};

    salesSnapshot.forEach(doc => {
      const d = doc.data();
      if (!d.client || !d.date) return;
      // Filter by month/year
      if (!d.date.startsWith(selectedMonthYear)) return;
      if (!clientTotals[d.client]) {
        clientTotals[d.client] = { sales: 0, paid: 0, payments: [], salesDates: [] };
      }
      clientTotals[d.client].sales += d.totalRevenue || 0;
      clientTotals[d.client].salesDates.push(d.date);
    });

    // --- 2. Get all payments for selected month ---
    const paymentsSnapshot = await db.collection("payments").get();
    paymentsSnapshot.forEach(doc => {
      const p = doc.data();
      if (!p.client || !p.date) return;
      // Filter by month/year
      if (!p.date.startsWith(selectedMonthYear)) return;
      if (!clientTotals[p.client]) {
        clientTotals[p.client] = { sales: 0, paid: 0, payments: [], salesDates: [] };
      }
      clientTotals[p.client].paid += p.amount || 0;
      clientTotals[p.client].payments.push(p);
    });

    // --- 3. Prepare sorted client list ---
    const openAccounts = [];
    const closedAccounts = [];
    Object.entries(clientTotals).forEach(([client, data]) => {
      const outstanding = data.sales - data.paid;
      if (outstanding > 0) {
        openAccounts.push({ client, ...data, outstanding });
      } else {
        closedAccounts.push({ client, ...data, outstanding });
      }
    });
    // Sort open accounts by outstanding desc
    openAccounts.sort((a, b) => b.outstanding - a.outstanding);
    // Sort closed accounts alphabetically
    closedAccounts.sort((a, b) => a.client.localeCompare(b.client));
    const sortedClients = [...openAccounts, ...closedAccounts];

    // --- 4. Card Stack Calculations ---
    let totalOutstanding = 0;
    let totalReceived = 0;
    let closedCount = closedAccounts.length;
    openAccounts.forEach(data => { totalOutstanding += data.outstanding; });
    Object.values(clientTotals).forEach(data => { totalReceived += data.paid; });

    // --- 5. Month/Year Picker UI ---
    const [year, month] = selectedMonthYear.split("-");
    let monthPickerHtml = `
      <form id="month-filter-form" class="mb-4 flex flex-wrap gap-3 items-center">
        <label class="font-medium text-gray-700 text-[13px]">Show for:</label>
        <input type="month" id="month-filter" name="month" value="${selectedMonthYear}" class="border rounded px-2 py-1 focus:ring-2 focus:ring-[#C8AFF0] text-[13px]" />
      </form>
    `;

    // --- 6. Card Stack HTML (smaller, sleeker) ---
    let cardStackHtml = `
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="flex-1 min-w-[140px] rounded-lg shadow p-4 flex flex-col items-center" style="background: rgba(200, 175, 240, 0.8);">
          <div class="text-lg font-bold text-black mb-1">₹${totalOutstanding.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div class="text-xs font-medium text-black">Amount Yet to Receive</div>
        </div>
        <div class="flex-1 min-w-[140px] rounded-lg shadow p-4 flex flex-col items-center" style="background: rgba(185, 251, 192, 0.8);">
          <div class="text-lg font-bold text-green-700 mb-1">₹${totalReceived.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div class="text-xs font-medium text-black">Amount Received</div>
        </div>
        <div class="flex-1 min-w-[140px] rounded-lg shadow p-4 flex flex-col items-center" style="background: rgba(243, 240, 255, 0.8);">
          <div class="text-lg font-bold text-black mb-1">${closedCount}</div>
          <div class="text-xs font-medium text-black">Closed Accounts</div>
        </div>
      </div>
    `;

    // --- 7. Table HTML (smaller, sleeker) ---
    let html = `
      <div class="max-w-3xl mx-auto py-6 text-[13px]">
        <h2 class="text-xl font-bold mb-4 text-black flex items-center gap-2">
          <span>💸</span> Payments Tracker
        </h2>
        ${monthPickerHtml}
        ${cardStackHtml}
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
          <td colspan="6" class="p-6 text-center text-gray-400">No client sales or payments found for this month.</td>
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

    // --- Month/Year Picker Event ---
    document.getElementById('month-filter-form').onsubmit = e => e.preventDefault();
    document.getElementById('month-filter').onchange = (e) => {
      renderPaymentsTable(e.target.value);
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

  // Show payment form modal
  function showPaymentForm(client, selectedMonthYear) {
    const modal = document.getElementById('payment-form-modal');
    // Default date to selected month
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
      await db.collection("payments").add({ client, date, amount, notes, createdAt: new Date() });
      modal.classList.add('hidden');
      modal.innerHTML = '';
      renderPaymentsTable(selectedMonthYear);
    };
  }

  // Show payment history modal
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
              </tr>
            </thead>
            <tbody>
    `;
    if (!payments || payments.length === 0) {
      html += `<tr><td colspan="3" class="p-4 text-center text-gray-400">No payments logged.</td></tr>`;
    } else {
      payments.sort((a, b) => (a.date > b.date ? -1 : 1)).forEach(p => {
        html += `
          <tr class="hover:bg-[#F6F2FF] transition">
            <td class="p-2 text-black">${p.date}</td>
            <td class="p-2 text-right text-green-700 font-semibold">₹${p.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-2 text-black">${p.notes || ''}</td>
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
  }

  // Animation for modals
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98);}
      to   { opacity: 1; transform: scale(1);}
    }
    .animate-fadeIn { animation: fadeIn 0.2s; }
    /* Sleeker font size for all payments section */
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
  `;
  document.head.appendChild(style);

  // Expose the render function globally for navigation
  window.renderPaymentsTable = renderPaymentsTable;

  // Initial render
  renderPaymentsTable();
});
