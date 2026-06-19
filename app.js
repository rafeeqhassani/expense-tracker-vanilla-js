import {
  addExpense,
  deleteExpense,
  editExpense,
  updateExpense,
  totalCalculate,
  searchExpenses,
  sortExpenses,
  checkboxChange,
  clearSelectedExpenses,
  filterByMonth,
  validateForm,
  normalizedData,
  isSameData,
} from "./expense.js";

import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";

import {
  renderExpenses,
  clearAllExpenses,
  renderMsg,
  createCategoryOptions,
  toastMessage,
} from "./ui.js";

const elements = {
  menuBtn: document.querySelector(".menu-btn"),
  addExpenseBtn: document.querySelector(".add-btn"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.querySelector(".sidebar-overlay"),
  sidebarClosebtn: document.querySelector(".close-btn"),

  totalAmount: document.querySelectorAll(".total"),
  monthlyTotal: document.querySelectorAll(".monthly"),
  records: document.querySelectorAll(".records"),

  openForm: document.getElementById("openForm"),

  searchInput: document.getElementById("searchExpenses"),
  filterMonthSelect: document.getElementById("filterByMonth"),
  sortSelection: document.getElementById("sortSelection"),

  cardContainer: document.getElementById("cardContainer"),
  tableWrapper: document.querySelector(".table-wrapper"),
  tBody: document.getElementById("tableBody"),

  loadMore: document.getElementById("loadMore"),
  loadMoreMessage: document.getElementById("loadMoreMessage"),
  clearSelected: document.getElementById("clearSelected"),
  clearFiltered: document.getElementById("clearFiltered"),
  clearAll: document.getElementById("clearAll"),

  formOverlay: document.getElementById("formOverlay"),
  form: document.getElementById("expenseForm"),
  titleInput: document.getElementById("title"),
  amountInput: document.getElementById("amount"),
  selectCategory: document.getElementById("selectCategory"),
  categoryInput: document.getElementById("customCategory"),
  dateInput: document.getElementById("dateInput"),
  closeForm: document.getElementById("closeForm"),

  validateTitle: document.querySelector(".validate-title"),
  validateAmount: document.querySelector(".validate-amount"),
  validateCategory: document.querySelector(".validate-category"),
  validateDate: document.querySelector(".validate-date"),

  submitBtn: document.querySelector(".submit-button"),
  toastContainer: document.getElementById("toastContainer"),
};

const state = {
  expenses: [],
  visibleCount: 40,

  filters: {
    title: "",
    month: "all",
    sortBy: "smallest",
  },

  formData: {
    title: "",
    amount: "",
    category: "",
    customCategory: "",
    date: "",
  },

  errors: {},
  touched: {},
  submitAttemted: false,

  mode: "add",
  editingId: null,
  isSubmitting: false,
};

try {
  const stored = getFromLocalStorage("expenses") || [];
  state.expenses = stored.map((item) => ({
    ...item,
    selected: typeof item.selected === "boolean" ? item.selected : false,
  }));
} catch (e) {
  state.expenses = [];
}

try {
  const storedVisible = Number(getFromLocalStorage("visibleCount"));

  state.visibleCount =
    Number.isFinite(storedVisible) && storedVisible > 0 ? storedVisible : 40;
} catch {
  state.visibleCount = 40;
}

function getFilteredExpenses() {
  const searched = searchExpenses(state.expenses, state.filters.title);
  const sorted = sortExpenses(searched, state.filters.sortBy);

  return state.filters.month === "all"
    ? sorted
    : filterByMonth(sorted, Number(state.filters.month));
}

function getVisibleExpenses(data) {
  return data.slice(0, state.visibleCount);
}

function initFilters() {
  state.filters = {
    title: "",
    month: "all",
    sortBy: "smallest",
  };
}

function hasActiveFilters() {
  return (
    state.filters.title !== "" ||
    state.filters.month !== "all" ||
    state.filters.sortBy !== "smallest"
  );
}

function commit() {
  render();
}

function render() {
  const filtered = getFilteredExpenses();
  const visible = getVisibleExpenses(filtered);

  renderSummaryUI(filtered);
  renderTableUI(visible, filtered);
  renderMessagesUI(filtered);
  renderLoadMoreUI(filtered);
  renderValidationUI(state.errors);
  renderSubmitButtonUI(state.mode);
  renderCategoriesUI();

  elements.clearFiltered.classList.toggle("hidden", !hasActiveFilters());
}

function renderTableUI(visible, filtered) {
  elements.tBody.innerHTML = "";

  const container = elements.cardContainer;
  const wrapper = elements.tableWrapper;

  const existing = container.querySelector(".empty-list-message");
  if (existing) existing.remove();

  if (state.expenses.length === 0) {
    wrapper.classList.add("hidden");
    container.appendChild(renderMsg("No expenses added yet"));
    return;
  }

  if (filtered.length === 0) {
    wrapper.classList.add("hidden");
    container.appendChild(renderMsg("No expenses found"));
    return;
  }

  wrapper.classList.remove("hidden");

  visible.forEach((exp) => {
    elements.tBody.appendChild(renderExpenses(exp));
  });
}

function renderSummaryUI(filtered) {
  const total = totalCalculate(state.expenses);
  const monthly = totalCalculate(filtered);

  elements.totalAmount.forEach((el) => (el.textContent = `$${total}`));
  elements.monthlyTotal.forEach((el) => (el.textContent = `$${monthly}`));
  elements.records.forEach((el) => (el.textContent = state.expenses.length));
}

function renderLoadMoreUI(filtered) {
  const total = filtered.length;
  const visible = state.visibleCount;

  if (total === 0) {
    elements.loadMoreMessage.textContent = "No expenses to load";
    elements.loadMore.classList.add("hidden");
    return;
  }

  if (total > visible) {
    elements.loadMoreMessage.textContent = "";
    elements.loadMore.classList.remove("hidden");
    return;
  }

  elements.loadMoreMessage.textContent = "No more expenses exist";
  elements.loadMore.classList.add("hidden");
}

function renderSubmitButtonUI(mode) {
  elements.submitBtn.textContent =
    mode === "add" ? "Add Expense" : "Update Expense";
}

function shouldShowError(field) {
  return (state.submitAttemted || state.touched[field]) && state.errors[field];
}

function renderValidationUI(errors) {
  if (!state.submitAttemted && Object.keys(state.touched).length === 0) {
    clearValidationErrors();
    return;
  }

  elements.validateTitle.textContent = shouldShowError("title")
    ? errors.title
    : "";
  elements.validateAmount.textContent = shouldShowError("amount")
    ? errors.amount
    : "";
  elements.validateCategory.textContent = shouldShowError("category")
    ? errors.category
    : "";
  elements.validateDate.textContent = shouldShowError("date")
    ? errors.date
    : "";
}

function clearValidationErrors() {
  elements.validateTitle.textContent = "";
  elements.validateAmount.textContent = "";
  elements.validateCategory.textContent = "";
  elements.validateDate.textContent = "";
}

function renderMessagesUI(filtered) {
  const container = elements.cardContainer;

  const existing = container.querySelector(".empty-list-message");
  if (existing) existing.remove();

  if (state.expenses.length === 0) {
    container.appendChild(renderMsg("No expenses added yet"));
  } else if (filtered.length === 0) {
    container.appendChild(renderMsg("No expenses found"));
  }
}

function resetForm() {
  state.errors = {};
  state.touched = {};
  state.submitAttemted = false;

  state.formData = {
    title: "",
    amount: "",
    category: "",
    customCategory: "",
    date: "",
  };

  state.mode = "add";
  state.editingId = null;

  elements.form.reset();
  clearValidationErrors();
}

function handleSubmit(e) {
  e.preventDefault();

  if (state.isSubmitting) return;
  state.isSubmitting = true;

  state.submitAttemted = true;

  const errors = validateForm(state.formData);

  if (Object.keys(errors).length > 0) {
    state.errors = errors;
    state.isSubmitting = false;
    commit();
    return;
  }

  const finalCategory =
    state.formData.customCategory || state.formData.category;

  const newData = normalizedData({
    ...state.formData,
    category: finalCategory,
  });

  try {
    if (state.mode === "add") {
      state.expenses = addExpense(state.expenses, newData);
    } else {
      const existing = state.expenses.find((e) => e.id === state.editingId);

      if (!existing) return;

      if (isSameData(existing, newData)) {
        showToastMessage("No changes detected", "info");
        return;
      }

      state.expenses = updateExpense(state.expenses, state.editingId, newData);
    }

    showToastMessage(
      state.mode === "add" ? "Expense added" : "Expense updated",
      "success",
    );

    resetForm();
    closeForm();
    saveToLocalStorage("expenses", state.expenses);
    renderCategoriesUI();
  } finally {
    state.isSubmitting = false;
  }

  commit();
}

function updateScrollLock() {
  const isSidebarOpen = elements.sidebar.classList.contains("active");

  const isFormOpen = !elements.formOverlay.classList.contains("hidden");

  document.body.classList.toggle("no-scroll", isSidebarOpen || isFormOpen);
}

const openForm = () => {
  state.isFormOpen = true;
  elements.formOverlay.classList.remove("hidden");
  updateScrollLock();
};

const closeForm = () => {
  state.isFormOpen = false;
  elements.formOverlay.classList.add("hidden");
  updateScrollLock();
};

let lastToastKey = null;

function showToastMessage(message, type = "success") {
  const key = `${message}-${type}`;
  if (lastToastKey === key) return;

  lastToastKey = key;
  setTimeout(() => (lastToastKey = null), 2500);

  const toast = toastMessage(message, type);
  elements.toastContainer.appendChild(toast);
}

function handleDeleteExpense(id) {
  state.expenses = deleteExpense(state.expenses, id);
  saveToLocalStorage("expenses", state.expenses);
  showToastMessage("Expense deleted", "success");
  commit();
}

function handleEditExpense(id) {
  const expense = editExpense(state.expenses, id);
  if (!expense) return;

  state.mode = "edit";
  state.editingId = id;

  state.formData = { ...expense, customCategory: "" };

  elements.titleInput.value = expense.title;
  elements.amountInput.value = expense.amount;
  elements.dateInput.value = expense.date;
  elements.selectCategory.value = expense.category;

  resetForm();
  openForm();
  commit();
}

function handleInputChange(e) {
  const { name, value } = e.target;

  state.formData[name] = value;
  state.touched[name] = true;

  delete state.errors[name];

  renderValidationUI(state.errors);
}

function handleFilterChange(e) {
  state.filters[e.target.name] = e.target.value;

  commit();
}

function handleLoadMore() {
  state.visibleCount += 20;

  saveToLocalStorage("visibleCount", state.visibleCount);
  commit();
}

function renderCategoriesUI() {
  const categories = [...new Set(state.expenses.map((e) => e.category))];

  const select = elements.selectCategory;

  const currentValue = select.value;

  select.innerHTML = `<option value="">Select category</option>`;

  categories.forEach((cat) => {
    const option = createCategoryOptions(cat);
    select.appendChild(option);
  });

  select.value = currentValue;
}

function handleCheckboxChange(id, onCheckboxChange) {
  state.expenses = checkboxChange(state.expenses, id, onCheckboxChange);

  saveToLocalStorage("expenses", state.expenses);

  commit();
}

window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeSidebar();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
  }
});

