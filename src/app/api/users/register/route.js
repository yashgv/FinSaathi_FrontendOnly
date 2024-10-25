// app/api/user/register/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: 'User already registered' },
        { status: 400 }
      );
    }

    // Insert new user
    await connection.execute(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
      [userId, email, name]
    );

    // Create default savings goals for new user
    const defaultGoals = [
      ['Emergency Fund', 50000],
      ['Investment', 25000],
      ['Vacation', 30000]
    ];

    for (const [title, target_amount] of defaultGoals) {
      await connection.execute(
        'INSERT INTO savings_goals (user_id, title, target_amount) VALUES (?, ?, ?)',
        [userId, title, target_amount]
      );
    }

    connection.release();

    return NextResponse.json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
