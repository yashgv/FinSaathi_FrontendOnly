export async function GET() {
    try {
      const { userId } = auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const connection = await pool.getConnection();
      
      const [users] = await connection.execute(
        'SELECT id, email, name, created_at FROM users WHERE id = ?',
        [userId]
      );
  
      connection.release();
  
      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(users[0]);
    } catch (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }