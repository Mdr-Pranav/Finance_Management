// Storage Manager
const StorageManager = {
    saveData: (key, data) => {
        try {
            const compressedData = JSON.stringify(data);
            localStorage.setItem(key, compressedData);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    },

    loadData: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    },

    clearData: () => {
        localStorage.clear();
    }
};

// Data Manager
const DataManager = {
    addTransaction: (transaction) => {
        try {
            const transactions = StorageManager.loadData('transactions');
            const newTransaction = {
                id: Date.now(),
                date: new Date().toISOString(),
                ...transaction
            };
            transactions.push(newTransaction);
            StorageManager.saveData('transactions', transactions);
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    deleteTransaction: (id) => {
        try {
            console.log('Attempting to delete transaction with ID:', id);
            const transactions = StorageManager.loadData('transactions');
            console.log('Current transactions:', transactions);
            
            const updatedTransactions = transactions.filter(t => t.id !== id);
            console.log('Updated transactions:', updatedTransactions);
            
            StorageManager.saveData('transactions', updatedTransactions);
            console.log('Transaction deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    getTransactions: () => {
        try {
            return StorageManager.loadData('transactions');
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    getMonthlyStats: () => {
        try {
            const transactions = DataManager.getTransactions();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const monthlyTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            const income = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return {
                income,
                expenses,
                balance: income - expenses
            };
        } catch (error) {
            console.error('Error calculating monthly stats:', error);
            return { income: 0, expenses: 0, balance: 0 };
        }
    }
};

// Reports Manager
const ReportsManager = {
    charts: {
        incomeExpenses: null,
        categoryDistribution: null
    },

    initializeDateInputs: () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('reportStartDate').value = firstDayOfMonth.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
    },

    generateReport: () => {
        const startDate = new Date(document.getElementById('reportStartDate').value);
        const endDate = new Date(document.getElementById('reportEndDate').value);
        
        const transactions = DataManager.getTransactions().filter(t => {
            const date = new Date(t.date);
            return date >= startDate && date <= endDate;
        });

        ReportsManager.updateSummaryCards(transactions);
        ReportsManager.updateCharts(transactions);
        ReportsManager.updateTransactionsTable(transactions);
    },

    updateSummaryCards: (transactions) => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        document.getElementById('reportTotalIncome').textContent = income.toFixed(2);
        document.getElementById('reportTotalExpenses').textContent = expenses.toFixed(2);
        document.getElementById('reportNetBalance').textContent = (income - expenses).toFixed(2);
    },

    updateCharts: (transactions) => {
        // Income vs Expenses Chart
        const incomeExpensesCtx = document.getElementById('incomeExpensesChart').getContext('2d');
        if (ReportsManager.charts.incomeExpenses) {
            ReportsManager.charts.incomeExpenses.destroy();
        }

        const incomeData = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                const date = new Date(t.date).toLocaleDateString();
                acc[date] = (acc[date] || 0) + Number(t.amount);
                return acc;
            }, {});

        const expenseData = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const date = new Date(t.date).toLocaleDateString();
                acc[date] = (acc[date] || 0) + Number(t.amount);
                return acc;
            }, {});

        ReportsManager.charts.incomeExpenses = new Chart(incomeExpensesCtx, {
            type: 'line',
            data: {
                labels: Object.keys(incomeData),
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(incomeData),
                        borderColor: 'rgb(34, 197, 94)',
                        tension: 0.1
                    },
                    {
                        label: 'Expenses',
                        data: Object.values(expenseData),
                        borderColor: 'rgb(239, 68, 68)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        // Category Distribution Chart
        const categoryCtx = document.getElementById('categoryDistributionChart').getContext('2d');
        if (ReportsManager.charts.categoryDistribution) {
            ReportsManager.charts.categoryDistribution.destroy();
        }

        const categoryData = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {});

        ReportsManager.charts.categoryDistribution = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        'rgb(239, 68, 68)',
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(139, 92, 246)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    },

    updateTransactionsTable: (transactions) => {
        const tbody = document.getElementById('reportTransactions');
        tbody.innerHTML = '';

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'transaction-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(transaction.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.description}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${transaction.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Number(transaction.amount).toFixed(2)}
                </td>
            `;
            tbody.appendChild(row);
        });
    }
};

// UI Manager
const UIManager = {
    updateDashboard: () => {
        try {
            const stats = DataManager.getMonthlyStats();
            document.getElementById('totalBalance').textContent = stats.balance.toFixed(2);
            document.getElementById('monthlyIncome').textContent = stats.income.toFixed(2);
            document.getElementById('monthlyExpenses').textContent = stats.expenses.toFixed(2);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    },

    updateTransactionsList: (transactions = null) => {
        try {
            const allTransactions = transactions || DataManager.getTransactions();
            const recentTransactions = allTransactions.slice(-5).reverse();
            
            // Update recent transactions in dashboard
            const recentTbody = document.getElementById('recentTransactions');
            if (recentTbody) {
                recentTbody.innerHTML = '';
                recentTransactions.forEach(transaction => {
                    const row = document.createElement('tr');
                    row.className = 'transaction-row';
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${transaction.description}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${transaction.category}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                            ${transaction.type === 'income' ? '+' : '-'}$${Number(transaction.amount).toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button class="delete-transaction text-red-600 hover:text-red-800" data-id="${transaction.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    recentTbody.appendChild(row);
                });
            }

            // Update all transactions in transactions page
            const allTbody = document.getElementById('allTransactions');
            if (allTbody) {
                allTbody.innerHTML = '';
                allTransactions.reverse().forEach(transaction => {
                    const row = document.createElement('tr');
                    row.className = 'transaction-row';
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${transaction.description}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${transaction.category}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                            ${transaction.type === 'income' ? '+' : '-'}$${Number(transaction.amount).toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button class="delete-transaction text-red-600 hover:text-red-800" data-id="${transaction.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    allTbody.appendChild(row);
                });
            }

            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-transaction').forEach(button => {
                button.addEventListener('click', async (e) => {
                    try {
                        const id = parseInt(e.currentTarget.dataset.id);
                        console.log('Delete button clicked for transaction:', id);
                        
                        if (confirm('Are you sure you want to delete this transaction?')) {
                            await DataManager.deleteTransaction(id);
                            UIManager.updateDashboard();
                            UIManager.updateTransactionsList();
                        }
                    } catch (error) {
                        console.error('Error handling delete click:', error);
                        alert('Error deleting transaction. Please try again.');
                    }
                });
            });
        } catch (error) {
            console.error('Error updating transactions list:', error);
        }
    },

    filterTransactions: () => {
        try {
            const startDate = document.getElementById('transactionStartDate').value;
            const endDate = document.getElementById('transactionEndDate').value;
            const category = document.getElementById('transactionCategory').value;
            const type = document.getElementById('transactionType').value;

            let transactions = DataManager.getTransactions();

            if (startDate) {
                transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
            }
            if (endDate) {
                transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
            }
            if (category) {
                transactions = transactions.filter(t => t.category === category);
            }
            if (type) {
                transactions = transactions.filter(t => t.type === type);
            }

            UIManager.updateTransactionsList(transactions);
        } catch (error) {
            console.error('Error filtering transactions:', error);
        }
    },

    showModal: () => {
        const modal = document.getElementById('transactionModal');
        modal.classList.remove('hidden');
        
        // Set initial state of category container
        const typeSelect = document.getElementById('type');
        const categoryContainer = document.getElementById('categoryContainer');
        const categorySelect = document.getElementById('category');
        
        if (typeSelect.value === 'income') {
            categoryContainer.style.display = 'none';
            categorySelect.value = 'Income';
        } else {
            categoryContainer.style.display = 'block';
        }
    },

    hideModal: () => {
        document.getElementById('transactionModal').classList.add('hidden');
    },

    setupEventListeners: () => {
        try {
            // Add Transaction Buttons (both in dashboard and transactions page)
            const addButtons = document.querySelectorAll('#addTransactionBtn, #addTransactionBtn2');
            addButtons.forEach(button => {
                if (button) {
                    button.addEventListener('click', () => {
                        UIManager.showModal();
                    });
                }
            });

            // Close Modal Button
            const closeButton = document.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    UIManager.hideModal();
                });
            }

            // Type Select Change Handler
            const typeSelect = document.getElementById('type');
            if (typeSelect) {
                typeSelect.addEventListener('change', (e) => {
                    const categoryContainer = document.getElementById('categoryContainer');
                    const categorySelect = document.getElementById('category');
                    
                    if (e.target.value === 'income') {
                        categoryContainer.style.display = 'none';
                        categorySelect.value = 'Income';
                    } else {
                        categoryContainer.style.display = 'block';
                    }
                });
            }

            // Transaction Form Submit
            const transactionForm = document.getElementById('transactionForm');
            if (transactionForm) {
                transactionForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    try {
                        const formData = new FormData(e.target);
                        const type = formData.get('type');
                        const transaction = {
                            amount: formData.get('amount'),
                            description: formData.get('description'),
                            category: type === 'income' ? 'Income' : formData.get('category'),
                            type: type
                        };

                        await DataManager.addTransaction(transaction);
                        UIManager.updateDashboard();
                        UIManager.updateTransactionsList();
                        UIManager.hideModal();
                        e.target.reset();
                    } catch (error) {
                        console.error('Error submitting transaction:', error);
                        alert('Error adding transaction. Please try again.');
                    }
                });
            }

            // Transaction Filters
            const filterInputs = document.querySelectorAll('#transactionStartDate, #transactionEndDate, #transactionCategory, #transactionType');
            filterInputs.forEach(input => {
                if (input) {
                    input.addEventListener('change', () => {
                        UIManager.filterTransactions();
                    });
                }
            });

            // Navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = e.currentTarget.dataset.page;
                    document.querySelectorAll('.nav-item').forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    e.currentTarget.classList.add('active');
                    document.querySelectorAll('.page').forEach(p => {
                        p.classList.remove('active');
                    });
                    document.getElementById(page).classList.add('active');

                    // Initialize reports page when it's shown
                    if (page === 'reports') {
                        ReportsManager.initializeDateInputs();
                        ReportsManager.generateReport();
                    }
                });
            });

            // Reports Page Event Listeners
            const generateReportBtn = document.getElementById('generateReport');
            if (generateReportBtn) {
                generateReportBtn.addEventListener('click', () => {
                    ReportsManager.generateReport();
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Application initialized');
        UIManager.setupEventListeners();
        UIManager.updateDashboard();
        UIManager.updateTransactionsList();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}); 