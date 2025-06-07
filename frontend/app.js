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

            const monthlyTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                console.log('Transaction date:', date, 'Is current month:', isCurrentMonth);
                return isCurrentMonth;
            });
            console.log('Monthly transactions:', monthlyTransactions);

            const income = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Income transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            const expenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => {
                    const amount = Number(t.amount);
                    console.log('Expense transaction:', t.description, amount);
                    return sum + amount;
                }, 0);

            const balance = income - expenses;

            console.log('Calculated stats:', { income, expenses, balance });
            return { income, expenses, balance };
        } catch (error) {
            console.error('Error calculating monthly stats:', error);
            return { income: 0, expenses: 0, balance: 0 };
        }
    }
};

// UI Manager
const UIManager = {
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

        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });
        });

        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const transaction = {
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description'),
                type: formData.get('type'),
                category: formData.get('category')
            };

            try {
                await DataManager.addTransaction(transaction);
                await this.updateDashboard();
                this.updateCurrencyDisplay(localStorage.getItem('currency') || 'USD');
                this.updateTransactionsList();
                modal.classList.add('hidden');
                form.reset();
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

            // Update elements if they exist
            if (elements.balance) {
                const balance = stats.balance || 0;
                elements.balance.textContent = `${symbol}${balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
                console.log('Updated balance:', balance);
            }

            if (elements.income) {
                const income = stats.income || 0;
                elements.income.textContent = `${symbol}${income.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
                console.log('Updated income:', income);
            }

            if (elements.expenses) {
                const expenses = stats.expenses || 0;
                elements.expenses.textContent = `${symbol}${expenses.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
                console.log('Updated expenses:', expenses);
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
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

        const createTransactionRow = (transaction) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}
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

        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update the table
        allTransactions.innerHTML = '';
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4">${transaction.type}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td class="px-6 py-4">
                    <button class="text-red-600 hover:text-red-800 delete-transaction" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            allTransactions.appendChild(row);
        });

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

    initTransactionFilters() {
        const filterInputs = [
            'transactionStartDate',
            'transactionEndDate',
            'transactionCategory',
            'transactionType'
        ];

        filterInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('change', async () => {
                const transactions = await DataManager.getTransactions();
                this.updateFilteredTransactions(transactions);
            });
        });
    },

    // Reports
    initReports() {
        const generateReportBtn = document.getElementById('generateReport');
        const startDateInput = document.getElementById('reportStartDate');
        const endDateInput = document.getElementById('reportEndDate');

        // Set default date range to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        startDateInput.value = firstDay.toISOString().split('T')[0];
        endDateInput.value = lastDay.toISOString().split('T')[0];

        generateReportBtn.addEventListener('click', () => this.generateReport());
        
        // Generate initial report
        this.generateReport();
    },

    async generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const category = document.getElementById('reportCategory').value;
        
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
            incomeElem.textContent = `${symbol}${income.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        if (expensesElem) {
            expensesElem.textContent = `${symbol}${expenses.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        if (netElem) {
            netElem.textContent = `${symbol}${netBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    },

    updateReportCharts(transactions) {
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
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
                    }
                }
            }
        });
    },

    updateReportTransactions(transactions) {
        const tbody = document.getElementById('reportTransactions');
        tbody.innerHTML = '';

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${transaction.description}</td>
                <td class="px-6 py-4">${transaction.category}</td>
                <td class="px-6 py-4">${transaction.type}</td>
                <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}
                </td>
            `;
            tbody.appendChild(row);
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
        this.initCategoryManagement();
        this.initDataManagement();
    },

    initCurrencySettings() {
        const currencySelect = document.getElementById('currency');
        const savedCurrency = localStorage.getItem('currency') || 'USD';
        currencySelect.value = savedCurrency;

        currencySelect.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            localStorage.setItem('currency', newCurrency);
            this.updateCurrencyDisplay(newCurrency);
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

        // Handle category deletion
        categoriesList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-category')) {
                const category = e.target.dataset.category;
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
        const transactionCategorySelect = document.getElementById('category');
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

    exportData() {
        const data = {
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            categories: JSON.parse(localStorage.getItem('categories')) || [],
            settings: {
                currency: localStorage.getItem('currency') || 'USD',
                theme: localStorage.getItem('theme') || 'light'
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance-manager-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            this.loadCategories();
            this.initCurrencySettings();
            this.initThemeSettings();
            this.updateDashboard();
            this.updateCurrencyDisplay(localStorage.getItem('currency') || 'USD');
            this.updateTransactionsList();
            alert('All data has been cleared.');
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
        this.initSettings();
        
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
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
}); 