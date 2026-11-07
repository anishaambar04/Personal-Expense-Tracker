import { useEffect, useMemo, useState } from "react";
import styles from "./ExpenseDashboard.module.scss";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import type { User } from "../../services/AuthServices";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../services/TransactionServices";
import type {
  Transaction,
  TransactionInput,
} from "../../services/TransactionServices";

const categories = [
  "Food",
  "Salary",
  "Shopping",
  "Bills",
  "Freelance",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other",
];

const initialFormData = {
  title: "",
  amount: "",
  type: "Expense" as "Income" | "Expense",
  category: "Food",
  date: "",
  notes: "",
};

type FormData = typeof initialFormData;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ExpenseDashboardProps {
  user: User;
  onLogout: () => void;
  onViewProfile: () => void;
}

function ExpenseDashboard({
  user,
  onLogout,
  onViewProfile,
}: ExpenseDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [formError, setFormError] = useState("");

  // Fetch transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return transactions
      .filter((item) => item.type === "Income")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((item) => item.type === "Expense")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [transactions]);

  const totalBalance = totalIncome - totalExpense;

  // Search and filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "All" || item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  // Show Notes column only when at least one visible transaction has notes
  const showNotesColumn = filteredTransactions.some(
    (item) => item.notes && item.notes.trim() !== "",
  );

  // Prepare monthly expense chart data
  const chartData = useMemo(() => {
    const months: {
      label: string;
      month: number;
      year: number;
      amount: number;
    }[] = [];

    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

      months.push({
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        month: date.getMonth(),
        year: date.getFullYear(),
        amount: 0,
      });
    }

    transactions
      .filter((item) => item.type === "Expense")
      .forEach((item) => {
        const transactionDate = new Date(item.transactionDate);

        const matchingMonth = months.find(
          (month) =>
            month.month === transactionDate.getMonth() &&
            month.year === transactionDate.getFullYear(),
        );

        if (matchingMonth) {
          matchingMonth.amount += Number(item.amount);
        }
      });

    return months;
  }, [transactions]);

  const maximumChartAmount = Math.max(
    ...chartData.map((item) => item.amount),
    1,
  );

  // Open add transaction modal
  const handleAddTransaction = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open edit transaction modal
  const handleEditTransaction = (item: Transaction) => {
    setEditingId(item.id);

    setFormData({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: item.transactionDate ? item.transactionDate.substring(0, 10) : "",
      notes: item.notes || "",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
    setFormError("");
  };

  // Submit transaction
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Please enter a transaction title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    if (!formData.date) {
      setFormError("Please select a transaction date.");
      return;
    }

    const transactionData: TransactionInput = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      transactionDate: formData.date,
      notes: formData.notes.trim(),
    };

    try {
      if (editingId !== null) {
        await updateTransaction(editingId, transactionData);
      } else {
        await createTransaction(transactionData);
      }

      handleCloseModal();
      await loadTransactions();
    } catch (err) {
      console.error("Error saving transaction:", err);
      setFormError("Unable to save transaction. Please try again.");
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Unable to delete transaction.");
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>₹</span>
          <span>ExpenseFlow</span>
        </div>

        <div className={styles.menuLabel}>MENU</div>

        <nav className={styles.navigation}>
          <a href="#dashboard" className={styles.activeLink}>
            <span>▦</span>
            Dashboard
          </a>

          <a href="#transactions" className={styles.navLink}>
            <span>↔</span>
            Transactions
          </a>

          <a href="#reports" className={styles.navLink}>
            <span>▤</span>
            Reports
          </a>
        </nav>

        <ProfileMenu
          user={user}
          onViewProfile={onViewProfile}
          onSignOut={onLogout}
        />
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent} id="dashboard">
        <header className={styles.header}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your financial overview.</p>
          </div>

          <button className={styles.addButton} onClick={handleAddTransaction}>
            + Add Transaction
          </button>
        </header>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Summary Cards */}
        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.cardHeading}>
              <span>Total Balance</span>
              <span className={styles.balanceIcon}>₹</span>
            </div>

            <h2>{formatCurrency(totalBalance)}</h2>
            <p>Your available balance</p>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeading}>
              <span>Total Income</span>
              <span className={styles.incomeIcon}>↗</span>
            </div>

            <h2 className={styles.incomeAmount}>
              {formatCurrency(totalIncome)}
            </h2>
            <p>Your total income</p>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeading}>
              <span>Total Expenses</span>
              <span className={styles.expenseIcon}>↘</span>
            </div>

            <h2 className={styles.expenseAmount}>
              {formatCurrency(totalExpense)}
            </h2>
            <p>Your total expenses</p>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeading}>
              <span>Total Transactions</span>
              <span className={styles.transactionIcon}>⇄</span>
            </div>

            <h2>{transactions.length}</h2>
            <p>Recorded transactions</p>
          </div>
        </section>

        {/* Expense Chart - hidden when there are no expenses */}
        {totalExpense > 0 && (
          <section className={styles.chartCard} id="reports">
            <div className={styles.sectionHeading}>
              <div>
                <h2>Expense Overview</h2>
                <p>Your expenses over the last six months</p>
              </div>
            </div>

            <div className={styles.chart}>
              {chartData.map((item) => {
                const height =
                  item.amount > 0
                    ? Math.max((item.amount / maximumChartAmount) * 100, 4)
                    : 0;

                return (
                  <div
                    className={styles.chartColumn}
                    key={`${item.month}-${item.year}`}
                  >
                    <span className={styles.chartAmount}>
                      {item.amount > 0 ? formatCurrency(item.amount) : ""}
                    </span>

                    <div className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className={styles.chartLabel}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Transactions */}
        <section className={styles.transactionsCard} id="transactions">
          <div className={styles.sectionHeading}>
            <div>
              <h2>Recent Transactions</h2>
              <p>Manage your income and expenses</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Transactions</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.transactionTable}>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>

                  {showNotesColumn && <th>Notes</th>}

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={showNotesColumn ? 7 : 6}
                      className={styles.emptyState}
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showNotesColumn ? 7 : 6}
                      className={styles.emptyState}
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.transactionTitle}>{item.title}</td>

                      <td>
                        <span className={styles.categoryBadge}>
                          {item.category}
                        </span>
                      </td>

                      <td>{formatDate(item.transactionDate)}</td>

                      <td>
                        <span
                          className={
                            item.type === "Income"
                              ? styles.incomeBadge
                              : styles.expenseBadge
                          }
                        >
                          {item.type}
                        </span>
                      </td>

                      <td
                        className={
                          item.type === "Income"
                            ? styles.incomeAmount
                            : styles.expenseAmount
                        }
                      >
                        {item.type === "Income" ? "+" : "-"}
                        {formatCurrency(Number(item.amount))}
                      </td>

                      {showNotesColumn && (
                        <td className={styles.notesCell}>
                          {item.notes?.trim() ? (
                            <span
                              className={styles.notesText}
                              title={item.notes}
                            >
                              {item.notes}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}

                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEditTransaction(item)}
                            title="Edit transaction"
                          >
                            ✎
                          </button>

                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteTransaction(item.id)}
                            title="Delete transaction"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>
                  {editingId !== null ? "Edit Transaction" : "Add Transaction"}
                </h2>

                <p>
                  {editingId !== null
                    ? "Update your transaction details."
                    : "Enter your transaction details below."}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={handleCloseModal}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Transaction Title</label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Grocery shopping"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Amount (₹)</label>

                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="type">Type</label>

                  <select
                    id="type"
                    value={formData.type}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        type: event.target.value as "Income" | "Expense",
                      }))
                    }
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>

                  <select
                    id="category"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    {categories.map((category) => (
                      <option value={category} key={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date">Date</label>

                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        date: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">Notes (Optional)</label>

                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Add some notes..."
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.saveButton}>
                  {editingId !== null
                    ? "Update Transaction"
                    : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseDashboard;
