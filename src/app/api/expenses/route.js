const addExpense = async (expenseData) => {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  
  if (response.ok) {
    // Refresh the expenses list
    fetchData();
  }
};