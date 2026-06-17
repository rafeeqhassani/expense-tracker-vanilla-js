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

  isFormOpen: false,
  mode: "add",
  editingId: null,
  errors: {},
  isSubmitting: false,
};

try {
  const stored = getFromLocalStorage("expenses") || [];

  state.expenses = stored.map((item) => ({
    ...item,
    selected: typeof item.selected === "boolean" ? item.selected : false,
  }));
} catch (error) {
  console.error(error);
  state.expenses = [];
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

function clearFilters() {
  state.filters = {
    title: "",
    month: "all",
    sortBy: "smallest",
  };

  state.visibleCount = 40;

  elements.searchInput.value = "";
  elements.filterMonthSelect.value = "all";
  elements.sortSelection.value = "smallest";

  render();
}

function hasActiveFilters() {
  return (
    state.filters.title !== "" ||
    state.filters.month !== "all" ||
    state.filters.sortBy !== "smallest"
  );
}

function render() {
  const filtered = getFilteredExpenses();
  updateSummary(filtered);
  const visible = getVisibleExpenses(filtered);

  elements.tBody.innerHTML = "";

  const existingMsg = elements.cardContainer.querySelector(
    ".empty-list-message",
  );

  if (existingMsg) {
    existingMsg.remove();
  }

  if (state.expenses.length === 0) {
    elements.tableWrapper.classList.add("hidden");

    elements.cardContainer.appendChild(renderMsg("No expenses added yet"));

    return;
  }

  if (filtered.length === 0) {
    elements.tableWrapper.classList.add("hidden");

    elements.cardContainer.appendChild(renderMsg("No expenses found"));

    return;
  }

  elements.tableWrapper.classList.remove("hidden");

  visible.forEach((expense) => {
    elements.tBody.appendChild(renderExpenses(expense));
  });

  if (hasActiveFilters()) {
    elements.clearFiltered.classList.remove("hidden");
  } else {
    elements.clearFiltered.classList.add("hidden");
  }

  updateSubmitButton();
  updateLoadMoreUI(filtered);
}

function updateSummary(filtered) {
  elements.totalAmount.forEach((el) => {
    el.textContent = `$${totalCalculate(state.expenses)}`;
  });

  elements.monthlyTotal.forEach((el) => {
    el.textContent = `$${totalCalculate(filtered)}`;
  });

  elements.records.forEach((el) => {
    el.textContent = state.expenses.length;
  });
}

function updateLoadMoreUI(filtered) {
  const total = filtered.length;
  const visible = state.visibleCount;

  const isEmpty = total === 0;
  const hasMore = total > visible;
  const isFullyLoaded = total > 0 && total <= visible;

  if (isEmpty) {
    elements.loadMoreMessage.textContent = "No expenses to load";
    elements.loadMore.classList.add("hidden");
    return;
  }

  if (hasMore) {
    elements.loadMoreMessage.textContent = "";
    elements.loadMore.classList.remove("hidden");
    return;
  }

  if (isFullyLoaded) {
    elements.loadMoreMessage.textContent = "No more expenses exist";
    elements.loadMore.classList.add("hidden");
  }
}

function updateSubmitButton() {
  elements.submitBtn.textContent =
    state.mode === "add" ? "Add Expense" : "Update Expense";
}

function resetForm() {
  state.formData = {
    title: "",
    amount: "",
    category: "",
    customCategory: "",
    date: "",
  };

  state.mode = "add";
  state.editingId = null;
  state.errors = {};

  elements.form.reset();
}

function renderValidationErrors(errors) {
  elements.validateTitle.textContent = errors.title || "";
  elements.validateAmount.textContent = errors.amount || "";
  elements.validateCategory.textContent = errors.category || "";
  elements.validateDate.textContent = errors.date || "";
}

function clearValidationErrors() {
  elements.validateTitle.textContent = "";
  elements.validateAmount.textContent = "";
  elements.validateCategory.textContent = "";
  elements.validateDate.textContent = "";
}

function handleError(errors) {
  state.errors = errors;
  renderValidationErrors(errors);
}

function handleAdd(newData) {
  state.errors = {};
  clearValidationErrors();

  state.expenses = addExpense(state.expenses, newData);
  saveToLocalStorage("expenses", state.expenses);

  commitSuccess("Expense added");
}

function handleUpdate(newData) {
  const existingData = state.expenses.find(
    (item) => item.id === state.editingId,
  );

  if (!existingData) {
    return showToastMessage("Expense not found", "error");
  }

  if (isSameData(existingData, newData)) {
    return showToastMessage("No changes detected", "info");
  }

  state.expenses = updateExpense(state.expenses, state.editingId, newData);

  saveToLocalStorage("expenses", state.expenses);

  commitSuccess("Expense updated");
}

function commitSuccess(message) {
  resetForm();

  handleCategories();
  render();
  showToastMessage(message, "success");
  closeForm();
}

function handleSubmit(e) {
  e.preventDefault();

  if (state.isSubmitting) return;
  state.isSubmitting = true;

  try {
    const validationErrors = validateForm(state.formData);

    if (Object.keys(validationErrors).length > 0) {
      handleError(validationErrors);
      return;
    }

    const finalCategory =
      state.formData.customCategory || state.formData.category;

    const newData = normalizedData({
      ...state.formData,
      category: finalCategory,
    });

    if (state.mode === "add") {
      return handleAdd(newData);
    }

    return handleUpdate(newData);
  } finally {
    state.isSubmitting = false;
  }
}

const openForm = () => {
  updateSubmitButton();

  state.isFormOpen = true;

  elements.formOverlay.classList.remove("hidden");
  document.body.classList.add("no-scroll");
};

const closeForm = () => {
  state.isFormOpen = false;
  elements.formOverlay.classList.add("hidden");
  document.body.classList.remove("no-scroll");
};

let lastToastKey = null;

function showToastMessage(message, type = "success") {
  const key = `${message}-${type}`;

  if (lastToastKey === key) return;

  lastToastKey = key;

  setTimeout(() => {
    lastToastKey = null;
  }, 2500);

  const toast = toastMessage(message, type);
  elements.toastContainer.appendChild(toast);
}

function handleDeleteExpense(id) {
  state.expenses = deleteExpense(state.expenses, id);
  saveToLocalStorage("expenses", state.expenses);
  showToastMessage("Expense deleted", "success");
  render();
}

function handleEditExpense(id) {
  const expense = editExpense(state.expenses, id);

  if (!expense) {
    showToastMessage("Expense not found", "error");
    return;
  }

  state.mode = "edit";
  state.editingId = id;
  updateSubmitButton();

  state.formData = {
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    customCategory: "",
    date: expense.date,
  };

  handleCategories();

  elements.titleInput.value = state.formData.title;
  elements.amountInput.value = state.formData.amount;
  elements.dateInput.value = state.formData.date;

  elements.selectCategory.value = state.formData.category;
  elements.categoryInput.value = state.formData.customCategory;

  state.errors = {};
  clearValidationErrors();

  openForm();
  render();
}

function handleFilterChange(e) {
  state.filters[e.target.name] = e.target.value;
  render();
}

function handleInputChange(e) {
  state.formData[e.target.name] = e.target.value;
}

function handleLoadMore() {
  state.visibleCount += 20;

  render();
}

function handleCategories() {
  const categories = [...new Set(state.expenses.map((item) => item.category))];

  elements.selectCategory.innerHTML =
    '<option value="">Select category</option>';

  categories.forEach((cat) => {
    const option = createCategoryOptions(cat);

    elements.selectCategory.appendChild(option);
  });
}

function handleCheckboxChange(id, onCheckboxChange) {
  state.expenses = checkboxChange(state.expenses, id, onCheckboxChange);

  saveToLocalStorage("expenses", state.expenses);

  render();
}

elements.sidebarOverlay.addEventListener("click", () => {
  elements.sidebar.classList.remove("active");
  elements.sidebarOverlay.classList.add("hidden");
  document.body.classList.remove("no-scroll");
});

elements.sidebar.addEventListener("click", () => {
  elements.sidebar.classList.remove("active");
  elements.sidebarOverlay.classList.add("hidden");
  document.body.classList.remove("no-scroll");
});

elements.sidebarClosebtn.addEventListener("click", () => {
  elements.sidebar.classList.remove("active");
  elements.sidebarOverlay.classList.add("hidden");
  ocument.body.classList.remove("no-scroll");
});

elements.menuBtn.addEventListener("click", () => {
  elements.sidebar.classList.add("active");
  elements.sidebarOverlay.classList.remove("hidden");
  document.body.classList.add("no-scroll");
});

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
elements.clearFiltered.addEventListener("click", clearFilters);

elements.clearAll.addEventListener("click", () => {
  state.expenses = clearAllExpenses();
  saveToLocalStorage("expenses", state.expenses);
  render();
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

handleCategories();
render();
