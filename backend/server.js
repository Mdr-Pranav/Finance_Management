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
        const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
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
        const { amount, description, category, type } = req.body;
        console.log('Creating new transaction:', { amount, description, category, type });

        const [result] = await pool.query(
            'INSERT INTO transactions (amount, description, category, type) VALUES (?, ?, ?, ?)',
            [amount, description, category, type]
        );

        const newTransaction = {
            id: result.insertId,
            amount: Number(amount),
            description,
            category,
            type,
            date: new Date().toISOString()
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

// Budget routes
app.get('/api/budgets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM budgets ORDER BY start_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/budgets', async (req, res) => {
    try {
        const { category, amount, start_date, end_date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO budgets (category, amount, start_date, end_date) VALUES (?, ?, ?, ?)',
            [category, amount, start_date, end_date]
        );
        res.status(201).json({ id: result.insertId, category, amount, start_date, end_date });
    } catch (error) {
        console.error('Error creating budget:', error);
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

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 