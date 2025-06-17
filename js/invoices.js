// invoices.js

document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("invoice");
  if (!section) return;

  const container = document.getElementById("invoicePrintArea");
  container.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-5xl mx-auto">
      <header class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-bold text-orange-900">Lush Patisserie</h1>
          <p class="text-sm text-gray-700">Wow By Urban Tree, Medavakkam<br>Chennai, 600100<br>Phone: +91 877 896 7179</p>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-bold text-orange-900 border-b-2 border-orange-300 inline-block">INVOICE</h2>
        </div>
      </header>

      <!-- Invoice Metadata Row -->
<div class="flex flex-col lg:flex-row print:flex-row justify-between gap-6 bg-gray-50 p-4 rounded mb-6">
  <!-- Invoice Info -->
  <div class="w-full md:w-1/2 space-y-2">
    <label class="text-sm font-medium text-gray-600">Invoice #</label>
    <input type="text" id="invoiceNumber" class="w-full p-2 border rounded" placeholder="INV-2025-001">

    <label class="text-sm font-medium text-gray-600">Invoice Date</label>
    <input type="date" id="invoiceDate" class="w-full p-2 border rounded">

    <label class="text-sm font-medium text-gray-600">Due Date</label>
    <input type="date" id="dueDate" class="w-full p-2 border rounded">
  </div>

  <!-- Bill To -->
  <div class="w-full md:w-1/2 space-y-2">
    <label class="text-sm font-medium text-gray-600">Bill To</label>
    <input type="text" id="clientName" class="w-full p-2 border rounded" placeholder="Client Name">
    <textarea id="clientAddress" class="w-full p-2 border rounded" placeholder="Client Address"></textarea>
    <input type="text" id="clientPhone" class="w-full p-2 border rounded" placeholder="Client Phone">
    <input type="email" id="clientEmail" class="w-full p-2 border rounded" placeholder="Client Email">
  </div>
</div>


      <!-- Items Table -->
      <table class="w-full text-sm border mb-4">
        <thead class="bg-blue-100 text-gray-800">
          <tr>
            <th class="p-2 border">Item</th>
            <th class="p-2 border">Qty</th>
            <th class="p-2 border">Price (₹)</th>
            <th class="p-2 border">Amount</th>
            <th class="p-2 border print:hidden">Action</th>
          </tr>
        </thead>
        <tbody id="invoiceItems"></tbody>
      </table>
      <button id="addItemBtn" class="mt-2 mb-6 px-4 py-2 bg-orange-800 text-white rounded hover:bg-orange-900 print:hidden">+ Add Item</button>

      <!-- Notes and Totals -->
      <div class="flex flex-col md:flex-row justify-between gap-6 mb-6">
        <textarea id="invoiceNotes" class="w-full md:w-2/3 p-2 border rounded" placeholder="Notes: payment terms, delivery info, etc."></textarea>
        <div class="bg-yellow-50 print:bg-yellow-100 p-4 rounded shadow-sm md:w-1/3 space-y-2 border border-yellow-200 print:border-yellow-400">
  <div class="flex justify-between text-sm text-gray-800">
    <span>Subtotal:</span>
    <span id="subtotal">₹0.00</span>
  </div>
  <hr class="border-gray-300">
  <div class="flex justify-between text-xl font-bold text-gray-900">
    <span>Invoice Total:</span>
    <span id="total">₹0.00</span>
  </div>
</div>
      </div>

      <!-- Print Button -->
      <div class="mt-4 text-right print:hidden">
        <button onclick="window.print()" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">Print / Save PDF</button>
      </div>

      <!-- Signature + Thank You Combined -->
<div class="mt-12 flex flex-col items-center print:flex-row print:justify-between print:items-end gap-2 w-full">
  <div class="text-left">
    <p class="text-sm text-gray-600 italic">Signature</p>
    <p class="text-xl mt-2 font-signature">Vaishnavi</p>
  </div>
  <div class="text-center text-orange-800 text-base italic font-medium">
    Thank you for your business! ❤️
  </div>
</div>
    </section>
  `;

  const itemsBody = document.getElementById("invoiceItems");

  function updateTotals() {
    let subtotal = 0;
    itemsBody.querySelectorAll("tr").forEach(row => {
      const qty = parseFloat(row.querySelector(".qty").value) || 0;
      const price = parseFloat(row.querySelector(".price").value) || 0;
      const amt = qty * price;
      subtotal += amt;
      row.querySelector(".amount").textContent = `₹${amt.toFixed(2)}`;
    });
    document.getElementById("subtotal").textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `₹${subtotal.toFixed(2)}`;
  }

  function addRow() {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-1"><input type="text" class="w-full p-1 border rounded" placeholder="Item"></td>
      <td class="border p-1"><input type="number" class="w-full p-1 border rounded qty" value="1"></td>
      <td class="border p-1"><input type="number" class="w-full p-1 border rounded price" value="0"></td>
      <td class="border p-1 text-gray-700 font-semibold amount">₹0.00</td>
      <td class="border p-1 print:hidden"><button class="text-red-600 deleteBtn">🗑️</button></td>
    `;

    row.querySelector(".qty").addEventListener("input", updateTotals);
    row.querySelector(".price").addEventListener("input", updateTotals);
    row.querySelector(".deleteBtn").addEventListener("click", () => {
      row.remove();
      updateTotals();
    });

    itemsBody.appendChild(row);
    updateTotals();
  }

  document.getElementById("addItemBtn").addEventListener("click", addRow);
  addRow();

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  document.getElementById("invoiceDate").value = formattedDate;
  document.getElementById("dueDate").value = formattedDate;
});