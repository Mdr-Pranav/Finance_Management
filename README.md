# Personal Finance Manager

A modern web application for managing personal finances, tracking expenses, and monitoring financial goals. Built with Node.js, Express, and MySQL for the backend, and vanilla JavaScript with Tailwind CSS for the frontend.

## Features

### Dashboard

- Real-time overview of total balance, income, and expenses
- Recent transactions list
- Quick access to add new transactions

### Transaction Management

- Add, view, and delete transactions
- Categorize transactions (customizable categories)
- Filter transactions by date, category, and type
- Support for both income and expense tracking

### Financial Reports

- Generate detailed financial reports
- Date range selection
- Category-wise expense analysis
- Visual charts for income vs expenses
- Category distribution visualization

### Budget Management

- Set monthly budgets
- Track spending against budgets
- Category-wise budget allocation
- Visual progress indicators

### Financial Goals

- Set and track financial goals
- Progress monitoring
- Goal completion tracking
- Savings target visualization

### Settings

- Currency selection (USD, EUR, GBP, INR)
- Dark/Light theme toggle
- Custom category management
- Data import/export functionality
- Cache management

## Project Structure

```
personal-finance-manager/
├── backend/
│   ├── database.js      # Database connection and setup
│   ├── server.js        # Express server and API routes
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── app.js          # Main application logic
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Custom styles
│   └── dark-mode.css   # Dark theme styles
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Modern web browser

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd personal-finance-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   cd backend
   npm install
   ```

3. Set up the database:

   - Create a MySQL database named `finance_manager`
   - Update database credentials in `backend/database.js`

4. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

5. Start the frontend:
   - Open `frontend/index.html` in your browser
   - Or use a local server (e.g., Python's `http-server` or Node's `live-server`)

## API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets

- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Add new budget

### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Add new goal

## Technologies Used

- **Frontend:**

  - Vanilla JavaScript
  - Tailwind CSS
  - Chart.js for visualizations
  - Font Awesome for icons

- **Backend:**
  - Node.js
  - Express.js
  - MySQL
  - Sequelize ORM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
