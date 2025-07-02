// clients.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Render the Clients Section UI (modernized, minimal, clean)
  const clientsSection = document.getElementById("clients");
  clientsSection.innerHTML = `
    <section class="bg-white p-7 rounded-2xl shadow-lg max-w-3xl mx-auto mt-8 border border-gray-200">
      <div class="mb-6 flex items-center gap-3">
        <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 shadow text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </span>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Clients</h2>
        <div class="ml-4 flex items-center">
          <div class="relative w-12 h-12">
            <svg id="clients-ring" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" stroke-width="6"/>
              <circle id="clients-ring-bar" cx="24" cy="24" r="20" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="125.66" stroke-dashoffset="125.66" />
            </svg>
            <span id="clients-count" class="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">0</span>
          </div>
        </div>
        <button id="show-add-client-form" class="ml-auto bg-gradient-to-br from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-base shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add Client</span>
        </button>
      </div>
      <div id="client-list" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    </section>
    <div id="client-form-overlay" class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center hidden">
      <form id="client-form" class="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-lg relative animate-fade-in">
        <button type="button" id="client-cancel-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h3 class="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span id="client-form-title">Add Client</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="client-name" class="block text-xs font-semibold text-gray-700 mb-1">Client Name <span class="text-red-500">*</span></label>
            <input type="text" id="client-name" placeholder="e.g. Le Pastry" class="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
          </div>
          <div>
            <label for="client-contact-person" class="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
            <input type="text" id="client-contact-person" placeholder="e.g. Priya Sharma" class="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
            <label for="client-phone" class="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
            <input type="text" id="client-phone" placeholder="e.g. 9876543210" class="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
            <label for="client-address" class="block text-xs font-semibold text-gray-700 mb-1">Address</label>
            <input type="text" id="client-address" placeholder="e.g. 123, MG Road, Bangalore" class="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
        </div>
        <div class="flex gap-2 mt-7">
          <button type="submit" id="client-submit-btn" class="bg-gradient-to-br from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold transition w-full flex items-center justify-center gap-2 text-base shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span id="client-submit-label">Add Client</span>
          </button>
        </div>
      </form>
    </div>
    <style>
      @keyframes fade-in { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      .animate-fade-in { animation: fade-in 0.2s ease; }
      #client-list .client-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
      #client-list .client-card:hover { box-shadow: 0 6px 24px 0 rgba(60,72,88,0.10); border-color: #6366f1; }
    </style>
  `;

  // 2. Initialize variables
  const db = window.db;
  let editingClientId = null;

  // 3. Show/Hide Overlay Add Client Form
  const addBtn = document.getElementById("show-add-client-form");
  const overlay = document.getElementById("client-form-overlay");
  const form = document.getElementById("client-form");
  const cancelBtn = document.getElementById("client-cancel-btn");
  const formTitle = document.getElementById("client-form-title");
  const submitLabel = document.getElementById("client-submit-label");

  addBtn.addEventListener("click", () => {
    overlay.classList.remove("hidden");
    form.reset();
    editingClientId = null;
    formTitle.textContent = "Add Client";
    submitLabel.textContent = "Add Client";
  });

  cancelBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    form.reset();
    editingClientId = null;
    formTitle.textContent = "Add Client";
    submitLabel.textContent = "Add Client";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
      form.reset();
      editingClientId = null;
      formTitle.textContent = "Add Client";
      submitLabel.textContent = "Add Client";
    }
  });

  // 4. Handle form submission for adding/updating clients
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("client-name").value.trim();
    const contactPerson = document.getElementById("client-contact-person").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const address = document.getElementById("client-address").value.trim();

    if (!name) {
      showToast("Client name is required.", "error");
      return;
    }

    if (editingClientId) {
      await db.collection("clients").doc(editingClientId).update({ name, contactPerson, phone, address });
      editingClientId = null;
      showToast("Client updated!", "success");
    } else {
      await db.collection("clients").add({ name, contactPerson, phone, address, createdAt: new Date() });
      showToast("Client added!", "success");
    }

    e.target.reset();
    overlay.classList.add("hidden");
    loadClients();
  });

  // 5. Load and display all clients as cards, and update number ring
  async function loadClients() {
    const list = document.getElementById("client-list");
    const snapshot = await db.collection("clients").orderBy("createdAt", "desc").get();
    list.innerHTML = "";

    // Number ring update
    const count = snapshot.size;
    updateClientsRing(count);

    if (snapshot.empty) {
      list.innerHTML = `<div class="text-center text-gray-400 py-12 text-base col-span-2">No clients yet.<br><span class="text-gray-300">Click <b>Add Client</b> to get started.</span></div>`;
      return;
    }

    for (const doc of snapshot.docs) {
      const c = doc.data();
      const id = doc.id;

      // Card style with modern icons (Lucide)
      const card = document.createElement("div");
      card.className = "client-card rounded-xl border border-gray-200 p-6 flex flex-col gap-4 relative group transition hover:shadow-lg";

      card.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="bg-indigo-50 rounded-full p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 21V9h6v12" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div>
            <div class="font-semibold text-lg text-gray-900">${c.name}</div>
            <div class="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
                </svg>
                ${c.contactPerson ? `<span>${c.contactPerson}</span>` : "-"}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72a2 2 0 0 1 1.72 2z"/>
                </svg>
                ${c.phone ? `<span>${c.phone}</span>` : "-"}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </svg>
                ${c.address ? `<span>${c.address}</span>` : "-"}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
          <button
            class="edit-btn p-1.5 rounded hover:bg-indigo-100 transition"
            title="Edit"
            data-id="${id}"
            data-name="${escapeStr(c.name)}"
            data-contact-person="${escapeStr(c.contactPerson)}"
            data-phone="${escapeStr(c.phone)}"
            data-address="${escapeStr(c.address)}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            class="delete-btn p-1.5 rounded hover:bg-red-100 transition"
            title="Delete"
            data-id="${id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      `;
      list.appendChild(card);
    }

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const { id, name, contactPerson, phone, address } = btn.dataset;
        editClient(id, name, contactPerson, phone, address);
      });
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const { id } = btn.dataset;
        await deleteClient(id);
      });
    });
  }

  // 6. Utility function to safely escape strings for use in HTML attributes
  function escapeStr(str) {
    return (str || "")
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 7. Edit client handler (switches form to edit mode)
  function editClient(id, name, contactPerson, phone, address) {
    overlay.classList.remove("hidden");
    document.getElementById("client-name").value = name;
    document.getElementById("client-contact-person").value = contactPerson;
    document.getElementById("client-phone").value = phone;
    document.getElementById("client-address").value = address;
    formTitle.textContent = "Edit Client";
    submitLabel.textContent = "Update Client";
    editingClientId = id;
  }

  // 8. Delete client handler with confirmation and feedback
  async function deleteClient(id) {
    if (confirm("Are you sure you want to delete this client? This cannot be undone.")) {
      await db.collection("clients").doc(id).delete();
      showToast("Client deleted.", "success");
      loadClients();
    }
  }

  // 9. Toast notification for feedback
  function showToast(message, type = "info") {
    let toast = document.getElementById("toast-message");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-message";
      toast.className = "fixed top-6 right-6 z-50 px-5 py-2.5 rounded-lg shadow-lg text-white font-semibold text-base transition opacity-0 pointer-events-none";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className =
      "fixed top-6 right-6 z-50 px-5 py-2.5 rounded-lg shadow-lg text-white font-semibold text-base transition " +
      (type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-gray-800");
    toast.style.opacity = "1";
    toast.style.pointerEvents = "auto";
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.pointerEvents = "none";
    }, 2000);
  }

  // 10. Number ring update function
  function updateClientsRing(count) {
    const max = 20;
    const percent = Math.min(count / max, 1);
    const circle = document.getElementById("clients-ring-bar");
    const circumference = 2 * Math.PI * 20;
    const offset = circumference * (1 - percent);
    if (circle) {
      circle.setAttribute("stroke-dasharray", circumference.toFixed(2));
      circle.setAttribute("stroke-dashoffset", offset.toFixed(2));
    }
    const countSpan = document.getElementById("clients-count");
    if (countSpan) countSpan.textContent = count;
  }

  // 11. Initial load of clients when the page is ready
  loadClients();
});
