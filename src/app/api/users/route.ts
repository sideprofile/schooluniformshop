import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// GET handler - Read users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (id) {
      const record = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
      if (record.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Return camelCase JSON
      const user = record[0];
      return NextResponse.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      });
    } else {
      let query = db.select().from(users);
      
      if (search) {
        query = query.where(
          or(
            like(users.email, `%${search}%`),
            like(users.fullName, `%${search}%`)
          )
        );
      }
      
      const records = await query.limit(limit).offset(offset);
      // Return camelCase JSON
      const usersData = records.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      }));
      return NextResponse.json(usersData);
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// POST handler - Create user (signup)
export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json();
    
    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required", 
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "User with this email already exists", 
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }
    
    const newRecord = await db.insert(users).values({
      email: email.trim().toLowerCase(),
      fullName: fullName ? fullName.trim() : null,
      createdAt: new Date().toISOString(),
    }).returning();
    
    // Return camelCase JSON
    const user = newRecord[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// PUT handler - Update user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid user ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const updatedRecord = await db.update(users)
      .set({
        ...updates,
      })
      .where(eq(users.id, parseInt(id)))
      .returning();
    
    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return camelCase JSON
    const user = updatedRecord[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// DELETE handler - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid user ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const deletedRecord = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();
    
    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'User deleted successfully',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}