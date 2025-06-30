// clients.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Render the Clients Section UI (neutral, compact, scalable, aesthetic icons)
  const clientsSection = document.getElementById("clients");
  clientsSection.innerHTML = `
    <section class="bg-white p-5 rounded-lg shadow max-w-2xl mx-auto mt-6 border border-gray-100">
      <div class="mb-4 flex items-center gap-2">
        <!-- Custom Clients Icon (SVG provided by user) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6 text-gray-500">
          <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
          <path fill-rule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clip-rule="evenodd" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800 tracking-tight">Clients</h2>
      </div>
      <form id="client-form" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 bg-gray-50 p-4 rounded border border-gray-100">
        <div>
          <label for="client-name" class="block text-xs font-medium text-gray-700 mb-1">Client Name <span class="text-red-500">*</span></label>
          <input type="text" id="client-name" placeholder="e.g. Le Pastry" class="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200" required />
        </div>
        <div>
          <label for="client-contact-person" class="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
          <input type="text" id="client-contact-person" placeholder="e.g. Priya Sharma" class="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200" />
        </div>
        <div>
          <label for="client-phone" class="block text-xs font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" id="client-phone" placeholder="e.g. 9876543210" class="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200" />
        </div>
        <div>
          <label for="client-address" class="block text-xs font-medium text-gray-700 mb-1">Address</label>
          <input type="text" id="client-address" placeholder="e.g. 123, MG Road, Bangalore" class="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200" />
        </div>
        <div class="md:col-span-2 flex gap-2 mt-1">
          <button type="submit" id="client-submit-btn" class="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded font-medium transition w-full md:w-auto flex-1 flex items-center justify-center gap-2 text-sm">
            <!-- Plus Icon (Heroicons Outline) -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Client</span>
          </button>
          <button type="button" id="client-cancel-btn" class="hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium transition w-full md:w-auto flex-1 text-sm">
            Cancel
          </button>
        </div>
      </form>
      <div id="client-list" class="divide-y divide-gray-100"></div>
    </section>
  `;

  // 2. Initialize variables
  const db = window.db;
  let editingClientId = null;

  // 3. Handle form submission for adding/updating clients
  document.getElementById("client-form").addEventListener("submit", async (e) => {
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
      document.getElementById("client-submit-btn").innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Client</span>
      `;
      document.getElementById("client-cancel-btn").classList.add("hidden");
      showToast("Client updated!", "success");
    } else {
      await db.collection("clients").add({ name, contactPerson, phone, address, createdAt: new Date() });
      showToast("Client added!", "success");
    }

    e.target.reset();
    loadClients();
  });

  // 4. Handle cancel button (for edit mode)
  document.getElementById("client-cancel-btn").addEventListener("click", () => {
    editingClientId = null;
    document.getElementById("client-form").reset();
    document.getElementById("client-submit-btn").innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>Add Client</span>
    `;
    document.getElementById("client-cancel-btn").classList.add("hidden");
  });

  // 5. Load and display all clients
  async function loadClients() {
    const list = document.getElementById("client-list");
    const snapshot = await db.collection("clients").orderBy("createdAt", "desc").get();
    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = `<div class="text-center text-gray-400 py-8 text-sm">No clients yet. Add your first client above.</div>`;
      return;
    }

    // Responsive grid for many clients, scrollable if >8
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col gap-0 max-h-[60vh] overflow-y-auto";

    for (const doc of snapshot.docs) {
      const c = doc.data();
      const id = doc.id;

      const card = document.createElement("div");
      card.className = "flex items-center justify-between py-3 px-1 bg-white hover:bg-gray-50 transition group";

      card.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 truncate text-base">${c.name}</div>
          <div class="flex flex-wrap gap-3 text-xs text-gray-500 mt-0.5">
            <span>${c.contactPerson ? `<span class="font-normal">${c.contactPerson}</span>` : "-"}</span>
            <span>${c.phone ? `<span class="font-normal">${c.phone}</span>` : "-"}</span>
            <span>${c.address ? `<span class="font-normal">${c.address}</span>` : "-"}</span>
          </div>
        </div>
        <div class="flex gap-1 ml-2">
          <button
            class="edit-btn p-1 rounded hover:bg-gray-200 transition"
            title="Edit"
            data-id="${id}"
            data-name="${escapeStr(c.name)}"
            data-contact-person="${escapeStr(c.contactPerson)}"
            data-phone="${escapeStr(c.phone)}"
            data-address="${escapeStr(c.address)}"
          >
            <!-- Heroicons: Pencil Square -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 group-hover:text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182l-9.193 9.193a2.25 2.25 0 0 1-1.06.592l-3.25.813a.375.375 0 0 1-.456-.456l.813-3.25a2.25 2.25 0 0 1 .592-1.06l9.193-9.193Z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 6.75l-1.5-1.5" />
            </svg>
          </button>
          <button
            class="delete-btn p-1 rounded hover:bg-gray-200 transition"
            title="Delete"
            data-id="${id}"
          >
            <!-- Heroicons: Trash -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 7.5V6.75A2.25 2.25 0 0 1 8.25 4.5h7.5A2.25 2.25 0 0 1 18 6.75V7.5m-9 0h9m-9 0v10.125A2.625 2.625 0 0 0 8.625 20.25h6.75A2.625 2.625 0 0 0 18 17.625V7.5m-9 0h9m-3 3v6m-3-6v6" />
            </svg>
          </button>
        </div>
      `;
      wrapper.appendChild(card);
    }

    list.appendChild(wrapper);

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
    document.getElementById("client-name").value = name;
    document.getElementById("client-contact-person").value = contactPerson;
    document.getElementById("client-phone").value = phone;
    document.getElementById("client-address").value = address;
    document.getElementById("client-submit-btn").innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>Update Client</span>
    `;
    document.getElementById("client-cancel-btn").classList.remove("hidden");
    editingClientId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      toast.className = "fixed top-6 right-6 z-50 px-5 py-2 rounded shadow-lg text-white font-medium text-sm transition opacity-0 pointer-events-none";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className =
      "fixed top-6 right-6 z-50 px-5 py-2 rounded shadow-lg text-white font-medium text-sm transition " +
      (type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-gray-700");
    toast.style.opacity = "1";
    toast.style.pointerEvents = "auto";
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.pointerEvents = "none";
    }, 2000);
  }

  // 10. Initial load of clients when the page is ready
  loadClients();
});
