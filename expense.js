export function addExpense(expenses, newExpense) {
  const added = [...expenses, newExpense];
  return added.slice(-500);
}

export function normalizedData(
  data,
  existingId = null,
  existingSelected = false,
) {
  const parsedAmount = Number(String(data.amount).trim());
  const isValidDate = data.date && !isNaN(Date.parse(data.date));
  return {
    id: existingId || crypto.randomUUID(),
    title: data.title.trim(),
    amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    category: (data.customCategory || data.category).trim().toLowerCase(),
    date: isValidDate ? data.date : new Date().toISOString().split("T")[0],
    selected: Boolean(existingSelected),
  };
}

export function filterByMonth(expenses, month) {
  return expenses.filter((item) => {
    const d = new Date(item.date);
    return d.getMonth() + 1 === month;
  });
}

export function deleteExpense(expenses, id) {
  return expenses.filter((item) => item.id !== id);
}

export function editExpense(expenses, id) {
  return expenses.find((item) => item.id === id);
}

export function validateForm(formData) {
  const validationErrors = {};

  if (!formData.title.trim()) {
    validationErrors.title = "Title is required";
  }

  if (!formData.amount || Number(formData.amount) <= 0) {
    validationErrors.amount = "Amount must be positive";
  }

  const finalCategory =
    formData.customCategory.trim() || formData.category.trim();

  if (!finalCategory) {
    validationErrors.category = "Please select or enter a category";
  }

  if (!formData.date) {
    validationErrors.date = "Date is required";
  }

  return validationErrors;
}

export function checkboxChange(expenses, id, onCheckboxChange) {
  return expenses.map((item) =>
    item.id === id ? { ...item, selected: onCheckboxChange } : item,
  );
}

export function updateExpense(expenses, editingId, newData) {
  return expenses.map((item) =>
    item.id === editingId ? { ...item, ...newData } : item,
  );
}

export function searchExpenses(expenses, searchExpense) {
  const inputText = searchExpense.trim().toLowerCase();

  return expenses.filter((expense) =>
    expense.title.toLowerCase().includes(inputText),
  );
}

export function sortExpenses(expenses, sortBy) {
  const sorted = [...expenses];

  switch (sortBy) {
    case "latest":
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

    case "smallest":
      return sorted.sort((a, b) => a.amount - b.amount);

    case "largest":
      return sorted.sort((a, b) => b.amount - a.amount);

    case "title-ascending":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    case "title-descending":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));

    default:
      return sorted;
  }
}

export function isSameData(oldData, newData) {
  return (
    oldData.title === newData.title &&
    Number(oldData.amount) === Number(newData.amount) &&
    (oldData.category || "").trim().toLowerCase() ===
      (newData.category || "").trim().toLowerCase() &&
    oldData.date === newData.date
  );
}

export function clearSelectedExpenses(expenses) {
  return expenses.filter((item) => !item.selected);
}

export function totalCalculate(data) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}
