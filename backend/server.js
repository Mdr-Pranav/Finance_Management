const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().catch(console.error);

// Transaction routes
app.get('/api/transactions', async (req, res) => {
    try {
        console.log('Fetching transactions from database...');
        const [rows] = await pool.query('SELECT * FROM transactions ORDER BY id DESC');
        console.log('Raw database rows:', rows);

        // Format dates to ISO string
        const formattedRows = rows.map(row => {
            const formatted = {
                ...row,
                date: new Date(row.date).toISOString(),
                amount: Number(row.amount) // Ensure amount is a number
            };
            console.log('Formatted row:', formatted);
            return formatted;
        });

        console.log('Sending transactions:', formattedRows);
        res.json(formattedRows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { amount, description, category, type, date } = req.body;
        console.log('Creating new transaction:', { amount, description, category, type, date });

        const [result] = await pool.query(
            'INSERT INTO transactions (amount, description, category, type, date) VALUES (?, ?, ?, ?, ?)',
            [amount, description, category, type, date]
        );

        const newTransaction = {
            id: result.insertId,
            amount: Number(amount),
            description,
            category,
            type,
            date: date || new Date().toISOString()
        };

        console.log('Created transaction:', newTransaction);
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Expense Limits routes
app.get('/api/expense-limits', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM expense_limits ORDER BY category');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expense limits:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/expense-limits', async (req, res) => {
    try {
        console.log('Received expense limit request:', req.body);
        const { category, limit_amount, period_type, start_date, end_date } = req.body;
        
        if (!category || !limit_amount || !period_type || !start_date || !end_date) {
            return res.status(400).json({ error: 'Category, limit amount, period type, start date, and end date are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO expense_limits (category, limit_amount, period_type, start_date, end_date) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount), period_type = VALUES(period_type), start_date = VALUES(start_date), end_date = VALUES(end_date)',
            [category, limit_amount, period_type, start_date, end_date]
        );

        const newLimit = {
            id: result.insertId,
            category,
            limit_amount: Number(limit_amount),
            period_type,
            start_date,
            end_date
        };

        console.log('Created expense limit:', newLimit);
        res.status(201).json(newLimit);
    } catch (error) {
        console.error('Error creating expense limit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/expense-limits/status', async (req, res) => {
    try {
        // Get all expense limits
        const [limits] = await pool.query('SELECT * FROM expense_limits');
        // Get all transactions
        const [transactions] = await pool.query('SELECT * FROM transactions WHERE type = "expense"');

        // Calculate status for each limit
        const status = limits.map(limit => {
            // Only consider transactions within the limit's period
            const spent = transactions
                .filter(t => t.category === limit.category && new Date(t.date) >= new Date(limit.start_date) && new Date(t.date) <= new Date(limit.end_date))
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const remaining = Number(limit.limit_amount) - spent;
            const exceeded = spent > Number(limit.limit_amount);
            return {
                id: limit.id,
                category: limit.category,
                limit_amount: Number(limit.limit_amount),
                spent,
                remaining,
                exceeded,
                exceededBy: exceeded ? spent - Number(limit.limit_amount) : 0,
                period_type: limit.period_type,
                start_date: limit.start_date,
                end_date: limit.end_date
            };
        });
        res.json(status);
    } catch (error) {
        console.error('Error fetching expense limits status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/expense-limits/exceeded-transactions', async (req, res) => {
    try {
        // Get all expense limits
        const [limits] = await pool.query('SELECT * FROM expense_limits');
        // Get all transactions
        const [transactions] = await pool.query('SELECT * FROM transactions WHERE type = "expense"');

        const exceededTransactions = [];
        limits.forEach(limit => {
            let categoryTotal = 0;
            transactions.forEach(transaction => {
                if (
                    transaction.category === limit.category &&
                    new Date(transaction.date) >= new Date(limit.start_date) &&
                    new Date(transaction.date) <= new Date(limit.end_date)
                ) {
                    categoryTotal += Number(transaction.amount);
                    if (categoryTotal > Number(limit.limit_amount)) {
                        exceededTransactions.push({
                            ...transaction,
                            limit: Number(limit.limit_amount),
                            exceededBy: categoryTotal - Number(limit.limit_amount),
                            period_type: limit.period_type,
                            start_date: limit.start_date,
                            end_date: limit.end_date
                        });
                    }
                }
            });
        });
        res.json(exceededTransactions);
    } catch (error) {
        console.error('Error fetching exceeded transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/expense-limits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expense_limits WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense limit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Goals routes
app.get('/api/goals', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/goals', async (req, res) => {
    try {
        const { name, target_amount, deadline } = req.body;
        const [result] = await pool.query(
            'INSERT INTO goals (name, target_amount, deadline) VALUES (?, ?, ?)',
            [name, target_amount, deadline]
        );
        res.status(201).json({ id: result.insertId, name, target_amount, deadline });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Debts routes
app.get('/api/debts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM debts ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching debts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/debts', async (req, res) => {
    try {
        const { person_name, amount, description, type, created_date, due_date } = req.body;
        
        if (!person_name || !amount || !type || !created_date) {
            return res.status(400).json({ error: 'Person name, amount, type, and created date are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO debts (person_name, amount, description, type, created_date, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [person_name, amount, description, type, created_date, due_date]
        );

        const newDebt = {
            id: result.insertId,
            person_name,
            amount: Number(amount),
            description,
            type,
            created_date,
            due_date,
            status: 'pending'
        };

        res.status(201).json(newDebt);
    } catch (error) {
        console.error('Error creating debt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/debts/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['pending', 'paid'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (pending or paid) is required' });
        }

        await pool.query('UPDATE debts SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating debt status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/debts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM debts WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting debt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/debts/summary', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                type,
                status,
                SUM(amount) as total_amount,
                COUNT(*) as count
            FROM debts 
            GROUP BY type, status
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching debts summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Subscriptions routes
app.get('/api/subscriptions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subscriptions ORDER BY next_billing_date ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/subscriptions', async (req, res) => {
    try {
        const { name, cost, billing_cycle, next_billing_date, category, description } = req.body;
        
        if (!name || !cost || !billing_cycle || !next_billing_date) {
            return res.status(400).json({ error: 'Name, cost, billing cycle, and next billing date are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO subscriptions (name, cost, billing_cycle, next_billing_date, category, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, cost, billing_cycle, next_billing_date, category, description]
        );

        const newSubscription = {
            id: result.insertId,
            name,
            cost: Number(cost),
            billing_cycle,
            next_billing_date,
            category,
            description,
            status: 'active'
        };

        res.status(201).json(newSubscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cost, billing_cycle, next_billing_date, category, description, status } = req.body;
        
        await pool.query(
            'UPDATE subscriptions SET name = ?, cost = ?, billing_cycle = ?, next_billing_date = ?, category = ?, description = ?, status = ? WHERE id = ?',
            [name, cost, billing_cycle, next_billing_date, category, description, status, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/subscriptions/summary', async (req, res) => {
    try {
        const [subscriptions] = await pool.query('SELECT * FROM subscriptions WHERE status = "active"');
        
        const summary = {
            total_active: subscriptions.length,
            monthly_cost: 0,
            yearly_cost: 0,
            upcoming_this_week: 0,
            upcoming_this_month: 0,
            by_category: {}
        };

        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        subscriptions.forEach(sub => {
            const cost = Number(sub.cost);
            const nextBilling = new Date(sub.next_billing_date);

            // Calculate monthly equivalent cost
            let monthlyCost = 0;
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

            summary.monthly_cost += monthlyCost;
            summary.yearly_cost += monthlyCost * 12;

            // Check upcoming payments
            if (nextBilling <= oneWeekFromNow) {
                summary.upcoming_this_week++;
            }
            if (nextBilling <= oneMonthFromNow) {
                summary.upcoming_this_month++;
            }

            // Group by category
            const category = sub.category || 'Other';
            if (!summary.by_category[category]) {
                summary.by_category[category] = { count: 0, monthly_cost: 0 };
            }
            summary.by_category[category].count++;
            summary.by_category[category].monthly_cost += monthlyCost;
        });

        res.json(summary);
    } catch (error) {
        console.error('Error fetching subscription summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear all data endpoint
app.delete('/api/clear-all', async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions');
        await pool.query('DELETE FROM expense_limits');
        await pool.query('DELETE FROM goals');
        await pool.query('DELETE FROM debts');
        await pool.query('DELETE FROM subscriptions');
        res.status(204).send();
    } catch (error) {
        console.error('Error clearing all data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 