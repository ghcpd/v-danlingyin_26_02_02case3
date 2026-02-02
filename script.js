const addBtn = document.getElementById("addBtn");
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const subscriptionBody = document.getElementById("subscriptionBody");
const overviewCards = document.getElementById("overviewCards");
const summaryCards = document.getElementById("summaryCards");
const categoryBreakdown = document.getElementById("categoryBreakdown");
const upcomingList = document.getElementById("upcomingList");
const drawer = document.getElementById("detailDrawer");
const overlay = document.getElementById("overlay");
const closeDrawerBtn = document.getElementById("closeDrawer");
const drawerTitle = document.getElementById("drawerTitle");
const form = document.getElementById("subscriptionForm");
const resetFormBtn = document.getElementById("resetForm");
const idInput = document.getElementById("subscriptionId");
const nameInput = document.getElementById("nameInput");
const categoryInput = document.getElementById("categoryInput");
const statusInput = document.getElementById("statusInput");
const cycleInput = document.getElementById("cycleInput");
const customCycleWrap = document.getElementById("customCycleWrap");
const customMonthsInput = document.getElementById("customMonthsInput");
const costInput = document.getElementById("costInput");
const startDateInput = document.getElementById("startDateInput");
const endDateInput = document.getElementById("endDateInput");

const UPCOMING_THRESHOLD_DAYS = 14;

const initialData = [
  {
    id: crypto.randomUUID(),
    name: "Notion Plus",
    category: "Productivity",
    billingCycle: { type: "monthly" },
    cost: 10,
    startDate: "2023-07-01",
    endDate: null,
    status: "active",
  },
  {
    id: crypto.randomUUID(),
    name: "Spotify Family",
    category: "Entertainment",
    billingCycle: { type: "monthly" },
    cost: 15.99,
    startDate: "2023-03-10",
    endDate: null,
    status: "active",
  },
  {
    id: crypto.randomUUID(),
    name: "Adobe Creative Cloud",
    category: "Design",
    billingCycle: { type: "yearly" },
    cost: 599,
    startDate: "2024-02-01",
    endDate: null,
    status: "active",
  },
  {
    id: crypto.randomUUID(),
    name: "Gym Membership",
    category: "Wellness",
    billingCycle: { type: "custom", months: 3 },
    cost: 150,
    startDate: "2024-12-01",
    endDate: "2025-12-01",
    status: "active",
  },
  {
    id: crypto.randomUUID(),
    name: "Old VPN",
    category: "Utilities",
    billingCycle: { type: "yearly" },
    cost: 70,
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    status: "inactive",
  },
];

const state = {
  subscriptions: structuredClone(initialData),
  filters: { status: "all", category: "all", search: "" },
  view: "overview",
};

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function cycleMonths(sub) {
  if (sub.billingCycle.type === "monthly") return 1;
  if (sub.billingCycle.type === "yearly") return 12;
  return Math.max(1, Number(sub.billingCycle.months || 1));
}

function isActive(sub) {
  const today = new Date();
  if (sub.status === "inactive") return false;
  if (sub.endDate && new Date(sub.endDate) < today) return false;
  return true;
}

function nextRenewalDate(sub, reference = new Date()) {
  if (!isActive(sub)) return null;
  const step = cycleMonths(sub);
  let cursor = new Date(sub.startDate);
  if (reference < cursor) return cursor;
  let safety = 0;
  while (cursor <= reference && safety < 1200) {
    cursor = addMonths(cursor, step);
    safety += 1;
  }
  if (sub.endDate && cursor > new Date(sub.endDate)) return null;
  return cursor;
}

function monthlyCost(sub) {
  return Number(sub.cost) / cycleMonths(sub);
}

function yearlyCost(sub) {
  return monthlyCost(sub) * 12;
}

function effectiveStatus(sub) {
  return isActive(sub) ? "active" : "inactive";
}

function applyFilters(list) {
  const search = state.filters.search.trim().toLowerCase();
  return list.filter((sub) => {
    const statusMatch = state.filters.status === "all" || effectiveStatus(sub) === state.filters.status;
    const categoryMatch = state.filters.category === "all" || sub.category === state.filters.category;
    const searchMatch = !search || sub.name.toLowerCase().includes(search) || sub.category.toLowerCase().includes(search);
    return statusMatch && categoryMatch && searchMatch;
  });
}

