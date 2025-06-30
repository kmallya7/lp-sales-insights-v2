// payments.js

document.addEventListener("DOMContentLoaded", () => {
  const paymentsSection = document.getElementById("payments");
  const db = window.db; // Firestore instance

  // Helper: Render the payments summary table
  async function renderPaymentsTable() {
    if (!paymentsSection || paymentsSection.classList.contains("hidden")) {
      paymentsSection.innerHTML = "";
      return;
    }

    // 1. Get all daily logs (sales)
    const salesSnapshot = await db.collection("dailyLogs").get();
    const clientTotals = {};

    salesSnapshot.forEach(doc => {
      const d = doc.data();
      if (!d.client) return; // skip if no client
      if (!clientTotals[d.client]) {
        clientTotals[d.client] = { sales: 0, paid: 0, payments: [] };
      }
      clientTotals[d.client].sales += d.totalRevenue || 0;
    });

    // 2. Get all payments
    const paymentsSnapshot = await db.collection("payments").get();
    paymentsSnapshot.forEach(doc => {
      const p = doc.data();
      if (!p.client) return; // skip if no client
      if (!clientTotals[p.client]) {
        clientTotals[p.client] = { sales: 0, paid: 0, payments: [] };
      }
      clientTotals[p.client].paid += p.amount || 0;
      clientTotals[p.client].payments.push(p);
    });

    // 3. Build the table with improved UI
    let html = `
      <div class="max-w-4xl mx-auto py-8">
        <h2 class="text-3xl font-bold mb-6 text-orange-700 flex items-center gap-2">
          <span>💸</span> Payments Tracker
        </h2>
        <div class="overflow-x-auto rounded-xl shadow-lg bg-white">
          <table class="min-w-full text-sm text-gray-800">
            <thead>
              <tr class="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 uppercase text-xs tracking-wider">
                <th class="p-4 text-left">Client</th>
                <th class="p-4 text-right">Total Sales (₹)</th>
                <th class="p-4 text-right">Total Paid (₹)</th>
                <th class="p-4 text-right">Outstanding (₹)</th>
                <th class="p-4 text-center">Log Payment</th>
                <th class="p-4 text-center">History</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (Object.keys(clientTotals).length === 0) {
      html += `
        <tr>
          <td colspan="6" class="p-8 text-center text-gray-400">No client sales or payments found.</td>
        </tr>
      `;
    } else {
      Object.entries(clientTotals).forEach(([client, data], idx) => {
        const outstanding = data.sales - data.paid;
        html += `
          <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'} hover:bg-orange-100 transition">
            <td class="p-4 font-semibold">${client}</td>
            <td class="p-4 text-right">₹${data.sales.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-4 text-right text-green-700 font-semibold">₹${data.paid.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-4 text-right ${outstanding > 0 ? 'text-red-600 font-bold' : 'text-gray-500'}">
              ₹${outstanding.toLocaleString(undefined, {minimumFractionDigits:2})}
            </td>
            <td class="p-4 text-center">
              <button class="log-payment-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" data-client="${client}">
                + Payment
              </button>
            </td>
            <td class="p-4 text-center">
              <button class="show-history-btn text-blue-600 hover:underline font-medium" data-client="${client}">
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

    // Add event listeners for log payment buttons
    document.querySelectorAll('.log-payment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showPaymentForm(e.target.dataset.client);
      });
    });

    // Add event listeners for show history buttons
    document.querySelectorAll('.show-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showPaymentHistory(e.target.dataset.client, clientTotals[e.target.dataset.client].payments);
      });
    });
  }

  // Show payment form modal
  function showPaymentForm(client) {
    const modal = document.getElementById('payment-form-modal');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative animate-fadeIn">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" id="close-payment-form" title="Close">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">Log Payment for <span class="text-orange-700">${client}</span></h3>
        <form id="log-payment-form" class="space-y-4">
          <input type="hidden" name="client" value="${client}" />
          <div>
            <label class="block text-sm font-medium mb-1" for="payment-date">Date</label>
            <input type="date" name="date" id="payment-date" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" required value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="payment-amount">Amount (₹)</label>
            <input type="number" name="amount" id="payment-amount" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" placeholder="Amount" required min="1" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="payment-notes">Notes (optional)</label>
            <input type="text" name="notes" id="payment-notes" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" placeholder="Notes" />
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition">Save</button>
            <button type="button" id="cancel-payment-form" class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
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
      renderPaymentsTable();
    };
  }

  // Show payment history modal
  function showPaymentHistory(client, payments) {
    const modal = document.getElementById('payment-history-modal');
    let html = `
      <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative animate-fadeIn">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" id="close-history-modal" title="Close">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">Payment History for <span class="text-orange-700">${client}</span></h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-gray-800 mb-4">
            <thead>
              <tr class="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 uppercase text-xs tracking-wider">
                <th class="p-3 text-left">Date</th>
                <th class="p-3 text-right">Amount (₹)</th>
                <th class="p-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
    `;
    if (!payments || payments.length === 0) {
      html += `<tr><td colspan="3" class="p-6 text-center text-gray-400">No payments logged.</td></tr>`;
    } else {
      payments.sort((a, b) => (a.date > b.date ? -1 : 1)).forEach(p => {
        html += `
          <tr class="hover:bg-orange-50 transition">
            <td class="p-3">${p.date}</td>
            <td class="p-3 text-right text-green-700 font-semibold">₹${p.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="p-3">${p.notes || ''}</td>
          </tr>
        `;
      });
    }
    html += `
            </tbody>
          </table>
        </div>
        <div class="flex justify-end">
          <button id="close-history-modal-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Close</button>
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
  `;
  document.head.appendChild(style);

  // Expose the render function globally for navigation
  window.renderPaymentsTable = renderPaymentsTable;
});
