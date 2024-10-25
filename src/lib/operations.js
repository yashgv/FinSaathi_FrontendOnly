import { executeQuery } from './db';
import { v4 as uuidv4 } from 'uuid';

export const expenseOperations = {
  // Create new expense
  async createExpense({ userId, amount, description, categoryId, date }) {
    const query = `
      INSERT INTO expenses (id, userId, amount, description, categoryId, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [uuidv4(), userId, amount, description, categoryId, new Date(date)];
    return executeQuery({ query, values });
  },

  // Get user's expenses with category info
  async getUserExpenses(userId, limit = 10, offset = 0) {
    const query = `
      SELECT e.*, c.name as categoryName, c.color as categoryColor
      FROM expenses e
      LEFT JOIN categories c ON e.categoryId = c.id
      WHERE e.userId = ?
      ORDER BY e.date DESC
      LIMIT ? OFFSET ?
    `;
    return executeQuery({ query, values: [userId, limit, offset] });
  },

  // Get monthly expense summary
  async getMonthlyExpenses(userId, year, month) {
    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        SUM(amount) as totalAmount,
        COUNT(*) as transactionCount
      FROM expenses
      WHERE userId = ? 
        AND YEAR(date) = ? 
        AND MONTH(date) = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
      ORDER BY date
    `;
    return executeQuery({ query, values: [userId, year, month] });
  },

  // Get category-wise expenses
  async getCategoryExpenses(userId, startDate, endDate) {
    const query = `
      SELECT 
        c.name as category,
        c.color as categoryColor,
        SUM(e.amount) as totalAmount,
        COUNT(*) as transactionCount
      FROM expenses e
      JOIN categories c ON e.categoryId = c.id
      WHERE e.userId = ?
        AND e.date BETWEEN ? AND ?
      GROUP BY c.id, c.name, c.color
      ORDER BY totalAmount DESC
    `;
    return executeQuery({ query, values: [userId, startDate, endDate] });
  }
};

export const budgetOperations = {
  // Create or update budget
  async upsertBudget({ userId, amount, month }) {
    const query = `
      INSERT INTO budgets (id, userId, amount, month)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      amount = VALUES(amount)
    `;
    const values = [uuidv4(), userId, amount, month];
    return executeQuery({ query, values });
  },

  // Get user's current budget
  async getCurrentBudget(userId) {
    const query = `
      SELECT *
      FROM budgets
      WHERE userId = ?
        AND month = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
    `;
    return executeQuery({ query, values: [userId] });
  }
};

export const savingsOperations = {
  // Create saving goal
  async createSavingGoal({ userId, title, amount, goal, targetDate }) {
    const query = `
      INSERT INTO savings (id, userId, title, amount, goal, targetDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [uuidv4(), userId, title, amount, goal, targetDate];
    return executeQuery({ query, values });
  },

  // Get user's saving goals
  async getSavingGoals(userId) {
    const query = `
      SELECT *,
        (amount / goal * 100) as progress
      FROM savings
      WHERE userId = ?
      ORDER BY targetDate ASC
    `;
    return executeQuery({ query, values: [userId] });
  }
};

export const insightOperations = {
  // Generate and store insights
  async generateInsights(userId) {
    // Get spending trends
    const spendingTrend = await executeQuery({
      query: `
        SELECT 
          AVG(current_month.total_amount) as current_month_avg,
          AVG(previous_month.total_amount) as previous_month_avg
        FROM (
          SELECT SUM(amount) as total_amount
          FROM expenses
          WHERE userId = ?
            AND date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            AND date < DATE_ADD(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
        ) as current_month
        CROSS JOIN (
          SELECT SUM(amount) as total_amount
          FROM expenses
          WHERE userId = ?
            AND date >= DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
            AND date < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
        ) as previous_month
      `,
      values: [userId, userId]
    });

    // Store insights
    if (spendingTrend[0].current_month_avg > spendingTrend[0].previous_month_avg) {
      await executeQuery({
        query: `
          INSERT INTO insights (id, userId, type, title, description, importance)
          VALUES (?, ?, 'SPENDING_ALERT', 'Increased Spending Detected', 
            'Your spending this month is higher than last month. Consider reviewing your expenses.', 2)
        `,
        values: [uuidv4(), userId]
      });
    }
  },

  // Get user's insights
  async getUserInsights(userId) {
    const query = `
      SELECT *
      FROM insights
      WHERE userId = ?
      ORDER BY importance DESC, createdAt DESC
      LIMIT 5
    `;
    return executeQuery({ query, values: [userId] });
  }
};



export const userOperations = {
  // Create or update user from Clerk data
  async upsertUser({ 
    clerkId, 
    email, 
    firstName, 
    lastName, 
    imageUrl 
  }) {
    const query = `
      INSERT INTO users (
        id,
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl,
        createdAt,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        firstName = VALUES(firstName),
        lastName = VALUES(lastName),
        imageUrl = VALUES(imageUrl),
        updatedAt = NOW()
    `;

    const values = [
      uuidv4(),
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl
    ];

    return executeQuery({ query, values });
  },

  // Get user by Clerk ID
  async getUserByClerkId(clerkId) {
    const query = `
      SELECT *
      FROM users
      WHERE clerkId = ?
    `;
    const results = await executeQuery({ query, values: [clerkId] });
    return results[0];
  },

  // Get user by internal ID
  async getUserById(userId) {
    const query = `
      SELECT *
      FROM users
      WHERE id = ?
    `;
    const results = await executeQuery({ query, values: [userId] });
    return results[0];
  },

  // Update user's last login
  async updateLastLogin(userId) {
    const query = `
      UPDATE users
      SET lastLoginAt = NOW()
      WHERE id = ?
    `;
    return executeQuery({ query, values: [userId] });
  },

  // Get user's profile with summary statistics
  async getUserProfile(userId) {
    const query = `
      SELECT 
        u.*,
        COUNT(DISTINCT e.id) as totalTransactions,
        SUM(e.amount) as totalSpent,
        COUNT(DISTINCT s.id) as activeSavingGoals
      FROM users u
      LEFT JOIN expenses e ON u.id = e.userId
      LEFT JOIN savings s ON u.id = s.userId
      WHERE u.id = ?
      GROUP BY u.id
    `;
    const results = await executeQuery({ query, values: [userId] });
    return results[0];
  }
};