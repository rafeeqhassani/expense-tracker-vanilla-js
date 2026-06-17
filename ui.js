export function renderExpenses(expense) {
  if (!expense) return null;
  const tableRow = document.createElement("tr");

  const checkboxTd = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("select-expense");
  checkbox.dataset.id = expense.id;
  checkbox.checked = expense.selected || false;

  const titleTd = document.createElement("td");
  titleTd.textContent = expense.title;

  const categoryTd = document.createElement("td");
  categoryTd.textContent = expense.category;
  categoryTd.className = "category-badge";

  const dateTd = document.createElement("td");
  dateTd.textContent = new Date(expense.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const amountTd = document.createElement("td");
  amountTd.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(expense.amount || 0);
  amountTd.className = "amount";

  if (expense.amount >= 50000) {
    amountTd.classList.add("high");
  } else if (expense.amount >= 20000) {
    amountTd.classList.add("medium");
  }

  const actionsTd = document.createElement("td");
  actionsTd.className = "actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.dataset.id = expense.id;
  editBtn.classList.add("edit-btn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = expense.id;

  checkboxTd.appendChild(checkbox);
  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);

  tableRow.appendChild(checkboxTd);
  tableRow.appendChild(titleTd);
  tableRow.appendChild(categoryTd);
  tableRow.appendChild(dateTd);
  tableRow.appendChild(amountTd);
  tableRow.appendChild(actionsTd);

  return tableRow;
}

export function renderMsg(message) {
  const p = document.createElement("p");
  p.classList.add("empty-list-message");
  p.textContent = message;
  return p;
}

export function toastMessage(message, type = "success") {
  const toast = document.createElement("p");

  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  setTimeout(() => {
    toast.remove();
  }, 2500);

  return toast;
}

export function createCategoryOptions(category) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  return option;
}

export function clearAllExpenses() {
  return [];
}
