// invoices.js

document.addEventListener("DOMContentLoaded", () => {
  // Render the invoice form
  const invoicePrintArea = document.getElementById("invoicePrintArea");
  if (invoicePrintArea) {
    invoicePrintArea.innerHTML = `
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
        <div class="flex flex-col lg:flex-row print:flex-row justify-between gap-6 bg-gray-50 print:bg-gray-200 p-6 rounded-lg border border-gray-300 print:border-gray-400 mb-6">
          <div class="w-full md:w-1/2 space-y-2">
            <label class="text-sm font-medium text-gray-600">Invoice #</label>
            <input type="text" id="invoiceNumber" class="w-full p-2 border rounded" placeholder="INV-2025-001">
            <label class="text-sm font-medium text-gray-600">Invoice Date</label>
            <input type="date" id="invoiceDate" class="w-full p-2 border rounded">
            <label class="text-sm font-medium text-gray-600">Due Date</label>
            <input type="date" id="dueDate" class="w-full p-2 border rounded">
          </div>
          <div class="w-full md:w-1/2 space-y-2">
            <label class="text-sm font-medium text-gray-600">Bill To</label>
            <input type="text" id="clientName" class="w-full p-2 border rounded" placeholder="Client Name">
            <textarea id="clientAddress" class="w-full p-2 border rounded" placeholder="Client Address"></textarea>
            <input type="text" id="clientPhone" class="w-full p-2 border rounded" placeholder="Client Phone">
            <input type="email" id="clientEmail" class="w-full p-2 border rounded" placeholder="Client Email">
          </div>
        </div>
        <table class="w-full text-sm border mb-4">
          <thead class="bg-blue-100 text-gray-800">
            <tr>
              <th class="p-2 border">Item</th>
              <th class="p-2 border">Qty</th>
              <th class="p-2 border">Price (₹)</th>
              <th class="p-2 border">Amount</th>
              <th class="p-2 border print:hidden png-hide">Action</th>
            </tr>
          </thead>
          <tbody id="invoiceItems"></tbody>
        </table>
        <button id="addItemBtn" class="mt-2 mb-6 px-4 py-2 bg-orange-800 text-white rounded hover:bg-orange-900 print:hidden png-hide">+ Add Item</button>
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
        <div class="mt-4 text-right print:hidden png-hide">
          <button id="downloadPngBtn" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ml-2 png-hide">Download as PNG</button>
          <button onclick="window.print()" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 png-hide">Print / Save PDF</button>
          <button id="saveInvoiceBtn" class="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 print:hidden png-hide">Save Invoice</button>
        </div>
        <div class="mt-8 text-center print:block avoid-break print:mt-4 print:pb-4">
          <div class="inline-block">
            <p class="text-sm text-gray-600 italic">Signature</p>
            <p class="text-xl mt-2 font-signature">Vaishnavi</p>
            <p class="text-base italic text-orange-800 font-medium mt-4">Thank you for your business! ❤️</p>
          </div>
        </div>
      </section>
      <section id="allInvoicesSection" class="bg-white p-6 rounded shadow max-w-5xl mx-auto mt-10">
        <h2 class="text-xl font-bold mb-4 text-orange-900">All Invoices</h2>
        <div id="invoicesList" class="overflow-x-auto"></div>
      </section>
    `;
  }

  // Print-safe CSS
  const style = document.createElement("style");
  style.innerHTML = `
    @media print {
      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
        page-break-before: auto;
      }
      .avoid-break * {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;
  document.head.appendChild(style);

  // Center invoice on screen and print, and set max width
  const centerInvoiceStyle = document.createElement("style");
  centerInvoiceStyle.innerHTML = `
    #invoicePrintArea > section {
      max-width: 800px;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      box-sizing: border-box;
    }
    @media (max-width: 850px) {
      #invoicePrintArea > section {
        max-width: 98vw;
        margin: 1vw;
      }
    }
    @media print {
      html, body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      #invoicePrintArea > section {
        width: 190mm !important;
        max-width: 190mm !important;
        min-width: 0 !important;
        margin: 10mm auto !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        background: white !important;
      }
      .print\\:hidden {
        display: none !important;
      }
      .print\\:block {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(centerInvoiceStyle);

  const db = firebase.firestore();
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

  function addRow(item = {}) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-1 text-center align-middle">
        <input type="text" class="w-full p-1 border rounded text-center" placeholder="Item" value="${item.name || ""}">
      </td>
      <td class="border p-1 text-center align-middle">
        <input type="number" class="w-full p-1 border rounded qty text-center" value="${item.qty || 1}">
      </td>
      <td class="border p-1 text-center align-middle">
        <input type="number" class="w-full p-1 border rounded price text-center" value="${item.price || 0}">
      </td>
      <td class="border p-1 text-center align-middle text-gray-700 font-semibold amount">₹${item.amount || "0.00"}</td>
      <td class="border p-1 text-center align-middle print:hidden png-hide">
        <button class="text-red-600 deleteBtn png-hide">🗑️</button>
      </td>
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

  document.getElementById("addItemBtn").addEventListener("click", () => addRow());
  addRow();

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  document.getElementById("invoiceDate").value = formattedDate;
  document.getElementById("dueDate").value = formattedDate;

  document.getElementById("saveInvoiceBtn").addEventListener("click", () => {
    const invoiceData = {
      invoiceNumber: document.getElementById("invoiceNumber").value.trim(),
      invoiceDate: document.getElementById("invoiceDate").value,
      dueDate: document.getElementById("dueDate").value,
      client: {
        name: document.getElementById("clientName").value.trim(),
        address: document.getElementById("clientAddress").value.trim(),
        phone: document.getElementById("clientPhone").value.trim(),
        email: document.getElementById("clientEmail").value.trim()
      },
      items: [],
      notes: document.getElementById("invoiceNotes").value.trim(),
      subtotal: document.getElementById("subtotal").textContent,
      total: document.getElementById("total").textContent,
      createdAt: new Date()
    };

    itemsBody.querySelectorAll("tr").forEach(row => {
      const item = {
        name: row.querySelector("input[type='text']").value,
        qty: parseFloat(row.querySelector(".qty").value) || 0,
        price: parseFloat(row.querySelector(".price").value) || 0,
        amount: row.querySelector(".amount").textContent
      };
      invoiceData.items.push(item);
    });

    db.collection("invoices").add(invoiceData)
      .then(() => {
        alert("Invoice saved successfully!");
        document.getElementById("successSound")?.play();
        loadAllInvoices();
      })
      .catch(err => {
        console.error("Error saving invoice:", err);
        alert("Failed to save invoice.");
      });
  });

  // --- PNG Download with dom-to-image, fit content, no stretch ---
  const setupPngDownload = () => {
    const downloadBtn = document.getElementById("downloadPngBtn");
    if (downloadBtn && window.domtoimage) {
      downloadBtn.addEventListener("click", function() {
        const invoiceSection = document.querySelector("#invoicePrintArea > section");
        const toHide = document.querySelectorAll(".png-hide");

        // Save original styles
        const originalMaxWidth = invoiceSection.style.maxWidth;
        const originalMarginLeft = invoiceSection.style.marginLeft;
        const originalMarginRight = invoiceSection.style.marginRight;
        const originalWidth = invoiceSection.style.width;

        // Hide UI controls
        toHide.forEach(el => el.style.visibility = "hidden");

        // Remove centering and max-width for PNG, set a fixed width
        invoiceSection.style.maxWidth = "none";
        invoiceSection.style.marginLeft = "0";
        invoiceSection.style.marginRight = "0";
        invoiceSection.style.width = "700px";

        setTimeout(function() {
          window.domtoimage.toPng(invoiceSection)
            .then(function(dataUrl) {
              // Restore UI controls and styles
              toHide.forEach(el => el.style.visibility = "");
              invoiceSection.style.maxWidth = originalMaxWidth;
              invoiceSection.style.marginLeft = originalMarginLeft;
              invoiceSection.style.marginRight = originalMarginRight;
              invoiceSection.style.width = originalWidth;

              const link = document.createElement('a');
              link.download = 'invoice.png';
              link.href = dataUrl;
              link.click();
            })
            .catch(function(error) {
              toHide.forEach(el => el.style.visibility = "");
              invoiceSection.style.maxWidth = originalMaxWidth;
              invoiceSection.style.marginLeft = originalMarginLeft;
              invoiceSection.style.marginRight = originalMarginRight;
              invoiceSection.style.width = originalWidth;
              alert('Could not generate image: ' + error);
            });
        }, 100);
      });
    }
  };

  // Wait for dom-to-image to be loaded
  if (window.domtoimage) {
    setupPngDownload();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/dom-to-image@2.6.0/src/dom-to-image.min.js";
    script.onload = setupPngDownload;
    document.head.appendChild(script);
  }

  // --- All Invoices Table (Sorted by Invoice Number Descending) ---
  function loadAllInvoices() {
    const invoicesList = document.getElementById("invoicesList");
    if (!invoicesList) return;
    invoicesList.innerHTML = "Loading...";

    db.collection("invoices").get()
      .then(snapshot => {
        if (snapshot.empty) {
          invoicesList.innerHTML = "<p class='text-gray-500'>No invoices found.</p>";
          return;
        }

        // Convert snapshot to array
        let docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));

        // Sort by invoiceNumber (descending, numeric)
        docs.sort((a, b) => {
          // Extract number part (handles both "29" and "INV-2025-029" formats)
          const numA = parseInt((a.invoiceNumber || "").replace(/\D/g, ""), 10) || 0;
          const numB = parseInt((b.invoiceNumber || "").replace(/\D/g, ""), 10) || 0;
          return numB - numA;
        });

        let html = `
          <table class="w-full text-sm border rounded bg-white">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-2 text-center font-semibold">Invoice #</th>
                <th class="border p-2 text-center font-semibold">Date</th>
                <th class="border p-2 text-center font-semibold">Client</th>
                <th class="border p-2 text-center font-semibold">Total</th>
                <th class="border p-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
        `;

        docs.forEach(d => {
          html += `
            <tr>
              <td class="border p-2 text-center">${d.invoiceNumber || ""}</td>
              <td class="border p-2 text-center">${d.invoiceDate || ""}</td>
              <td class="border p-2 text-center">${d.client?.name || ""}</td>
              <td class="border p-2 text-center">${d.total || ""}</td>
              <td class="border p-2 text-center">
                <button class="text-blue-600 viewInvoiceBtn" data-id="${d.id}">View</button>
                <button class="text-blue-600 printInvoiceBtn" data-id="${d.id}">Print</button>
              </td>
            </tr>
          `;
        });

        html += "</tbody></table>";
        invoicesList.innerHTML = html;

        // Add event listeners for View and Print
        document.querySelectorAll(".viewInvoiceBtn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            await showInvoiceDetails(id);
          });
        });
        document.querySelectorAll(".printInvoiceBtn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            await showInvoiceDetails(id, true);
            setTimeout(() => window.print(), 500);
          });
        });
      })
      .catch(err => {
        invoicesList.innerHTML = "<p class='text-red-500'>Failed to load invoices.</p>";
        console.error(err);
      });
  }

  // Show invoice details in the form
  async function showInvoiceDetails(invoiceId, silentPrint = false) {
    const doc = await db.collection("invoices").doc(invoiceId).get();
    if (!doc.exists) return alert("Invoice not found.");
    const d = doc.data();

    document.getElementById("invoiceNumber").value = d.invoiceNumber || "";
    document.getElementById("invoiceDate").value = d.invoiceDate || "";
    document.getElementById("dueDate").value = d.dueDate || "";
    document.getElementById("clientName").value = d.client?.name || "";
    document.getElementById("clientAddress").value = d.client?.address || "";
    document.getElementById("clientPhone").value = d.client?.phone || "";
    document.getElementById("clientEmail").value = d.client?.email || "";
    document.getElementById("invoiceNotes").value = d.notes || "";

    // Clear and fill items
    itemsBody.innerHTML = "";
    (d.items || []).forEach(item => addRow(item));
    updateTotals();

    if (silentPrint) {
      setTimeout(() => window.print(), 500);
    }
  }

  // Load all invoices on page load
  loadAllInvoices();
});
