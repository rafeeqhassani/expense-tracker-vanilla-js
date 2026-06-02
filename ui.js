export function renderExpenses(expense) {
  if (!expense) return null;

  const div = document.createElement("div");
  div.classList.add("expense-card");
  if (expense.amount > 1000) {
    div.classList.add("expensive");
  }

  const amount = document.createElement("span");
  amount.textContent = `Rs ${expense.amount}`;
  amount.classList.add("amount");

  const infoContainer = document.createElement("div");
  infoContainer.classList.add("info-container");

  const h4 = document.createElement("h4");
  h4.textContent = expense.title;

  const metaElements = document.createElement("p");
  metaElements.classList.add("meta-info");

  const categorySpan = document.createElement("span");
  categorySpan.textContent = expense.category;
  categorySpan.classList.add("category");

  const dotSpan = document.createElement("span");
  dotSpan.textContent = " . ";
  dotSpan.classList.add("dot");

  const dateSpan = document.createElement("span");
  dateSpan.textContent = new Date(expense.date).toLocaleDateString("en-GB");
  dateSpan.classList.add("date");

  metaElements.appendChild(categorySpan);
  metaElements.appendChild(dotSpan);
  metaElements.appendChild(dateSpan);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action-container");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = expense.id;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Reset";
  cancelBtn.classList.add("reset-btn");
  cancelBtn.dataset.id = expense.id;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.dataset.id = expense.id;
  editBtn.classList.add("edit-btn");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("select-expense");
  checkbox.dataset.id = expense.id;
  checkbox.checked = expense.selected || false;

  infoContainer.appendChild(h4);

  infoContainer.appendChild(metaElements);

  actionContainer.appendChild(deleteBtn);
  actionContainer.appendChild(editBtn);
  actionContainer.appendChild(cancelBtn);

  div.appendChild(checkbox);
  div.appendChild(infoContainer);

  div.appendChild(amount);
  div.appendChild(actionContainer);
  return div;
}

export function renderMsg(message) {
  const p = document.createElement("p");
  p.classList.add("empty-message");
  p.textContent = message;
  return p;
}

export function toastMessage(message, type = "success") {
  const toast = document.createElement("div");

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
