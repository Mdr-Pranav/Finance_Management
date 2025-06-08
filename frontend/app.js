// API Manager
const APIManager = {
    baseUrl: 'http://localhost:3000/api',

    async getTransactions() {
        try {
            console.log('Fetching transactions from:', `${this.baseUrl}/transactions`);
            const response = await fetch(`${this.baseUrl}/transactions`);
            if (!response.ok) {
                console.error('Failed to fetch transactions:', response.status, response.statusText);
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            console.log('Received transactions:', data);
            return data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    },

    async addTransaction(transaction) {
        try {
            const response = await fetch(`${this.baseUrl}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
            });
            if (!response.ok) throw new Error('Failed to add transaction');
            return await response.json();
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    async deleteTransaction(id) {
        try {
            const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete transaction');
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    async getBudgets() {
        try {
            const response = await fetch(`${this.baseUrl}/budgets`);
            if (!response.ok) throw new Error('Failed to fetch budgets');
            return await response.json();
        } catch (error) {
            console.error('Error fetching budgets:', error);
            return [];
        }
    },

    async addBudget(budget) {
        try {
            const response = await fetch(`${this.baseUrl}/budgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(budget),
            });
            if (!response.ok) throw new Error('Failed to add budget');
            return await response.json();
        } catch (error) {
            console.error('Error adding budget:', error);
            throw error;
        }
    },

    async getGoals() {
        try {
            const response = await fetch(`${this.baseUrl}/goals`);
            if (!response.ok) throw new Error('Failed to fetch goals');
            return await response.json();
        } catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }
    },

    async addGoal(goal) {
        try {
            const response = await fetch(`${this.baseUrl}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(goal),
            });
            if (!response.ok) throw new Error('Failed to add goal');
            return await response.json();
        } catch (error) {
            console.error('Error adding goal:', error);
            throw error;
        }
    }
};

// Data Manager
const DataManager = {
    async addTransaction(transaction) {
        try {
            return await APIManager.addTransaction(transaction);
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    async deleteTransaction(id) {
        try {
            return await APIManager.deleteTransaction(id);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    async getTransactions() {
        try {
            return await APIManager.getTransactions();
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    async getMonthlyStats() {
        try {
            console.log('Getting monthly stats...');
            const transactions = await APIManager.getTransactions();
            console.log('All transactions for monthly stats:', transactions);
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            console.log('Current month/year:', currentMonth, currentYear);

            // Filter for current month transactions for monthly income/expenses
            const monthlyTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                console.log('Transaction date:', date, 'Is current month:', isCurrentMonth);
                return isCurrentMonth;
            });
            console.log('Monthly transactions:', monthlyTransactions);

            // Calculate monthly income and expenses (current month only)
            const monthlyIncome = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Monthly income transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            const monthlyExpenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Monthly expense transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            // Calculate total balance from ALL transactions over time
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Total income transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            const totalExpenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Total expense transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            const totalBalance = totalIncome - totalExpenses;

            console.log('Calculated stats:', { 
                monthlyIncome, 
                monthlyExpenses, 
                totalIncome, 
                totalExpenses, 
                totalBalance 
            });
            
            return { 
                income: monthlyIncome, 
                expenses: monthlyExpenses, 
                balance: totalBalance 
            };
        } catch (error) {
            console.error('Error calculating monthly stats:', error);
            return { income: 0, expenses: 0, balance: 0 };
        }
    }
};

// Expense Limits Management
const ExpenseLimitsManager = {
    baseUrl: 'http://localhost:3000/api',

    async fetchExpenseLimits() {
        try {
            const response = await fetch(`${this.baseUrl}/expense-limits`);
            if (!response.ok) throw new Error('Failed to fetch expense limits');
            return await response.json();
        } catch (error) {
            console.error('Error fetching expense limits:', error);
            return [];
        }
    },

    async addExpenseLimit(category, limitAmount, periodType, startDate, endDate) {
        try {
            console.log('Adding expense limit:', { category, limitAmount, periodType, startDate, endDate });
            const response = await fetch(`${this.baseUrl}/expense-limits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    category, 
                    limit_amount: limitAmount,
                    period_type: periodType,
                    start_date: startDate,
                    end_date: endDate
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add expense limit');
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding expense limit:', error);
            throw error;
        }
    },

    async fetchExpenseLimitsStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/expense-limits/status`);
            if (!response.ok) throw new Error('Failed to fetch expense limits status');
            return await response.json();
        } catch (error) {
            console.error('Error fetching expense limits status:', error);
            return [];
        }
    },

    async fetchExceededTransactions() {
        try {
            const response = await fetch(`${this.baseUrl}/expense-limits/exceeded-transactions`);
            if (!response.ok) throw new Error('Failed to fetch exceeded transactions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching exceeded transactions:', error);
            return [];
        }
    },

    async deleteExpenseLimit(id) {
        try {
            console.log('Deleting expense limit with ID:', id);
            const response = await fetch(`${this.baseUrl}/expense-limits/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete expense limit');
            }

            return true;
        } catch (error) {
            console.error('Error deleting expense limit:', error);
            throw error;
        }
    }
};