elements.sidebarOverlay.addEventListener("click", () => {
  closeSidebar();
});

elements.sidebar.addEventListener("click", () => {
  closeSidebar();
});

elements.sidebarClosebtn.addEventListener("click", () => {
  closeSidebar();
});

elements.menuBtn.addEventListener("click", () => {
  elements.sidebar.classList.add("active");
  elements.sidebarOverlay.classList.remove("hidden");
  updateScrollLock();
});

function closeSidebar() {
  elements.sidebar.classList.remove("active");
  elements.sidebarOverlay.classList.add("hidden");
  updateScrollLock();
}

elements.formOverlay.addEventListener("click", (e) => {
  if (e.target === elements.formOverlay) {
    closeForm();
  }
});
elements.addExpenseBtn.addEventListener("click", openForm);

elements.form.addEventListener("submit", handleSubmit);
elements.form.addEventListener("input", handleInputChange);
elements.openForm.addEventListener("click", openForm);
elements.closeForm.addEventListener("click", closeForm);
elements.searchInput.addEventListener("input", handleFilterChange);

elements.sortSelection.addEventListener("change", handleFilterChange);

elements.filterMonthSelect.addEventListener("change", handleFilterChange);

elements.loadMore.addEventListener("click", handleLoadMore);
elements.clearSelected.addEventListener("click", () => {
  state.expenses = clearSelectedExpenses(state.expenses);
  saveToLocalStorage("expenses", state.expenses);
  render();
});

elements.clearFiltered.addEventListener("click", () => {
  initFilters();
  commit();
});

elements.clearAll.addEventListener("click", () => {
  state.expenses = clearAllExpenses();
  saveToLocalStorage("expenses", state.expenses);
  commit();
});

elements.cardContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  const id = button.dataset.id;

  if (button.classList.contains("delete-btn")) {
    handleDeleteExpense(id);
  }

  if (button.classList.contains("edit-btn")) {
    handleEditExpense(id);
  }
});

elements.cardContainer.addEventListener("change", (e) => {
  const checkbox = e.target.closest("input[type='checkbox']");

  if (!checkbox) return;

  if (checkbox.classList.contains("select-expense")) {
    handleCheckboxChange(checkbox.dataset.id, checkbox.checked);
  }
});

render();
