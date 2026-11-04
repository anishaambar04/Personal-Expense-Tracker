const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  transactionDate: string;
  notes?: string | null;
  createdAt?: string;
}

export interface TransactionInput {
  title: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  transactionDate: string;
  notes?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// GET: Retrieve all transactions
export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/Transactions`);

  return handleResponse<Transaction[]>(response);
}

// GET: Retrieve one transaction
export async function getTransactionById(id: number): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/Transactions/${id}`);

  return handleResponse<Transaction>(response);
}

// POST: Create a transaction
export async function createTransaction(
  transaction: TransactionInput,
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/Transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      transactionDate: `${transaction.transactionDate}T00:00:00`,
      notes: transaction.notes ?? null,
    }),
  });

  return handleResponse<Transaction>(response);
}

// PUT: Update a transaction
export async function updateTransaction(
  id: number,
  transaction: TransactionInput,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      transactionDate: `${transaction.transactionDate}T00:00:00`,
      notes: transaction.notes ?? null,
    }),
  });

  await handleResponse<void>(response);
}

// DELETE: Delete a transaction
export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Transactions/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