function renderOverview() {
  const filtered = applyFilters(state.subscriptions);
  renderOverviewCards();
  renderTable(filtered);
  populateCategories();
}

function renderOverviewCards() {
  const activeSubs = state.subscriptions.filter(isActive);
  const upcoming = activeSubs.filter((sub) => {
    const next = nextRenewalDate(sub);
    if (!next) return false;
    const diff = (next - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= UPCOMING_THRESHOLD_DAYS && diff >= 0;
  });
  const monthlyTotal = activeSubs.reduce((sum, sub) => sum + monthlyCost(sub), 0);
  const yearlyTotal = activeSubs.reduce((sum, sub) => sum + yearlyCost(sub), 0);

  overviewCards.innerHTML = `
    ${card("Monthly burn", formatCurrency(monthlyTotal), "per month")}
    ${card("Yearly burn", formatCurrency(yearlyTotal), "per year")}
    ${card("Active subscriptions", activeSubs.length.toString())}
    ${card("Upcoming renewals", upcoming.length.toString(), `${UPCOMING_THRESHOLD_DAYS}-day window`)}
  `;
}

function card(title, value, pillText = "") {
  return `
    <article class="card">
      <h3>${title}</h3>
      <p class="value">${value}</p>
      ${pillText ? `<span class="pill">${pillText}</span>` : ""}
    </article>
  `;
}

function renderTable(rows) {
  if (!rows.length) {
    subscriptionBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--muted);">No subscriptions match the filter.</td></tr>`;
    return;
  }

  subscriptionBody.innerHTML = rows
    .map((sub) => {
      const status = effectiveStatus(sub);
      const next = nextRenewalDate(sub);
      const upcomingClass = next && daysUntil(next) <= UPCOMING_THRESHOLD_DAYS ? "upcoming" : "";
      const cycle = sub.billingCycle.type === "custom" ? `${sub.billingCycle.months} mo` : sub.billingCycle.type;
      return `
        <tr class="${upcomingClass}">
          <td>${sub.name}</td>
          <td><span class="tag">${sub.category}</span></td>
          <td><span class="badge ${status}">${status}</span></td>
          <td>${cycle}</td>
          <td>${formatCurrency(monthlyCost(sub))}</td>
          <td>${next ? formatDate(next) : "—"}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-action="edit" data-id="${sub.id}">Edit</button>
              <button class="icon-btn" data-action="delete" data-id="${sub.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSummary() {
  const activeSubs = state.subscriptions.filter(isActive);
  const monthlyTotal = activeSubs.reduce((sum, sub) => sum + monthlyCost(sub), 0);
  const yearlyTotal = monthlyTotal * 12;
  const avgPerSub = activeSubs.length ? monthlyTotal / activeSubs.length : 0;
  summaryCards.innerHTML = `
    ${card("Monthly burn", formatCurrency(monthlyTotal))}
    ${card("Yearly burn", formatCurrency(yearlyTotal))}
    ${card("Active count", activeSubs.length.toString())}
    ${card("Avg per sub (mo)", formatCurrency(avgPerSub))}
  `;

  const breakdown = categoryTotals(activeSubs);
  categoryBreakdown.innerHTML = breakdown.length
    ? breakdown
        .map(
          (item) => `
            <li class="list-item">
              <div>
                <div>${item.category}</div>
                <div class="meta">${item.count} subs • ${formatCurrency(item.monthly)} / mo</div>
              </div>
              <strong>${formatCurrency(item.yearly)} / yr</strong>
            </li>
          `
        )
        .join("")
    : `<li class="list-item">No active subscriptions.</li>`;

  const upcoming = activeSubs
    .map((sub) => ({ sub, next: nextRenewalDate(sub) }))
    .filter(({ next }) => next && daysUntil(next) <= UPCOMING_THRESHOLD_DAYS)
    .sort((a, b) => a.next - b.next);

  upcomingList.innerHTML = upcoming.length
    ? upcoming
        .map(
          ({ sub, next }) => `
            <li class="list-item">
              <div>
                <div>${sub.name}</div>
                <div class="meta">${sub.category} • renews ${formatDate(next)}</div>
              </div>
              <strong>${formatCurrency(monthlyCost(sub))} / mo</strong>
            </li>
          `
        )
        .join("")
    : `<li class="list-item">No renewals in the next ${UPCOMING_THRESHOLD_DAYS} days.</li>`;
}

function categoryTotals(list) {
  const map = new Map();
  list.forEach((sub) => {
    const entry = map.get(sub.category) || { category: sub.category, monthly: 0, yearly: 0, count: 0 };
    entry.monthly += monthlyCost(sub);
    entry.yearly += yearlyCost(sub);
    entry.count += 1;
    map.set(sub.category, entry);
  });
  return [...map.values()].sort((a, b) => b.monthly - a.monthly);
}

function populateCategories() {
  const categories = Array.from(new Set(state.subscriptions.map((s) => s.category))).sort();
  const opts = ["<option value=\"all\">All</option>", ...categories.map((c) => `<option value="${c}">${c}</option>`)];
  categoryFilter.innerHTML = opts.join("");
}

function daysUntil(date) {
  return Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
}

function openDrawer(editing = false) {
  drawer.classList.add("open");
  overlay.classList.add("visible");
  drawerTitle.textContent = editing ? "Edit Subscription" : "Add Subscription";
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("visible");
  form.reset();
  idInput.value = "";
  toggleCustomCycle();
}

function toggleCustomCycle() {
  customCycleWrap.classList.toggle("hidden", cycleInput.value !== "custom");
}

function loadSubToForm(sub) {
  idInput.value = sub.id;
  nameInput.value = sub.name;
  categoryInput.value = sub.category;
  statusInput.value = sub.status;
  cycleInput.value = sub.billingCycle.type;
  if (sub.billingCycle.type === "custom") {
    customMonthsInput.value = sub.billingCycle.months;
  }
  costInput.value = sub.cost;
  startDateInput.value = sub.startDate;
  endDateInput.value = sub.endDate || "";
  toggleCustomCycle();
}

function deleteSub(id) {
  state.subscriptions = state.subscriptions.filter((s) => s.id !== id);
  renderAll();
}

function saveSub(event) {
  event.preventDefault();
  const payload = {
    id: idInput.value || crypto.randomUUID(),
    name: nameInput.value.trim(),
    category: categoryInput.value.trim() || "Uncategorized",
    status: statusInput.value,
    billingCycle:
      cycleInput.value === "custom"
        ? { type: "custom", months: Math.max(1, Number(customMonthsInput.value || 1)) }
        : { type: cycleInput.value },
    cost: Number(costInput.value || 0),
    startDate: startDateInput.value,
    endDate: endDateInput.value || null,
  };

  const exists = state.subscriptions.find((s) => s.id === payload.id);
  if (exists) {
    state.subscriptions = state.subscriptions.map((s) => (s.id === payload.id ? payload : s));
  } else {
    state.subscriptions = [payload, ...state.subscriptions];
  }

  renderAll();
  closeDrawer();
}

function handleTableClick(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  const id = event.target.dataset.id;
  if (action === "edit") {
    const sub = state.subscriptions.find((s) => s.id === id);
    if (!sub) return;
    loadSubToForm(sub);
    openDrawer(true);
  }
  if (action === "delete") {
    deleteSub(id);
  }
}

function handleTabChange(target) {
  state.view = target.dataset.view;
  tabs.forEach((tab) => tab.classList.toggle("active", tab === target));
  views.forEach((view) => view.classList.toggle("active", view.id === state.view));
  renderAll();
}

function renderAll() {
  renderOverview();
  renderSummary();
}

function init() {
  renderAll();
  addBtn.addEventListener("click", () => {
    form.reset();
    idInput.value = "";
    startDateInput.valueAsDate = new Date();
    toggleCustomCycle();
    openDrawer(false);
  });

  tabs.forEach((tab) => tab.addEventListener("click", () => handleTabChange(tab)));
  subscriptionBody.addEventListener("click", handleTableClick);
  closeDrawerBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  cycleInput.addEventListener("change", toggleCustomCycle);
  form.addEventListener("submit", saveSub);
  resetFormBtn.addEventListener("click", () => form.reset());

  statusFilter.addEventListener("change", (e) => {
    state.filters.status = e.target.value;
    renderOverview();
  });
  categoryFilter.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    renderOverview();
  });
  searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    renderOverview();
  });
}

init();