// Debts Management
const DebtsManager = {
    baseUrl: 'http://localhost:3000/api',

    async fetchDebts() {
        try {
            const response = await fetch(`${this.baseUrl}/debts`);
            if (!response.ok) throw new Error('Failed to fetch debts');
            return await response.json();
        } catch (error) {
            console.error('Error fetching debts:', error);
            return [];
        }
    },

    async addDebt(debt) {
        try {
            const response = await fetch(`${this.baseUrl}/debts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(debt),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add debt');
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding debt:', error);
            throw error;
        }
    },

    async updateDebtStatus(id, status) {
        try {
            const response = await fetch(`${this.baseUrl}/debts/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update debt status');
            return await response.json();
        } catch (error) {
            console.error('Error updating debt status:', error);
            throw error;
        }
    },

    async deleteDebt(id) {
        try {
            const response = await fetch(`${this.baseUrl}/debts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete debt');
            return true;
        } catch (error) {
            console.error('Error deleting debt:', error);
            throw error;
        }
    },

    async fetchDebtsSummary() {
        try {
            const response = await fetch(`${this.baseUrl}/debts/summary`);
            if (!response.ok) throw new Error('Failed to fetch debts summary');
            return await response.json();
        } catch (error) {
            console.error('Error fetching debts summary:', error);
            return [];
        }
    }
};

// Subscriptions Management
const SubscriptionsManager = {
    baseUrl: 'http://localhost:3000/api',

    async fetchSubscriptions() {
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions`);
            if (!response.ok) throw new Error('Failed to fetch subscriptions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            return [];
        }
    },

    async addSubscription(subscription) {
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding subscription:', error);
            throw error;
        }
    },

    async updateSubscription(id, subscription) {
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });

            if (!response.ok) throw new Error('Failed to update subscription');
            return await response.json();
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    },

    async deleteSubscription(id) {
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete subscription');
            return true;
        } catch (error) {
            console.error('Error deleting subscription:', error);
            throw error;
        }
    },

    async fetchSubscriptionsSummary() {
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions/summary`);
            if (!response.ok) throw new Error('Failed to fetch subscriptions summary');
            return await response.json();
        } catch (error) {
            console.error('Error fetching subscriptions summary:', error);
            return {
                total_active: 0,
                monthly_cost: 0,
                yearly_cost: 0,
                upcoming_this_week: 0,
                upcoming_this_month: 0,
                by_category: {}
            };
        }
    }
};

// UI Manager
const UIManager = {
    // Pagination state for transactions
    transactionsPagination: {
        currentPage: 1,
        perPage: 100,
        totalItems: 0,
        totalPages: 0
    },
    
    // Pagination state for reports
    reportsPagination: {
        currentPage: 1,
        perPage: 50,
        totalItems: 0,
        totalPages: 0
    },

    // Navigation
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showPage(page);
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    },

    // Transaction Modal
    initTransactionModal() {
        const modal = document.getElementById('transactionModal');
        const addButtons = document.querySelectorAll('#addTransactionBtn, #addTransactionBtn2');
        const closeButton = modal.querySelector('.close-modal');
        const form = document.getElementById('transactionForm');
        const dateInput = document.getElementById('date');

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;

        // Load categories when modal is initialized
        this.loadCategories();

        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Reset form and set today's date
                form.reset();
                dateInput.value = today;
                // Refresh categories when opening modal
                this.loadCategories();
                modal.classList.remove('hidden');
            });
        });

        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const type = formData.get('type');
            const transaction = {
                amount: formData.get('amount'),
                description: formData.get('description'),
                category: type === 'income' ? 'Income' : formData.get('category'),
                type: type,
                date: formData.get('date')
            };

            try {
                await DataManager.addTransaction(transaction);
                await this.updateDashboard();
                this.updateCurrencyDisplay(localStorage.getItem('currency') || 'USD');
                this.updateTransactionsList();
                modal.classList.add('hidden');
                // Reset form and set today's date
                form.reset();
                dateInput.value = today;
            } catch (error) {
                console.error('Error adding transaction:', error);
                alert('Failed to add transaction. Please try again.');
            }
        });

        // Handle transaction type change
        const typeSelect = document.getElementById('type');
        const categoryContainer = document.getElementById('categoryContainer');
        typeSelect.addEventListener('change', () => {
            categoryContainer.style.display = typeSelect.value === 'income' ? 'none' : 'block';
        });
    },

    // Dashboard
    async updateDashboard() {
        try {
            console.log('Starting dashboard update...');
            
            // Get all dashboard elements first
            const elements = {
                balance: document.getElementById('totalBalance'),
                income: document.getElementById('monthlyIncome'),
                expenses: document.getElementById('monthlyExpenses')
            };

            // Log element status
            console.log('Dashboard elements:', {
                balance: elements.balance ? 'Found' : 'Not found',
                income: elements.income ? 'Found' : 'Not found',
                expenses: elements.expenses ? 'Not found' : 'Not found'
            });

            // Get stats
            const stats = await DataManager.getMonthlyStats();
            console.log('Dashboard stats:', stats);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Update basic elements if they exist
            if (elements.balance) {
                const balance = stats.balance || 0;
                elements.balance.textContent = this.formatCurrencyForDisplay(balance, symbol);
                console.log('Updated balance:', balance);
            }

            if (elements.income) {
                const income = stats.income || 0;
                elements.income.textContent = this.formatCurrencyForDisplay(income, symbol);
                console.log('Updated income:', income);
            }

            if (elements.expenses) {
                const expenses = stats.expenses || 0;
                elements.expenses.textContent = this.formatCurrencyForDisplay(expenses, symbol);
                console.log('Updated expenses:', expenses);
            }

            // Update additional summary stats
            await this.updateDashboardSummaryStats(symbol);
            await this.updateDashboardInsights(symbol);
            await this.updateDashboardHealthSummary(symbol);

        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    },

    async updateDashboardSummaryStats(symbol) {
        try {
            const transactions = await DataManager.getTransactions();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter current month transactions
            const monthlyTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense');
            const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income');

            const totalIncome = monthlyIncome.reduce((sum, t) => sum + Number(t.amount), 0);
            const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

            // Savings Rate
            const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
            console.log('Savings Rate Debug:', {
                totalIncome,
                totalExpenses,
                savingsRate,
                monthlyTransactions: monthlyTransactions.length,
                currentMonth,
                currentYear
            });
            const savingsRateElement = document.getElementById('savingsRate');
            if (savingsRateElement) {
                const displayValue = this.formatNumberForDisplay(savingsRate.toFixed(1), '%');
                console.log('Savings Rate Display:', displayValue);
                savingsRateElement.textContent = displayValue;
                savingsRateElement.className = `text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`;
            } else {
                console.log('Savings Rate Element not found!');
            }

            // Daily Average Spending
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const dailyAverage = totalExpenses / daysInMonth;
            const dailyAverageElement = document.getElementById('dailyAverage');
            if (dailyAverageElement) {
                dailyAverageElement.textContent = this.formatCurrencyForDisplay(dailyAverage, symbol, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
            }

            // Transaction Count
            const transactionCountElement = document.getElementById('transactionCount');
            if (transactionCountElement) {
                transactionCountElement.textContent = this.formatNumberForDisplay(monthlyTransactions.length.toString());
            }

            // Top Spending Category
            const categorySpending = {};
            monthlyExpenses.forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
            });

            const topCategory = Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a)[0];

            const topCategoryElement = document.getElementById('topCategory');
            if (topCategoryElement) {
                if (topCategory) {
                    const categoryAmount = this.formatCurrencyForDisplay(topCategory[1], symbol, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                    topCategoryElement.textContent = `${topCategory[0]} (${categoryAmount})`;
                } else {
                    topCategoryElement.textContent = 'None';
                }
            }

        } catch (error) {
            console.error('Error updating dashboard summary stats:', error);
        }
    },

    async updateDashboardInsights(symbol) {
        try {
            const transactions = await DataManager.getTransactions();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter current month transactions for largest expense (monthly context makes sense)
            const monthlyTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense');
            
            // For largest income, use all-time data since income might be irregular
            const allIncome = transactions.filter(t => t.type === 'income');

            // Largest Expense (current month)
            let largestExpense = {};
            if (monthlyExpenses.length > 0) {
                largestExpense = monthlyExpenses.reduce((max, t) => 
                    Number(t.amount) > Number(max.amount || 0) ? t : max);
            }

            const largestExpenseElement = document.getElementById('largestExpense');
            const largestExpenseCategoryElement = document.getElementById('largestExpenseCategory');
            if (largestExpenseElement && largestExpenseCategoryElement) {
                if (largestExpense.amount) {
                    largestExpenseElement.textContent = this.formatCurrencyForDisplay(largestExpense.amount, symbol);
                    largestExpenseCategoryElement.textContent = `${largestExpense.category} - ${largestExpense.description}`;
                } else {
                    largestExpenseElement.textContent = this.formatCurrencyForDisplay(0, symbol);
                    largestExpenseCategoryElement.textContent = 'No expenses this month';
                }
            }

            // Largest Income (all-time)
            let largestIncome = {};
            if (allIncome.length > 0) {
                largestIncome = allIncome.reduce((max, t) => 
                    Number(t.amount) > Number(max.amount || 0) ? t : max);
            }

            const largestIncomeElement = document.getElementById('largestIncome');
            const largestIncomeDescriptionElement = document.getElementById('largestIncomeDescription');
            if (largestIncomeElement && largestIncomeDescriptionElement) {
                if (largestIncome.amount) {
                    largestIncomeElement.textContent = this.formatCurrencyForDisplay(largestIncome.amount, symbol);
                    largestIncomeDescriptionElement.textContent = `${largestIncome.description} (${new Date(largestIncome.date).toLocaleDateString()})`;
                } else {
                    largestIncomeElement.textContent = this.formatCurrencyForDisplay(0, symbol);
                    largestIncomeDescriptionElement.textContent = 'No income recorded';
                }
            }

            // Monthly Trend (current vs last month)
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            const lastMonthTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
            });

            const currentSpending = monthlyTransactions.filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const lastMonthSpending = lastMonthTransactions.filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const monthlyTrendElement = document.getElementById('monthlyTrend');
            const monthlyTrendDescriptionElement = document.getElementById('monthlyTrendDescription');
            
            if (monthlyTrendElement && monthlyTrendDescriptionElement) {
                if (lastMonthSpending > 0) {
                    const change = currentSpending - lastMonthSpending;
                    const percentChange = (change / lastMonthSpending * 100);
                    
                    const changeAmount = this.formatCurrencyForDisplay(Math.abs(change), symbol, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                    
                    monthlyTrendElement.textContent = `${change >= 0 ? '+' : ''}${changeAmount}`;
                    monthlyTrendElement.className = `text-xl font-bold ${change <= 0 ? 'text-green-600' : 'text-red-600'}`;
                    
                    const percentDisplay = this.formatNumberForDisplay(Math.abs(percentChange).toFixed(1), '%');
                    monthlyTrendDescriptionElement.textContent = `${change <= 0 ? 'Saved' : 'More spending'} (${percentDisplay})`;
                } else {
                    monthlyTrendElement.textContent = '--';
                    monthlyTrendElement.className = 'text-xl font-bold text-gray-600';
                    monthlyTrendDescriptionElement.textContent = 'No comparison data';
                }
            }

        } catch (error) {
            console.error('Error updating dashboard insights:', error);
        }
    },

    async updateDashboardHealthSummary(symbol) {
        try {
            // Update debt summary
            const debts = await DebtsManager.fetchDebts().catch(() => []);
            const pendingDebts = debts.filter(d => d.status === 'pending');
            const iOwe = pendingDebts.filter(d => d.type === 'owe').reduce((sum, d) => sum + Number(d.amount), 0);
            const owedToMe = pendingDebts.filter(d => d.type === 'owed').reduce((sum, d) => sum + Number(d.amount), 0);
            const netDebt = owedToMe - iOwe;

            const dashboardIOweElement = document.getElementById('dashboardIOwe');
            const dashboardOwedToMeElement = document.getElementById('dashboardOwedToMe');
            const dashboardNetDebtElement = document.getElementById('dashboardNetDebt');

            if (dashboardIOweElement) {
                dashboardIOweElement.textContent = this.formatCurrencyForDisplay(iOwe, symbol);
            }
            if (dashboardOwedToMeElement) {
                dashboardOwedToMeElement.textContent = this.formatCurrencyForDisplay(owedToMe, symbol);
            }
            if (dashboardNetDebtElement) {
                dashboardNetDebtElement.textContent = this.formatCurrencyForDisplay(netDebt, symbol);
                dashboardNetDebtElement.className = `text-sm font-bold ${netDebt >= 0 ? 'text-green-600' : 'text-red-600'}`;
            }

            // Update subscription summary
            const subscriptionSummary = await SubscriptionsManager.fetchSubscriptionsSummary().catch(() => ({
                total_active: 0,
                monthly_cost: 0,
                upcoming_this_week: 0
            }));

            const dashboardActiveSubscriptionsElement = document.getElementById('dashboardActiveSubscriptions');
            const dashboardMonthlyCostElement = document.getElementById('dashboardMonthlyCost');
            const dashboardDueThisWeekElement = document.getElementById('dashboardDueThisWeek');

            if (dashboardActiveSubscriptionsElement) {
                dashboardActiveSubscriptionsElement.textContent = this.formatNumberForDisplay(subscriptionSummary.total_active.toString());
            }
            if (dashboardMonthlyCostElement) {
                dashboardMonthlyCostElement.textContent = this.formatCurrencyForDisplay(subscriptionSummary.monthly_cost, symbol);
            }
            if (dashboardDueThisWeekElement) {
                dashboardDueThisWeekElement.textContent = this.formatNumberForDisplay(subscriptionSummary.upcoming_this_week.toString());
            }

            // Update budget status
            const expenseLimits = await ExpenseLimitsManager.fetchExpenseLimitsStatus().catch(() => []);
            const activeLimits = expenseLimits.length;
            const exceededLimits = expenseLimits.filter(l => l.exceeded).length;
            const onTrackLimits = activeLimits - exceededLimits;

            const dashboardActiveLimitsElement = document.getElementById('dashboardActiveLimits');
            const dashboardExceededLimitsElement = document.getElementById('dashboardExceededLimits');
            const dashboardOnTrackLimitsElement = document.getElementById('dashboardOnTrackLimits');

            if (dashboardActiveLimitsElement) {
                dashboardActiveLimitsElement.textContent = this.formatNumberForDisplay(activeLimits.toString());
            }
            if (dashboardExceededLimitsElement) {
                dashboardExceededLimitsElement.textContent = this.formatNumberForDisplay(exceededLimits.toString());
            }
            if (dashboardOnTrackLimitsElement) {
                dashboardOnTrackLimitsElement.textContent = this.formatNumberForDisplay(onTrackLimits.toString());
            }

        } catch (error) {
            console.error('Error updating dashboard health summary:', error);
        }
    },

    updateCurrencyDisplay(currency) {
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];
        console.log('Updating currency display with symbol:', symbol);
        
        // Update all currency displays
        document.querySelectorAll('[data-currency]').forEach(element => {
            const span = element.querySelector('span');
            if (span) {
                const value = parseFloat(span.textContent.replace(/[^0-9.-]+/g, ''));
                console.log('Updating element:', element, 'with value:', value);
                span.textContent = value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                element.textContent = `${symbol}${span.textContent}`;
            }
        });
    },

    // Transactions List
    async updateTransactionsList() {
        const transactions = await DataManager.getTransactions();
        const recentTransactions = document.getElementById('recentTransactions');
        const allTransactions = document.getElementById('allTransactions');

        // Get currency settings
        const currency = localStorage.getItem('currency') || 'USD';
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];

        const createTransactionRow = (transaction) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}${symbol}${Math.abs(transaction.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </td>
                <td class="px-6 py-4">
                    <button class="text-red-600 hover:text-red-800 delete-transaction" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            return row;
        };

        // Update recent transactions (last 5)
        recentTransactions.innerHTML = '';
        transactions.slice(0, 5).forEach(transaction => {
            recentTransactions.appendChild(createTransactionRow(transaction));
        });

        // Update all transactions with filtering
        this.updateFilteredTransactions(transactions);
    },

    updateFilteredTransactions(transactions) {
        const allTransactions = document.getElementById('allTransactions');
        const startDate = document.getElementById('transactionStartDate').value;
        const endDate = document.getElementById('transactionEndDate').value;
        const category = document.getElementById('transactionCategory').value;
        const type = document.getElementById('transactionType').value;

        // Get currency settings
        const currency = localStorage.getItem('currency') || 'USD';
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];

        // Filter transactions
        let filteredTransactions = transactions;

        if (startDate) {
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) <= new Date(endDate)
            );
        }

        if (category) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.category === category
            );
        }

        if (type) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.type === type
            );
        }

        // Update pagination state
        this.transactionsPagination.totalItems = filteredTransactions.length;
        this.transactionsPagination.totalPages = Math.ceil(filteredTransactions.length / this.transactionsPagination.perPage);
        
        // Ensure current page is valid
        if (this.transactionsPagination.currentPage > this.transactionsPagination.totalPages) {
            this.transactionsPagination.currentPage = 1;
        }

        // Calculate pagination range
        const startIndex = (this.transactionsPagination.currentPage - 1) * this.transactionsPagination.perPage;
        const endIndex = startIndex + this.transactionsPagination.perPage;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

        // Update the table
        allTransactions.innerHTML = '';
        paginatedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4">${transaction.type}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}${symbol}${Math.abs(transaction.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </td>
                <td class="px-6 py-4">
                    <button class="text-red-600 hover:text-red-800 delete-transaction" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            allTransactions.appendChild(row);
        });

        // Update pagination controls
        this.updateTransactionsPaginationInfo();
        this.updateTransactionsPaginationControls();

        // Add delete event listeners
        document.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    const id = button.dataset.id;
                    try {
                        await DataManager.deleteTransaction(id);
                        await this.updateDashboard();
                        this.updateCurrencyDisplay(localStorage.getItem('currency') || 'USD');
                        this.updateTransactionsList();
                    } catch (error) {
                        console.error('Error deleting transaction:', error);
                        alert('Failed to delete transaction. Please try again.');
                    }
                }
            });
        });
    },

    updateTransactionsPaginationInfo() {
        const infoElement = document.getElementById('transactionsPaginationInfo');
        if (!infoElement) return;

        const { currentPage, perPage, totalItems, totalPages } = this.transactionsPagination;
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
        const endItem = Math.min(currentPage * perPage, totalItems);

        infoElement.textContent = `Showing ${startItem}-${endItem} of ${totalItems} transactions`;
    },

    updateTransactionsPaginationControls() {
        const controlsElement = document.getElementById('transactionsPaginationControls');
        if (!controlsElement) return;

        const { currentPage, totalPages } = this.transactionsPagination;
        
        let controlsHTML = '';

        // Previous button
        controlsHTML += `
            <button id="prevTransactionsPage" 
                    class="px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page and ellipsis
        if (startPage > 1) {
            controlsHTML += `
                <button class="pagination-page px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-50" data-page="1">1</button>
            `;
            if (startPage > 2) {
                controlsHTML += `<span class="px-2 text-gray-500">...</span>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            controlsHTML += `
                <button class="pagination-page px-3 py-1 rounded border ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                        data-page="${i}">${i}</button>
            `;
        }

        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                controlsHTML += `<span class="px-2 text-gray-500">...</span>`;
            }
            controlsHTML += `
                <button class="pagination-page px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-50" data-page="${totalPages}">${totalPages}</button>
            `;
        }

        // Next button
        controlsHTML += `
            <button id="nextTransactionsPage" 
                    class="px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        controlsElement.innerHTML = controlsHTML;

        // Add event listeners
        document.getElementById('prevTransactionsPage')?.addEventListener('click', () => {
            if (this.transactionsPagination.currentPage > 1) {
                this.transactionsPagination.currentPage--;
                this.refreshTransactionsPagination();
            }
        });

        document.getElementById('nextTransactionsPage')?.addEventListener('click', () => {
            if (this.transactionsPagination.currentPage < this.transactionsPagination.totalPages) {
                this.transactionsPagination.currentPage++;
                this.refreshTransactionsPagination();
            }
        });

        document.querySelectorAll('.pagination-page').forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.dataset.page);
                this.transactionsPagination.currentPage = page;
                this.refreshTransactionsPagination();
            });
        });
    },

    async refreshTransactionsPagination() {
        const transactions = await DataManager.getTransactions();
        this.updateFilteredTransactions(transactions);
    },

    initTransactionFilters() {
        const filterInputs = [
            'transactionStartDate',
            'transactionEndDate',
            'transactionCategory',
            'transactionType'
        ];

        filterInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('change', async () => {
                // Reset to first page when filters change
                this.transactionsPagination.currentPage = 1;
                const transactions = await DataManager.getTransactions();
                this.updateFilteredTransactions(transactions);
            });
        });

        // Handle per-page selector
        const perPageSelect = document.getElementById('transactionsPerPage');
        if (perPageSelect) {
            perPageSelect.addEventListener('change', async () => {
                this.transactionsPagination.perPage = parseInt(perPageSelect.value);
                this.transactionsPagination.currentPage = 1; // Reset to first page
                const transactions = await DataManager.getTransactions();
                this.updateFilteredTransactions(transactions);
            });
        }
    },

    // Reports
    initReports() {
        const generateReportBtn = document.getElementById('generateReport');
        const startDateInput = document.getElementById('reportStartDate');
        const endDateInput = document.getElementById('reportEndDate');
        const categoryInput = document.getElementById('reportCategory');

        // Set default date range to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        startDateInput.value = firstDay.toISOString().split('T')[0];
        endDateInput.value = lastDay.toISOString().split('T')[0];

        generateReportBtn.addEventListener('click', () => this.generateReport(true));
        
        // Add listeners for filter changes to reset pagination
        [startDateInput, endDateInput, categoryInput].forEach(input => {
            if (input) {
                input.addEventListener('change', () => this.generateReport(true));
            }
        });
        
        // Initialize pagination controls
        this.initReportPagination();
        
        // Generate initial report
        this.generateReport(true);
    },
    
    initReportPagination() {
        // Handle per-page selector
        const perPageSelect = document.getElementById('reportTransactionsPerPage');
        if (perPageSelect) {
            perPageSelect.addEventListener('change', async () => {
                this.reportsPagination.perPage = parseInt(perPageSelect.value);
                this.reportsPagination.currentPage = 1; // Reset to first page
                this.generateReport();
            });
        }
    },

    async generateReport(resetPagination = false) {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const category = document.getElementById('reportCategory').value;
        
        // Reset pagination when filters change
        if (resetPagination) {
            this.reportsPagination.currentPage = 1;
        }
        
        try {
            const transactions = await DataManager.getTransactions();
            let filteredTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                const isInDateRange = date >= new Date(startDate) && date <= new Date(endDate);
                const isInCategory = !category || t.category === category;
                return isInDateRange && isInCategory;
            });

            this.updateReportSummary(filteredTransactions);
            this.updateReportCharts(filteredTransactions);
            this.updateReportTransactions(filteredTransactions);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        }
    },

    updateReportSummary(transactions) {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const netBalance = income - expenses;

        const currency = localStorage.getItem('currency') || 'USD';
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];

        const incomeElem = document.getElementById('reportTotalIncome');
        const expensesElem = document.getElementById('reportTotalExpenses');
        const netElem = document.getElementById('reportNetBalance');

        if (incomeElem) {
            incomeElem.textContent = this.formatCurrencyForDisplay(income, symbol);
        }
        if (expensesElem) {
            expensesElem.textContent = this.formatCurrencyForDisplay(expenses, symbol);
        }
        if (netElem) {
            netElem.textContent = this.formatCurrencyForDisplay(netBalance, symbol);
        }
    },

    formatDataForCharts(data) {
        const isPrivacyMode = localStorage.getItem('privacyMode') === 'true';
        
        if (isPrivacyMode) {
            // Return zeros for privacy mode to hide actual data
            return data.map(() => 0);
        }
        
        return data;
    },

    updateReportCharts(transactions) {
        const isPrivacyMode = localStorage.getItem('privacyMode') === 'true';
        
        // Get currency settings
        const currency = localStorage.getItem('currency') || 'USD';
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];
        
        // Income vs Expenses Chart
        const incomeExpensesCtx = document.getElementById('incomeExpensesChart').getContext('2d');
        const dates = [...new Set(transactions.map(t => new Date(t.date).toLocaleDateString()))].sort();
        
        const incomeData = dates.map(date => {
            return transactions
                .filter(t => new Date(t.date).toLocaleDateString() === date && t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);
        });

        const expensesData = dates.map(date => {
            return transactions
                .filter(t => new Date(t.date).toLocaleDateString() === date && t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);
        });

        // Destroy existing chart if it exists
        if (window.incomeExpensesChart instanceof Chart) {
            window.incomeExpensesChart.destroy();
        }

        // Create new chart
        window.incomeExpensesChart = new Chart(incomeExpensesCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (isPrivacyMode) {
                                    return context.dataset.label + ': ------';
                                }
                                return context.dataset.label + ': ' + symbol + context.raw.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (isPrivacyMode) {
                                    return '------';
                                }
                                return symbol + value.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                }
            }
        });

        // Category Distribution Chart
        const categoryCtx = document.getElementById('categoryDistributionChart').getContext('2d');
        const categories = [...new Set(transactions
            .filter(t => t.type === 'expense')
            .map(t => t.category))];

        const categoryData = categories.map(category => {
            return transactions
                .filter(t => t.type === 'expense' && t.category === category)
                .reduce((sum, t) => sum + Number(t.amount), 0);
        });

        // Destroy existing chart if it exists
        if (window.categoryChart instanceof Chart) {
            window.categoryChart.destroy();
        }

        // Create new chart
        window.categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryData,
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6',
                        '#EC4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (isPrivacyMode) {
                                    return context.label + ': ------';
                                }
                                return context.label + ': ' + symbol + context.raw.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                }
            }
        });
    },

    updateReportTransactions(transactions) {
        const tbody = document.getElementById('reportTransactions');
        tbody.innerHTML = '';

        // Update pagination state
        this.reportsPagination.totalItems = transactions.length;
        this.reportsPagination.totalPages = Math.ceil(transactions.length / this.reportsPagination.perPage);

        // Reset to first page if current page is beyond total pages
        if (this.reportsPagination.currentPage > this.reportsPagination.totalPages) {
            this.reportsPagination.currentPage = 1;
        }

        // Apply pagination
        const startIndex = (this.reportsPagination.currentPage - 1) * this.reportsPagination.perPage;
        const endIndex = startIndex + this.reportsPagination.perPage;
        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        // Get currency settings
        const currency = localStorage.getItem('currency') || 'USD';
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        const symbol = currencySymbols[currency];

        // Sort transactions by date (newest first) and display paginated results
        paginatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
            const row = document.createElement('tr');
            const amountDisplay = this.formatCurrencyForDisplay(Math.abs(transaction.amount), symbol);
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4">${transaction.type}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}${amountDisplay}
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update pagination info and controls
        this.updateReportPaginationInfo();
        this.updateReportPaginationControls();
    },

    updateReportPaginationInfo() {
        const infoElement = document.getElementById('reportPaginationInfo');
        if (!infoElement) return;

        const { currentPage, perPage, totalItems, totalPages } = this.reportsPagination;
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
        const endItem = Math.min(currentPage * perPage, totalItems);

        infoElement.textContent = `Showing ${startItem}-${endItem} of ${totalItems} transactions`;
    },

    updateReportPaginationControls() {
        const controlsElement = document.getElementById('reportPaginationControls');
        if (!controlsElement) return;

        const { currentPage, totalPages } = this.reportsPagination;
        
        let controlsHTML = '';

        // Previous button
        controlsHTML += `
            <button id="prevReportPage" 
                    class="px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page and ellipsis
        if (startPage > 1) {
            controlsHTML += `
                <button class="report-pagination-page px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" data-page="1">1</button>
            `;
            if (startPage > 2) {
                controlsHTML += `<span class="px-2 text-gray-500 dark:text-gray-400">...</span>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            controlsHTML += `
                <button class="report-pagination-page px-3 py-1 rounded border ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}" 
                        data-page="${i}">${i}</button>
            `;
        }

        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                controlsHTML += `<span class="px-2 text-gray-500 dark:text-gray-400">...</span>`;
            }
            controlsHTML += `
                <button class="report-pagination-page px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" data-page="${totalPages}">${totalPages}</button>
            `;
        }

        // Next button
        controlsHTML += `
            <button id="nextReportPage" 
                    class="px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        controlsElement.innerHTML = controlsHTML;

        // Add event listeners
        document.getElementById('prevReportPage')?.addEventListener('click', () => {
            if (this.reportsPagination.currentPage > 1) {
                this.reportsPagination.currentPage--;
                this.generateReport();
            }
        });

        document.getElementById('nextReportPage')?.addEventListener('click', () => {
            if (this.reportsPagination.currentPage < this.reportsPagination.totalPages) {
                this.reportsPagination.currentPage++;
                this.generateReport();
            }
        });

        document.querySelectorAll('.report-pagination-page').forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.dataset.page);
                this.reportsPagination.currentPage = page;
                this.generateReport();
            });
        });
    },

    initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(themeIcon, savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    },

    updateThemeIcon(icon, theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    },

    // Settings Management
    initSettings() {
        this.initCurrencySettings();
        this.initThemeSettings();
        this.initPrivacyModeSettings();
        this.initCategoryManagement();
        this.initDataManagement();
    },

    initCurrencySettings() {
        const currencySelect = document.getElementById('currency');
        const savedCurrency = localStorage.getItem('currency') || 'USD';
        currencySelect.value = savedCurrency;

        currencySelect.addEventListener('change', async (e) => {
            const newCurrency = e.target.value;
            localStorage.setItem('currency', newCurrency);
            
            // Update all components that display currency
            await this.updateDashboard();
            await this.updateTransactionsList();
            
            // If we're on the reports page, refresh the reports
            const reportsPage = document.getElementById('reports');
            if (reportsPage && reportsPage.classList.contains('active')) {
                await this.generateReport();
            }
            
            // If we're on the goals page, refresh the charts
            const goalsPage = document.getElementById('goals');
            if (goalsPage && goalsPage.classList.contains('active')) {
                await this.updateExpenseLimitsCharts();
            }
            
            // Update subscription and debt summaries if on those pages
            const subscriptionsPage = document.getElementById('subscriptions');
            if (subscriptionsPage && subscriptionsPage.classList.contains('active')) {
                await this.loadSubscriptionData();
            }
            
            const debtsPage = document.getElementById('debts');
            if (debtsPage && debtsPage.classList.contains('active')) {
                await this.updateDebtsSummary();
                await this.updateDebtsLists();
                await this.updateAllDebtsTable();
            }
        });

        this.updateCurrencyDisplay(savedCurrency);
    },

    initThemeSettings() {
        const themeSelect = document.getElementById('theme');
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeSelect.value = savedTheme;

        themeSelect.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(document.querySelector('#themeToggle i'), newTheme);
        });
    },

    initPrivacyModeSettings() {
        const privacyModeToggle = document.getElementById('privacyMode');
        const savedPrivacyMode = localStorage.getItem('privacyMode') === 'true';
        
        if (privacyModeToggle) {
            privacyModeToggle.checked = savedPrivacyMode;
            
            privacyModeToggle.addEventListener('change', async (e) => {
                const isPrivacyMode = e.target.checked;
                localStorage.setItem('privacyMode', isPrivacyMode.toString());
                
                // Refresh dashboard and reports to apply privacy mode
                await this.updateDashboard();
                
                // If we're on the reports page, refresh it too
                const reportsPage = document.getElementById('reports');
                if (reportsPage && reportsPage.classList.contains('active')) {
                    this.generateReport();
                }
            });
        }
    },

    formatCurrencyForDisplay(amount, symbol, options = {}) {
        const isPrivacyMode = localStorage.getItem('privacyMode') === 'true';
        
        if (isPrivacyMode) {
            return `${symbol}------`;
        }
        
        const defaultOptions = {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        return `${symbol}${Number(amount).toLocaleString('en-US', formatOptions)}`;
    },

    formatNumberForDisplay(value, suffix = '') {
        const isPrivacyMode = localStorage.getItem('privacyMode') === 'true';
        
        if (isPrivacyMode) {
            return `------${suffix}`;
        }
        
        return `${value}${suffix}`;
    },

    initCategoryManagement() {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const newCategoryInput = document.getElementById('newCategory');
        const categoriesList = document.getElementById('categoriesList');

        // Load existing categories
        this.loadCategories();

        addCategoryBtn.addEventListener('click', () => {
            const categoryName = newCategoryInput.value.trim();
            if (categoryName) {
                this.addCategory(categoryName);
                newCategoryInput.value = '';
            }
        });

        // Handle category deletion - improved event delegation
        categoriesList.addEventListener('click', (e) => {
            // Find the delete button, whether the click was on the button or the icon inside it
            const deleteButton = e.target.closest('.delete-category');
            if (deleteButton) {
                const category = deleteButton.dataset.category;
                this.deleteCategory(category);
            }
        });
    },

    loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [
            'Food', 'Transportation', 'Entertainment', 'Bills', 'Other'
        ];
        this.updateCategoriesList(categories);
        this.updateCategorySelects(categories);
        this.updateTransactionCategorySelects(categories);
        this.updateReportCategorySelects(categories);
    },

    addCategory(categoryName) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        if (!categories.includes(categoryName)) {
            categories.push(categoryName);
            localStorage.setItem('categories', JSON.stringify(categories));
            this.updateCategoriesList(categories);
            this.updateCategorySelects(categories);
            this.updateTransactionCategorySelects(categories);
            this.updateReportCategorySelects(categories);
        }
    },

    deleteCategory(categoryName) {
        if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const updatedCategories = categories.filter(cat => cat !== categoryName);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
            this.updateCategoriesList(updatedCategories);
            this.updateCategorySelects(updatedCategories);
            this.updateTransactionCategorySelects(updatedCategories);
            this.updateReportCategorySelects(updatedCategories);
        }
    },

    updateCategoriesList(categories) {
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = categories.map(category => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>${category}</span>
                <button class="text-red-600 hover:text-red-800 delete-category" data-category="${category}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },

    updateCategorySelects(categories) {
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        // Update transaction form category select
        const transactionCategorySelect = document.getElementById('transactionCategorySelect');
        if (transactionCategorySelect) {
            const currentValue = transactionCategorySelect.value;
            transactionCategorySelect.innerHTML = categoryOptions;
            if (categories.includes(currentValue)) {
                transactionCategorySelect.value = currentValue;
            }
        }
    },

    updateTransactionCategorySelects(categories) {
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        // Update transaction filter category select
        const filterCategorySelect = document.getElementById('transactionCategory');
        if (filterCategorySelect) {
            const currentValue = filterCategorySelect.value;
            filterCategorySelect.innerHTML = `<option value="">All Categories</option>${categoryOptions}`;
            if (categories.includes(currentValue)) {
                filterCategorySelect.value = currentValue;
            }
        }
    },

    updateReportCategorySelects(categories) {
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        // Update report filter category select if it exists
        const reportCategorySelect = document.getElementById('reportCategory');
        if (reportCategorySelect) {
            const currentValue = reportCategorySelect.value;
            reportCategorySelect.innerHTML = `<option value="">All Categories</option>${categoryOptions}`;
            if (categories.includes(currentValue)) {
                reportCategorySelect.value = currentValue;
            }
        }
    },

    initDataManagement() {
        const exportBtn = document.getElementById('exportDataBtn');
        const importBtn = document.getElementById('importDataBtn');
        const clearBtn = document.getElementById('clearDataBtn');
        const clearCacheBtn = document.getElementById('clearCacheBtn');

        exportBtn.addEventListener('click', () => this.exportData());
        importBtn.addEventListener('click', () => this.importData());
        clearBtn.addEventListener('click', () => this.clearData());
        clearCacheBtn.addEventListener('click', () => this.clearCache());
    },

    async exportData() {
        try {
            // Fetch data from backend API
            const [transactions, categories] = await Promise.all([
                APIManager.getTransactions(),
                (async () => {
                    // Try to fetch categories from localStorage, fallback to default if not found
                    const localCategories = localStorage.getItem('categories');
                    if (localCategories) return JSON.parse(localCategories);
                    return ['Food', 'Transportation', 'Entertainment', 'Bills', 'Other'];
                })()
            ]);
            const settings = {
                currency: localStorage.getItem('currency') || 'USD',
                theme: localStorage.getItem('theme') || 'light'
        };
            const data = { transactions, categories, settings };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance-manager-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validate data structure
                    if (!data.transactions || !data.categories || !data.settings) {
                        throw new Error('Invalid backup file format');
                    }

                    // Import data
                    localStorage.setItem('transactions', JSON.stringify(data.transactions));
                    localStorage.setItem('categories', JSON.stringify(data.categories));
                    localStorage.setItem('currency', data.settings.currency);
                    localStorage.setItem('theme', data.settings.theme);

                    // Update UI
                    this.loadCategories();
                    this.initCurrencySettings();
                    this.initThemeSettings();
                    this.updateDashboard();
                    this.updateCurrencyDisplay(data.settings.currency);
                    this.updateTransactionsList();

                    alert('Data imported successfully!');
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Failed to import data. Please check the file format.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },

    async clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will permanently delete ALL your data from the database and your browser. Are you absolutely sure?')) {
                try {
                    // Call backend to clear all data
                    await fetch('http://localhost:3000/api/clear-all', { method: 'DELETE' });
                } catch (error) {
                    console.error('Error clearing backend data:', error);
                    alert('Failed to clear data from the database.');
                }
                // Clear localStorage
            localStorage.clear();
            this.loadCategories();
            this.initCurrencySettings();
            this.initThemeSettings();
                await this.updateDashboard();
            this.updateCurrencyDisplay(localStorage.getItem('currency') || 'USD');
                await this.updateTransactionsList();
            alert('All data has been cleared.');
            }
        }
    },

    clearCache() {
        if (confirm('Are you sure you want to clear the cache and reload the page? This will refresh all data from the server.')) {
            // Clear browser cache for this site
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => {
                            console.log('Deleting cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                    );
                }).then(() => {
                    console.log('Cache cleared successfully');
                    // Reload the page
                    window.location.reload(true);
                }).catch(error => {
                    console.error('Error clearing cache:', error);
                    alert('Error clearing cache. Please try again.');
                });
            } else {
                // Fallback for browsers that don't support Cache API
                console.log('Cache API not supported, using fallback');
                window.location.reload(true);
            }
        }
    },

    // Initialize everything
    async init() {
        console.log('Initializing application...');
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM fully loaded');
                this.initializeComponents();
            });
        } else {
            console.log('DOM already loaded');
            this.initializeComponents();
        }
    },

    async initializeComponents() {
        console.log('Initializing components...');
        this.initNavigation();
        this.initTransactionModal();
        this.initReports();
        this.initTransactionFilters();
        this.initializeThemeToggle();
        this.initializeSidebarToggle();
        this.initSettings();
        this.initializeDebts();
        this.initializeSubscriptions();
        
        // Update dashboard and transactions list
        console.log('Updating dashboard...');
        await this.updateDashboard();
        console.log('Updating transactions list...');
        await this.updateTransactionsList();
        
        // Add event listener for page visibility changes
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, updating dashboard...');
                await this.updateDashboard();
                await this.updateTransactionsList();
            }
        });
    },

    initializeSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            // Check if sidebar was previously collapsed
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            }

            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Save state to localStorage
                const collapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', collapsed.toString());
                
                // Update toggle button icon
                const icon = sidebarToggle.querySelector('i');
                if (collapsed) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-chevron-right');
                } else {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-bars');
                }
            });

            // Set initial icon based on state
            const icon = sidebarToggle.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-chevron-right');
            }
        }
    },

    async updateExpenseLimitsList() {
        const limitsList = document.getElementById('expense-limits-list');
        if (!limitsList) {
            console.error('Expense limits list container not found');
            return;
        }

        try {
            const limits = await ExpenseLimitsManager.fetchExpenseLimitsStatus();
            console.log('Fetched expense limits:', limits);
            
            // Apply filters
            const startDate = document.getElementById('goalsStartDate').value;
            const endDate = document.getElementById('goalsEndDate').value;
            const category = document.getElementById('goalsCategory').value;
            const filterType = document.getElementById('goalsFilterType').value;

            let filteredLimits = limits;

            if (category) {
                filteredLimits = filteredLimits.filter(limit => limit.category === category);
            }

            if (filterType === 'exceeded') {
                filteredLimits = filteredLimits.filter(limit => limit.exceeded);
            } else if (filterType === 'within') {
                filteredLimits = filteredLimits.filter(limit => !limit.exceeded);
            }
            
            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];
            
            limitsList.innerHTML = filteredLimits.map(limit => `
                <div class="bg-white rounded-lg shadow p-4 ${limit.exceeded ? 'border-l-4 border-red-500' : ''}">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">${limit.category}</h3>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm ${limit.exceeded ? 'text-red-500' : 'text-green-500'}">
                                ${limit.exceeded ? 'Exceeded' : 'Within Limit'}
                            </span>
                            <button class="delete-expense-limit text-red-600 hover:text-red-800 p-1" data-id="${limit.id}" title="Delete Limit">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>Limit: ${symbol}${limit.limit_amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</span>
                            <span>Spent: ${symbol}${limit.spent.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (limit.spent / limit.limit_amount) * 100)}%"></div>
                        </div>
                        <div class="mt-2 text-sm ${limit.exceeded ? 'text-red-500' : 'text-green-500'}">
                            ${limit.exceeded 
                                ? `Exceeded by ${symbol}${limit.exceededBy.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}`
                                : `${symbol}${limit.remaining.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} remaining`}
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            Period: ${new Date(limit.start_date).toLocaleDateString()} - ${new Date(limit.end_date).toLocaleDateString()}
                            <span class="ml-2 text-xs text-gray-500">(${limit.period_type})</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add delete event listeners
            document.querySelectorAll('.delete-expense-limit').forEach(button => {
                button.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this expense limit?')) {
                        const id = button.dataset.id;
                        try {
                            await ExpenseLimitsManager.deleteExpenseLimit(id);
                            
                            // Update all related UI elements
                            await Promise.all([
                                this.updateExpenseLimitsList(),
                                this.updateExpenseLimitsCharts(),
                                this.updateExceededTransactionsList()
                            ]);
                            
                            console.log('Expense limit deleted successfully');
                        } catch (error) {
                            console.error('Error deleting expense limit:', error);
                            alert('Failed to delete expense limit. Please try again.');
                        }
                    }
                });
            });

            // Update overview numbers
            const activeGoals = document.getElementById('activeGoals');
            const exceededLimits = document.getElementById('exceededLimits');
            const totalSpent = document.getElementById('totalSpent');

            if (activeGoals) activeGoals.textContent = filteredLimits.length;
            if (exceededLimits) exceededLimits.textContent = filteredLimits.filter(limit => limit.exceeded).length;
            if (totalSpent) {
                const total = filteredLimits.reduce((sum, limit) => sum + limit.spent, 0);
                totalSpent.textContent = `${symbol}${total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
        } catch (error) {
            console.error('Error updating expense limits list:', error);
            limitsList.innerHTML = '<div class="text-red-500 p-4">Error loading expense limits</div>';
        }
    },

    async updateExceededTransactionsList() {
        try {
            const exceededList = document.getElementById('exceededTransactions');
            if (!exceededList) {
                console.error('Exceeded transactions list container not found');
                return;
            }

            const transactions = await ExpenseLimitsManager.fetchExceededTransactions();
            console.log('Fetched exceeded transactions:', transactions);
            
            // Apply filters
            const startDate = document.getElementById('goalsStartDate').value;
            const endDate = document.getElementById('goalsEndDate').value;
            const category = document.getElementById('goalsCategory').value;

            let filteredTransactions = transactions;

            if (startDate) {
                filteredTransactions = filteredTransactions.filter(t => 
                    new Date(t.date) >= new Date(startDate)
                );
            }

            if (endDate) {
                filteredTransactions = filteredTransactions.filter(t => 
                    new Date(t.date) <= new Date(endDate)
                );
            }

            if (category) {
                filteredTransactions = filteredTransactions.filter(t => 
                    t.category === category
                );
            }
            
            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];
            
            exceededList.innerHTML = filteredTransactions.map(transaction => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(transaction.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">${symbol}${Number(transaction.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">${symbol}${Number(transaction.exceededBy).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error updating exceeded transactions list:', error);
            const exceededList = document.getElementById('exceededTransactions');
            if (exceededList) {
                exceededList.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading exceeded transactions</td></tr>';
            }
        }
    },

    async updateExpenseLimitsCharts() {
        try {
            const isPrivacyMode = localStorage.getItem('privacyMode') === 'true';
            const status = await ExpenseLimitsManager.fetchExpenseLimitsStatus();
            console.log('Fetched expense limits status for charts:', status);
            
            // Apply filters
            const category = document.getElementById('goalsCategory').value;
            const filterType = document.getElementById('goalsFilterType').value;

            let filteredStatus = status;

            if (category) {
                filteredStatus = filteredStatus.filter(s => s.category === category);
            }

            if (filterType === 'exceeded') {
                filteredStatus = filteredStatus.filter(s => s.exceeded);
            } else if (filterType === 'within') {
                filteredStatus = filteredStatus.filter(s => !s.exceeded);
            }
            
            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];
            
            // Category Spending vs Limits Chart
            const categoryChartElement = document.getElementById('category-spending-chart');
            if (categoryChartElement) {
                // Destroy existing chart if it exists
                if (window.categorySpendingChart instanceof Chart) {
                    window.categorySpendingChart.destroy();
                }

                window.categorySpendingChart = new Chart(categoryChartElement, {
                    type: 'bar',
                    data: {
                        labels: filteredStatus.map(s => s.category),
                        datasets: [
                            {
                                label: 'Spent',
                                data: filteredStatus.map(s => s.spent),
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                borderColor: 'rgb(59, 130, 246)',
                                borderWidth: 1
                            },
                            {
                                label: 'Limit',
                                data: filteredStatus.map(s => s.limit_amount),
                                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                                borderColor: 'rgb(16, 185, 129)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        if (isPrivacyMode) {
                                            return '------';
                                        }
                                        return symbol + value.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (isPrivacyMode) {
                                            return context.dataset.label + ': ------';
                                        }
                                        return context.dataset.label + ': ' + symbol + context.raw.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Monthly Spending Trend Chart
            const trendChartElement = document.getElementById('monthly-trend-chart');
            if (trendChartElement) {
                const transactions = await DataManager.getTransactions();
                const monthlyData = {};
                
                // Apply date filters
                const startDate = document.getElementById('goalsStartDate').value;
                const endDate = document.getElementById('goalsEndDate').value;
                
                transactions.forEach(transaction => {
                    if (transaction.type === 'expense') {
                        const transactionDate = new Date(transaction.date);
                        if (
                            (!startDate || transactionDate >= new Date(startDate)) &&
                            (!endDate || transactionDate <= new Date(endDate)) &&
                            (!category || transaction.category === category)
                        ) {
                            const month = transaction.date.substring(0, 7); // YYYY-MM
                            monthlyData[month] = (monthlyData[month] || 0) + Number(transaction.amount);
                        }
                    }
                });

                // Destroy existing chart if it exists
                if (window.monthlyTrendChart instanceof Chart) {
                    window.monthlyTrendChart.destroy();
                }

                window.monthlyTrendChart = new Chart(trendChartElement, {
                    type: 'line',
                    data: {
                        labels: Object.keys(monthlyData).sort(),
                        datasets: [{
                            label: 'Monthly Spending',
                            data: Object.keys(monthlyData).sort().map(month => monthlyData[month]),
                            fill: false,
                            borderColor: 'rgb(59, 130, 246)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        if (isPrivacyMode) {
                                            return '------';
                                        }
                                        return symbol + value.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (isPrivacyMode) {
                                            return context.dataset.label + ': ------';
                                        }
                                        return context.dataset.label + ': ' + symbol + context.raw.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating expense limits charts:', error);
        }
    },

    initGoalsFilters() {
        const filterInputs = [
            'goalsStartDate',
            'goalsEndDate',
            'goalsCategory',
            'goalsFilterType'
        ];

        filterInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('change', async () => {
                await Promise.all([
                    this.updateExpenseLimitsList(),
                    this.updateExpenseLimitsCharts(),
                    this.updateExceededTransactionsList()
                ]);
            });
        });

        // Set default date range to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        document.getElementById('goalsStartDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('goalsEndDate').value = lastDay.toISOString().split('T')[0];

        // Update category options
        const categories = JSON.parse(localStorage.getItem('categories')) || [
            'Food', 'Transportation', 'Entertainment', 'Bills', 'Other'
        ];
        const categorySelect = document.getElementById('goalsCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">All Categories</option>' + 
                categories.map(category => `<option value="${category}">${category}</option>`).join('');
        }

        // Also update the category options in the expense limit modal
        const modalCategorySelect = document.getElementById('category');
        if (modalCategorySelect) {
            modalCategorySelect.innerHTML = categories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('');
        }
    },

    async initializeExpenseLimits() {
        console.log('Initializing expense limits...');
        
        // Initialize expense limit modal
        const modal = document.getElementById('expense-limit-modal');
        const addButton = document.getElementById('addExpenseLimitBtn');
        const closeButton = modal.querySelector('.close-modal');
        const form = document.getElementById('add-expense-limit-form');
        const periodTypeSelect = document.getElementById('period_type');
        const monthlyYearlyFields = document.getElementById('monthlyYearlyFields');
        const customDateFields = document.getElementById('customDateFields');

        console.log('Modal elements:', {
            modal: modal ? 'Found' : 'Not found',
            addButton: addButton ? 'Found' : 'Not found',
            closeButton: closeButton ? 'Found' : 'Not found',
            form: form ? 'Found' : 'Not found'
        });

        // Initialize filters
        this.initGoalsFilters();

        // Handle period type change
        periodTypeSelect.addEventListener('change', () => {
            const periodType = periodTypeSelect.value;
            if (periodType === 'custom') {
                monthlyYearlyFields.classList.add('hidden');
                customDateFields.classList.remove('hidden');
                document.getElementById('start_date').required = true;
                document.getElementById('end_date').required = true;
                document.getElementById('period_start').required = false;
            } else {
                monthlyYearlyFields.classList.remove('hidden');
                customDateFields.classList.add('hidden');
                document.getElementById('start_date').required = false;
                document.getElementById('end_date').required = false;
                document.getElementById('period_start').required = true;
            }
        });

        // Add button click handler
        addButton.addEventListener('click', () => {
            console.log('Add button clicked');
            // Set default dates
            const today = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            
            // Set default month for monthly/yearly periods
            document.getElementById('period_start').value = today.toISOString().slice(0, 7);
            
            // Set default dates for custom period
            document.getElementById('start_date').value = today.toISOString().split('T')[0];
            document.getElementById('end_date').value = endDate.toISOString().split('T')[0];
            
            modal.classList.remove('hidden');
        });

        // Close button click handler
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked');
            modal.classList.add('hidden');
        });

        // Form submission handler
        form.addEventListener('submit', async (e) => {
            console.log('Form submitted');
            e.preventDefault();
            const formData = new FormData(e.target);
            const category = formData.get('category');
            const limitAmount = Number(formData.get('limit_amount'));
            const periodType = formData.get('period_type');
            
            let startDate, endDate;
            
            if (periodType === 'custom') {
                startDate = formData.get('start_date');
                endDate = formData.get('end_date');
            } else {
                const periodStart = new Date(formData.get('period_start'));
                startDate = periodStart.toISOString().split('T')[0];
                
                if (periodType === 'monthly') {
                    endDate = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).toISOString().split('T')[0];
                } else { // yearly
                    endDate = new Date(periodStart.getFullYear() + 1, periodStart.getMonth(), 0).toISOString().split('T')[0];
                }
            }

            console.log('Form data:', { category, limitAmount, periodType, startDate, endDate });

            try {
                console.log('Sending request to add expense limit...');
                await ExpenseLimitsManager.addExpenseLimit(category, limitAmount, periodType, startDate, endDate);
                console.log('Expense limit added successfully');

                // Update all related UI elements
                await Promise.all([
                    this.updateExpenseLimitsList(),
                    this.updateExpenseLimitsCharts(),
                    this.updateExceededTransactionsList()
                ]);
                
                modal.classList.add('hidden');
                form.reset();
                
                console.log('UI updated successfully');
            } catch (error) {
                console.error('Error adding expense limit:', error);
                alert('Failed to add expense limit. Please try again.');
            }
        });

        // Initial updates
        console.log('Performing initial updates...');
        await Promise.all([
            this.updateExpenseLimitsList(),
            this.updateExpenseLimitsCharts(),
            this.updateExceededTransactionsList()
        ]);
        console.log('Expense limits initialization complete');
    },

    async initializeDebts() {
        console.log('Initializing debts...');
        
        // Initialize debt modal
        const modal = document.getElementById('debtModal');
        const addButton = document.getElementById('addDebtBtn');
        const closeButton = modal?.querySelector('.close-modal');
        const form = document.getElementById('debtForm');
        const createdDateInput = document.getElementById('debtCreatedDate');

        console.log('Debt modal elements:', {
            modal: modal ? 'Found' : 'Not found',
            addButton: addButton ? 'Found' : 'Not found',
            closeButton: closeButton ? 'Found' : 'Not found',
            form: form ? 'Found' : 'Not found'
        });

        if (!modal || !addButton || !closeButton || !form) {
            console.error('Some debt modal elements not found');
            return;
        }

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        if (createdDateInput) createdDateInput.value = today;

        // Initialize filters
        this.initDebtFilters();

        // Handle add debt button click
        addButton.addEventListener('click', () => {
            console.log('Add debt button clicked');
            form.reset();
            if (createdDateInput) createdDateInput.value = today;
            modal.classList.remove('hidden');
        });

        // Handle close button click
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked');
            modal.classList.add('hidden');
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            console.log('Debt form submitted');
            e.preventDefault();
            const formData = new FormData(e.target);
            const debt = {
                person_name: formData.get('person_name'),
                amount: Number(formData.get('amount')),
                description: formData.get('description'),
                type: formData.get('type'),
                created_date: formData.get('created_date'),
                due_date: formData.get('due_date') || null
            };

            console.log('Debt data:', debt);

            try {
                console.log('Sending request to add debt...');
                await DebtsManager.addDebt(debt);
                console.log('Debt added successfully');

                // Update all debt UI components
                await Promise.all([
                    this.updateDebtsSummary(),
                    this.updateDebtsLists(),
                    this.updateAllDebtsTable()
                ]);
                
                modal.classList.add('hidden');
                form.reset();
                if (createdDateInput) createdDateInput.value = today;
                
                console.log('Debt UI updated successfully');
            } catch (error) {
                console.error('Error adding debt:', error);
                alert('Failed to add debt. Please try again.');
            }
        });

        // Initial update
        console.log('Performing initial debt updates...');
        await Promise.all([
            this.updateDebtsSummary(),
            this.updateDebtsLists(),
            this.updateAllDebtsTable()
        ]);
        console.log('Debts initialization complete');
    },

    initDebtFilters() {
        const filterInputs = [
            'debtPersonFilter',
            'debtTypeFilter',
            'debtStatusFilter'
        ];

        filterInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', async () => {
                    await Promise.all([
                        this.updateDebtsLists(),
                        this.updateAllDebtsTable()
                    ]);
                });
            }
        });

        // Clear filters button
        const clearButton = document.getElementById('clearDebtFilters');
        if (clearButton) {
            clearButton.addEventListener('click', async () => {
                filterInputs.forEach(inputId => {
                    const element = document.getElementById(inputId);
                    if (element) element.value = '';
                });
                await Promise.all([
                    this.updateDebtsLists(),
                    this.updateAllDebtsTable()
                ]);
            });
        }
    },

    async updateDebtsSummary() {
        try {
            const debts = await DebtsManager.fetchDebts();
            
            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Calculate summary
            const pendingDebts = debts.filter(d => d.status === 'pending');
            const iOwe = pendingDebts.filter(d => d.type === 'owe').reduce((sum, d) => sum + Number(d.amount), 0);
            const owedToMe = pendingDebts.filter(d => d.type === 'owed').reduce((sum, d) => sum + Number(d.amount), 0);
            const netBalance = owedToMe - iOwe;

            // Update summary cards
            const elements = {
                totalIOwe: document.getElementById('totalIOwe'),
                totalOwedToMe: document.getElementById('totalOwedToMe'),
                netDebtBalance: document.getElementById('netDebtBalance'),
                totalDebts: document.getElementById('totalDebts')
            };

            if (elements.totalIOwe) {
                elements.totalIOwe.textContent = `${symbol}${iOwe.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }

            if (elements.totalOwedToMe) {
                elements.totalOwedToMe.textContent = `${symbol}${owedToMe.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }

            if (elements.netDebtBalance) {
                elements.netDebtBalance.textContent = `${symbol}${netBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
                elements.netDebtBalance.className = `text-3xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`;
            }

            if (elements.totalDebts) {
                elements.totalDebts.textContent = pendingDebts.length.toString();
            }

        } catch (error) {
            console.error('Error updating debts summary:', error);
        }
    },

    async updateDebtsLists() {
        try {
            const debts = await DebtsManager.fetchDebts();
            const personFilter = document.getElementById('debtPersonFilter')?.value || '';
            const typeFilter = document.getElementById('debtTypeFilter')?.value || '';
            const statusFilter = document.getElementById('debtStatusFilter')?.value || '';

            // Apply filters
            let filteredDebts = debts;
            if (personFilter) filteredDebts = filteredDebts.filter(d => d.person_name === personFilter);
            if (typeFilter) filteredDebts = filteredDebts.filter(d => d.type === typeFilter);
            if (statusFilter) filteredDebts = filteredDebts.filter(d => d.status === statusFilter);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Update person filter dropdown
            const uniquePeople = [...new Set(debts.map(d => d.person_name))];
            const personFilterElement = document.getElementById('debtPersonFilter');
            if (personFilterElement) {
                const currentValue = personFilterElement.value;
                personFilterElement.innerHTML = '<option value="">All People</option>' +
                    uniquePeople.map(person => `<option value="${person}">${person}</option>`).join('');
                if (uniquePeople.includes(currentValue)) {
                    personFilterElement.value = currentValue;
                }
            }

            // Group debts by person
            const peopleIOwe = {};
            const peopleWhoOweMe = {};

            filteredDebts.forEach(debt => {
                if (debt.type === 'owe') {
                    if (!peopleIOwe[debt.person_name]) peopleIOwe[debt.person_name] = [];
                    peopleIOwe[debt.person_name].push(debt);
                } else {
                    if (!peopleWhoOweMe[debt.person_name]) peopleWhoOweMe[debt.person_name] = [];
                    peopleWhoOweMe[debt.person_name].push(debt);
                }
            });

            // Update "People I Owe" section
            const peopleIOweElement = document.getElementById('peopleIOwe');
            if (peopleIOweElement) {
                peopleIOweElement.innerHTML = Object.keys(peopleIOwe).length === 0
                    ? `<div class="text-center py-8">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                            <i class="fas fa-hand-holding-usd text-2xl text-red-500"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Outstanding Debts</h3>
                        <p class="text-gray-500 dark:text-gray-400">You don't owe anyone money right now.</p>
                    </div>`
                    : Object.entries(peopleIOwe).map(([person, debts]) => {
                        const totalAmount = debts.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);
                        const pendingCount = debts.filter(d => d.status === 'pending').length;
                        const oldestDebt = debts.filter(d => d.status === 'pending').sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
                        const daysSince = oldestDebt ? Math.floor((new Date() - new Date(oldestDebt.created_date)) / (1000 * 60 * 60 * 24)) : 0;
                        
                        return `
                            <div class="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <span class="text-white font-semibold text-sm">${person.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <h4 class="font-semibold text-gray-900 dark:text-gray-100">${person}</h4>
                                    </div>
                                    <span class="text-red-600 dark:text-red-400 font-bold text-lg">${symbol}${totalAmount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">
                                        <i class="fas fa-clock mr-1"></i>
                                        ${pendingCount} debt${pendingCount !== 1 ? 's' : ''}
                                    </span>
                                    ${daysSince > 0 ? `
                                        <span class="text-orange-600 dark:text-orange-400">
                                            <i class="fas fa-calendar-times mr-1"></i>
                                            ${daysSince} day${daysSince !== 1 ? 's' : ''} old
                                        </span>
                                    ` : ''}
                                </div>
                                ${oldestDebt && oldestDebt.due_date ? `
                                    <div class="mt-2 text-xs text-red-600 dark:text-red-400">
                                        <i class="fas fa-exclamation-triangle mr-1"></i>
                                        Due: ${new Date(oldestDebt.due_date).toLocaleDateString()}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
            }

            // Update "People Who Owe Me" section
            const peopleWhoOweMeElement = document.getElementById('peopleWhoOweMe');
            if (peopleWhoOweMeElement) {
                peopleWhoOweMeElement.innerHTML = Object.keys(peopleWhoOweMe).length === 0
                    ? `<div class="text-center py-8">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                            <i class="fas fa-piggy-bank text-2xl text-green-500"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Outstanding IOUs</h3>
                        <p class="text-gray-500 dark:text-gray-400">Nobody owes you money right now.</p>
                    </div>`
                    : Object.entries(peopleWhoOweMe).map(([person, debts]) => {
                        const totalAmount = debts.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);
                        const pendingCount = debts.filter(d => d.status === 'pending').length;
                        const oldestDebt = debts.filter(d => d.status === 'pending').sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
                        const daysSince = oldestDebt ? Math.floor((new Date() - new Date(oldestDebt.created_date)) / (1000 * 60 * 60 * 24)) : 0;
                        
                        return `
                            <div class="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <span class="text-white font-semibold text-sm">${person.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <h4 class="font-semibold text-gray-900 dark:text-gray-100">${person}</h4>
                                    </div>
                                    <span class="text-green-600 dark:text-green-400 font-bold text-lg">${symbol}${totalAmount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">
                                        <i class="fas fa-clock mr-1"></i>
                                        ${pendingCount} debt${pendingCount !== 1 ? 's' : ''}
                                    </span>
                                    ${daysSince > 0 ? `
                                        <span class="text-orange-600 dark:text-orange-400">
                                            <i class="fas fa-calendar-times mr-1"></i>
                                            ${daysSince} day${daysSince !== 1 ? 's' : ''} old
                                        </span>
                                    ` : ''}
                                </div>
                                ${oldestDebt && oldestDebt.due_date ? `
                                    <div class="mt-2 text-xs text-green-600 dark:text-green-400">
                                        <i class="fas fa-calendar-check mr-1"></i>
                                        Due: ${new Date(oldestDebt.due_date).toLocaleDateString()}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
            }

        } catch (error) {
            console.error('Error updating debts lists:', error);
        }
    },

    async updateAllDebtsTable() {
        try {
            const debts = await DebtsManager.fetchDebts();
            const personFilter = document.getElementById('debtPersonFilter')?.value || '';
            const typeFilter = document.getElementById('debtTypeFilter')?.value || '';
            const statusFilter = document.getElementById('debtStatusFilter')?.value || '';

            // Apply filters
            let filteredDebts = debts;
            if (personFilter) filteredDebts = filteredDebts.filter(d => d.person_name === personFilter);
            if (typeFilter) filteredDebts = filteredDebts.filter(d => d.type === typeFilter);
            if (statusFilter) filteredDebts = filteredDebts.filter(d => d.status === statusFilter);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            const allDebtsElement = document.getElementById('allDebts');
            if (allDebtsElement) {
                allDebtsElement.innerHTML = filteredDebts.map(debt => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${debt.person_name}</td>
                        <td class="px-6 py-4 text-sm text-gray-900">${debt.description || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${debt.type === 'owe' ? 'text-red-600' : 'text-green-600'}">
                            ${symbol}${Number(debt.amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${debt.type === 'owe' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                                ${debt.type === 'owe' ? 'I Owe' : 'Owes Me'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${debt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                                ${debt.status === 'pending' ? 'Pending' : 'Paid'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(debt.created_date).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${debt.due_date ? new Date(debt.due_date).toLocaleDateString() : 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                ${debt.status === 'pending' ? `
                                    <button class="mark-paid-debt text-blue-600 hover:text-blue-900" data-id="${debt.id}" title="Mark as Paid">
                                        <i class="fas fa-check"></i>
                                    </button>
                                ` : ''}
                                <button class="delete-debt text-red-600 hover:text-red-900" data-id="${debt.id}" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');

                // Add event listeners for actions
                document.querySelectorAll('.mark-paid-debt').forEach(button => {
                    button.addEventListener('click', async () => {
                        const id = button.dataset.id;
                        try {
                            await DebtsManager.updateDebtStatus(id, 'paid');
                            await Promise.all([
                                this.updateDebtsSummary(),
                                this.updateDebtsLists(),
                                this.updateAllDebtsTable()
                            ]);
                        } catch (error) {
                            console.error('Error marking debt as paid:', error);
                            alert('Failed to mark debt as paid. Please try again.');
                        }
                    });
                });

                document.querySelectorAll('.delete-debt').forEach(button => {
                    button.addEventListener('click', async () => {
                        if (confirm('Are you sure you want to delete this debt?')) {
                            const id = button.dataset.id;
                            try {
                                await DebtsManager.deleteDebt(id);
                                await Promise.all([
                                    this.updateDebtsSummary(),
                                    this.updateDebtsLists(),
                                    this.updateAllDebtsTable()
                                ]);
                            } catch (error) {
                                console.error('Error deleting debt:', error);
                                alert('Failed to delete debt. Please try again.');
                            }
                        }
                    });
                });
            }

        } catch (error) {
            console.error('Error updating all debts table:', error);
        }
    },

    initializeSubscriptions() {
        console.log('Initializing subscriptions...');
        
        // Initialize subscription modal
        const modal = document.getElementById('subscriptionModal');
        const addButton = document.getElementById('addSubscriptionBtn');
        const closeButton = modal?.querySelector('.close-modal');
        const form = document.getElementById('subscriptionForm');

        if (!modal || !addButton || !closeButton || !form) {
            console.error('Some subscription modal elements not found');
            return;
        }

        // Initialize filters
        this.initSubscriptionFilters();

        // Handle add subscription button click
        addButton.addEventListener('click', () => {
            form.reset();
            document.getElementById('subscriptionModalTitle').textContent = 'Add Subscription';
            document.getElementById('subscriptionSubmitBtn').textContent = 'Save Subscription';
            document.getElementById('subscriptionStatusContainer').style.display = 'none';
            
            // Set default next billing date to next month
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            document.getElementById('subscriptionNextBilling').value = nextMonth.toISOString().split('T')[0];
            
            modal.classList.remove('hidden');
        });

        // Handle close button click
        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const subscriptionId = formData.get('subscription_id');
            
            const subscription = {
                name: formData.get('name'),
                cost: Number(formData.get('cost')),
                billing_cycle: formData.get('billing_cycle'),
                next_billing_date: formData.get('next_billing_date'),
                category: formData.get('category'),
                description: formData.get('description') || null,
                status: formData.get('status') || 'active'
            };

            try {
                if (subscriptionId) {
                    await SubscriptionsManager.updateSubscription(subscriptionId, subscription);
                } else {
                    await SubscriptionsManager.addSubscription(subscription);
                }
                
                // Update all subscription UI components
                await this.updateSubscriptionsSummary();
                await this.updateSubscriptionCategories();
                await this.updateUpcomingPayments();
                await this.updateAllSubscriptionsTable();
                
                modal.classList.add('hidden');
                form.reset();
                console.log('Subscription saved successfully');
            } catch (error) {
                console.error('Error saving subscription:', error);
                alert('Failed to save subscription. Please try again.');
            }
        });

        // Initial load of subscription data
        this.loadSubscriptionData();

        console.log('Subscriptions initialization complete');
    },

    initSubscriptionFilters() {
        const filterInputs = [
            'subscriptionCategoryFilter',
            'subscriptionCycleFilter', 
            'subscriptionStatusFilter'
        ];

        filterInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', async () => {
                    await this.updateSubscriptionCategories();
                    await this.updateUpcomingPayments();
                    await this.updateAllSubscriptionsTable();
                });
            }
        });

        // Clear filters button
        const clearButton = document.getElementById('clearSubscriptionFilters');
        if (clearButton) {
            clearButton.addEventListener('click', async () => {
                filterInputs.forEach(inputId => {
                    const element = document.getElementById(inputId);
                    if (element) element.value = '';
                });
                await this.updateSubscriptionCategories();
                await this.updateUpcomingPayments();
                await this.updateAllSubscriptionsTable();
            });
        }
    },

    async loadSubscriptionData() {
        console.log('Loading subscription data...');
        try {
            await this.updateSubscriptionsSummary();
            await this.updateSubscriptionCategories();
            await this.updateUpcomingPayments();
            await this.updateAllSubscriptionsTable();
            console.log('Subscription data loaded successfully');
        } catch (error) {
            console.error('Error loading subscription data:', error);
        }
    },

    async updateSubscriptionsSummary() {
        try {
            const summary = await SubscriptionsManager.fetchSubscriptionsSummary();
            
            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Update summary cards
            const elements = {
                totalActiveSubscriptions: document.getElementById('totalActiveSubscriptions'),
                monthlySubscriptionCost: document.getElementById('monthlySubscriptionCost'),
                yearlySubscriptionCost: document.getElementById('yearlySubscriptionCost'),
                upcomingThisWeek: document.getElementById('upcomingThisWeek')
            };

            if (elements.totalActiveSubscriptions) {
                elements.totalActiveSubscriptions.textContent = summary.total_active.toString();
            }

            if (elements.monthlySubscriptionCost) {
                elements.monthlySubscriptionCost.textContent = `${symbol}${summary.monthly_cost.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }

            if (elements.yearlySubscriptionCost) {
                elements.yearlySubscriptionCost.textContent = `${symbol}${summary.yearly_cost.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }

            if (elements.upcomingThisWeek) {
                elements.upcomingThisWeek.textContent = summary.upcoming_this_week.toString();
            }

            console.log('Summary updated:', summary);
        } catch (error) {
            console.error('Error updating subscriptions summary:', error);
        }
    },

    async updateSubscriptionCategories() {
        try {
            const subscriptions = await SubscriptionsManager.fetchSubscriptions();
            const categoriesElement = document.getElementById('subscriptionCategories');
            
            if (!categoriesElement) return;

            // Apply filters
            const categoryFilter = document.getElementById('subscriptionCategoryFilter')?.value || '';
            const cycleFilter = document.getElementById('subscriptionCycleFilter')?.value || '';
            const statusFilter = document.getElementById('subscriptionStatusFilter')?.value || '';

            let filteredSubscriptions = subscriptions;
            if (categoryFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.category === categoryFilter);
            if (cycleFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.billing_cycle === cycleFilter);
            if (statusFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.status === statusFilter);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Calculate category breakdown from filtered subscriptions
            const categoryBreakdown = {};
            filteredSubscriptions.forEach(sub => {
                const category = sub.category || 'Other';
                if (!categoryBreakdown[category]) {
                    categoryBreakdown[category] = { count: 0, monthly_cost: 0 };
                }
                
                // Calculate monthly equivalent cost
                let monthlyCost = 0;
                const cost = Number(sub.cost);
                switch (sub.billing_cycle) {
                    case 'weekly':
                        monthlyCost = cost * 4.33; // Average weeks per month
                        break;
                    case 'monthly':
                        monthlyCost = cost;
                        break;
                    case 'quarterly':
                        monthlyCost = cost / 3;
                        break;
                    case 'yearly':
                        monthlyCost = cost / 12;
                        break;
                }
                
                categoryBreakdown[category].count++;
                categoryBreakdown[category].monthly_cost += monthlyCost;
            });

            const categories = Object.entries(categoryBreakdown);
            
            if (categories.length === 0) {
                categoriesElement.innerHTML = `
                    <div class="text-center py-8">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                            <i class="fas fa-chart-pie text-2xl text-blue-500"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Categories Yet</h3>
                        <p class="text-gray-500 dark:text-gray-400">Add your first subscription to see category breakdown.</p>
                    </div>
                `;
            } else {
                categoriesElement.innerHTML = categories.map(([category, data]) => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="font-medium text-gray-900 dark:text-gray-100">${category}</span>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-gray-900 dark:text-gray-100">
                                ${symbol}${data.monthly_cost.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}/mo
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                ${data.count} subscription${data.count !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('Error updating subscription categories:', error);
        }
    },

    async updateUpcomingPayments() {
        try {
            const subscriptions = await SubscriptionsManager.fetchSubscriptions();
            const upcomingElement = document.getElementById('upcomingPayments');
            
            if (!upcomingElement) return;

            // Apply filters first
            const categoryFilter = document.getElementById('subscriptionCategoryFilter')?.value || '';
            const cycleFilter = document.getElementById('subscriptionCycleFilter')?.value || '';
            const statusFilter = document.getElementById('subscriptionStatusFilter')?.value || '';

            let filteredSubscriptions = subscriptions;
            if (categoryFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.category === categoryFilter);
            if (cycleFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.billing_cycle === cycleFilter);
            if (statusFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.status === statusFilter);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            // Filter for upcoming payments (next 30 days) and active subscriptions
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            const upcomingPayments = filteredSubscriptions
                .filter(sub => {
                    // Apply status filter if not already applied, otherwise show all for upcoming
                    const statusCheck = statusFilter ? true : sub.status === 'active';
                    return statusCheck && new Date(sub.next_billing_date) <= thirtyDaysFromNow;
                })
                .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));

            if (upcomingPayments.length === 0) {
                upcomingElement.innerHTML = `
                    <div class="text-center py-8">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-50 dark:bg-orange-900/20 mb-4">
                            <i class="fas fa-calendar-check text-2xl text-orange-500"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Upcoming Payments</h3>
                        <p class="text-gray-500 dark:text-gray-400">${categoryFilter || cycleFilter || statusFilter ? 'No payments matching current filters.' : 'All clear for the next 30 days!'}</p>
                    </div>
                `;
            } else {
                upcomingElement.innerHTML = upcomingPayments.map(sub => {
                    const daysUntil = Math.ceil((new Date(sub.next_billing_date) - now) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntil < 0;
                    const isDueSoon = daysUntil <= 7 && daysUntil >= 0;
                    
                    return `
                        <div class="flex justify-between items-center p-3 border rounded-lg ${
                            isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' :
                            isDueSoon ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10' :
                            'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }">
                            <div>
                                <div class="font-medium text-gray-900 dark:text-gray-100">${sub.name}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${sub.category} • ${sub.billing_cycle}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold ${
                                    isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'
                                }">
                                    ${symbol}${Number(sub.cost).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                <div class="text-sm ${
                                    isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : 'text-gray-500'
                                }">
                                    ${isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                                      daysUntil === 0 ? 'Due today' :
                                      `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

        } catch (error) {
            console.error('Error updating upcoming payments:', error);
        }
    },

    async updateAllSubscriptionsTable() {
        try {
            const subscriptions = await SubscriptionsManager.fetchSubscriptions();
            const categoryFilter = document.getElementById('subscriptionCategoryFilter')?.value || '';
            const cycleFilter = document.getElementById('subscriptionCycleFilter')?.value || '';
            const statusFilter = document.getElementById('subscriptionStatusFilter')?.value || '';

            // Apply filters
            let filteredSubscriptions = subscriptions;
            if (categoryFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.category === categoryFilter);
            if (cycleFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.billing_cycle === cycleFilter);
            if (statusFilter) filteredSubscriptions = filteredSubscriptions.filter(s => s.status === statusFilter);

            const currency = localStorage.getItem('currency') || 'USD';
            const currencySymbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹'
            };
            const symbol = currencySymbols[currency];

            const allSubscriptionsElement = document.getElementById('allSubscriptions');
            if (allSubscriptionsElement) {
                allSubscriptionsElement.innerHTML = filteredSubscriptions.map(sub => {
                    const nextPayment = new Date(sub.next_billing_date);
                    const isOverdue = nextPayment < new Date();
                    
                    return `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${sub.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${sub.category}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                ${symbol}${Number(sub.cost).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                <span class="capitalize">${sub.billing_cycle}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}">
                                ${nextPayment.toLocaleDateString()}
                                ${isOverdue ? '<span class="text-xs text-red-500 block">Overdue</span>' : ''}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                    sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    ${sub.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">
                                    <button class="edit-subscription text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" data-id="${sub.id}" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-subscription text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${sub.id}" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Add event listeners for actions
                document.querySelectorAll('.edit-subscription').forEach(button => {
                    button.addEventListener('click', async () => {
                        const id = button.dataset.id;
                        const subscription = filteredSubscriptions.find(s => s.id == id);
                        if (subscription) {
                            this.populateSubscriptionForm(subscription);
                            document.getElementById('subscriptionModalTitle').textContent = 'Edit Subscription';
                            document.getElementById('subscriptionSubmitBtn').textContent = 'Update Subscription';
                            document.getElementById('subscriptionStatusContainer').style.display = 'block';
                            document.getElementById('subscriptionModal').classList.remove('hidden');
                        }
                    });
                });

                document.querySelectorAll('.delete-subscription').forEach(button => {
                    button.addEventListener('click', async () => {
                        if (confirm('Are you sure you want to delete this subscription?')) {
                            const id = button.dataset.id;
                            try {
                                await SubscriptionsManager.deleteSubscription(id);
                                await this.loadSubscriptionData();
                            } catch (error) {
                                console.error('Error deleting subscription:', error);
                                alert('Failed to delete subscription. Please try again.');
                            }
                        }
                    });
                });
            }

            console.log('Subscriptions table updated with', filteredSubscriptions.length, 'items');
        } catch (error) {
            console.error('Error updating all subscriptions table:', error);
        }
    },

    populateSubscriptionForm(subscription) {
        document.getElementById('subscriptionId').value = subscription.id;
        document.getElementById('subscriptionName').value = subscription.name;
        document.getElementById('subscriptionCost').value = subscription.cost;
        document.getElementById('subscriptionBillingCycle').value = subscription.billing_cycle;
        document.getElementById('subscriptionCategory').value = subscription.category;
        document.getElementById('subscriptionNextBilling').value = subscription.next_billing_date;
        document.getElementById('subscriptionStatus').value = subscription.status;
        document.getElementById('subscriptionDescription').value = subscription.description || '';
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
    UIManager.initializeExpenseLimits();
}); 