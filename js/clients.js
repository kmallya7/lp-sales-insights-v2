document.addEventListener("DOMContentLoaded", () => {
  const clientsSection = document.getElementById("clients");
  clientsSection.innerHTML = `
    <section class="bg-white p-6 rounded shadow max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold mb-4 flex items-center">
        <span class="mr-2">👥</span> Clients
      </h2>

      <form id="client-form" class="space-y-4 mb-6">
        <input type="text" id="client-name" placeholder="Client Name" class="w-full p-2 border rounded" required />
        <input type="text" id="client-contact" placeholder="Contact Info (Phone/Email)" class="w-full p-2 border rounded" />
        <textarea id="client-notes" placeholder="Notes (Optional)" class="w-full p-2 border rounded"></textarea>
        <button type="submit" id="client-submit-btn" class="bg-black text-white px-4 py-2 rounded w-full">+ Add Client</button>
      </form>

      <div id="client-list" class="space-y-4"></div>
    </section>
  `;

  const db = window.db;
  let editingClientId = null;

  document.getElementById("client-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("client-name").value.trim();
    const contact = document.getElementById("client-contact").value.trim();
    const notes = document.getElementById("client-notes").value.trim();

    if (!name) return;

    if (editingClientId) {
      await db.collection("clients").doc(editingClientId).update({ name, contact, notes });
      editingClientId = null;
      document.getElementById("client-submit-btn").textContent = "+ Add Client";
    } else {
      await db.collection("clients").add({ name, contact, notes, createdAt: new Date() });
    }

    e.target.reset();
    loadClients();
  });

  async function loadClients() {
    const list = document.getElementById("client-list");
    const snapshot = await db.collection("clients").orderBy("createdAt", "desc").get();
    list.innerHTML = "";

    for (const doc of snapshot.docs) {
      const c = doc.data();
      const id = doc.id;
      const logSnapshot = await db.collection("dailyLogs").where("client", "==", c.name).get();
      const totalOrders = logSnapshot.size;
      const totalRevenue = logSnapshot.docs.reduce((sum, d) => sum + (d.data().revenue || 0), 0);

      const card = document.createElement("div");
      card.className = "bg-gray-50 p-4 rounded border flex justify-between items-start";

      card.innerHTML = `
        <div>
          <p class="font-semibold text-gray-800 text-lg">${c.name}</p>
          <p class="text-sm text-gray-600 mt-1">📞 ${c.contact || "-"}</p>
          <p class="text-sm text-gray-600">📝 ${c.notes || "-"}</p>
          <p class="text-sm text-gray-700 mt-1">Total Orders: <strong>${totalOrders}</strong> &nbsp;&nbsp; Total Revenue: <strong>₹${totalRevenue.toFixed(2)}</strong></p>
        </div>
        <div class="flex space-x-3">
          <button onclick="window.editClient('${id}', \`${escapeStr(c.name)}\`, \`${escapeStr(c.contact)}\`, \`${escapeStr(c.notes)}\`)" title="Edit">
            ✏️
          </button>
          <button onclick="window.deleteClient('${id}')" title="Delete">
            🗑️
          </button>
        </div>
      `;
      list.appendChild(card);
    }
  }

  function escapeStr(str) {
    return (str || "").replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }

  window.editClient = function (id, name, contact, notes) {
    document.getElementById("client-name").value = name;
    document.getElementById("client-contact").value = contact;
    document.getElementById("client-notes").value = notes;
    document.getElementById("client-submit-btn").textContent = "Update Client";
    editingClientId = id;
  };

  window.deleteClient = async function (id) {
    if (confirm("Are you sure you want to delete this client?")) {
      await db.collection("clients").doc(id).delete();
      loadClients();
    }
  };

  loadClients();
});