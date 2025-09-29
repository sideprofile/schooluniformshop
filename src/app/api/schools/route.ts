import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// GET handler - Read schools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (id) {
      const record = await db.select().from(schools).where(eq(schools.id, parseInt(id))).limit(1);
      if (record.length === 0) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      // Return camelCase JSON
      const school = record[0];
      return NextResponse.json({
        id: school.id,
        name: school.name,
        city: school.city,
        logoUrl: school.logoUrl,
        coverUrl: school.coverUrl,
        createdAt: school.createdAt
      });
    } else {
      let query = db.select().from(schools);
      
      if (search) {
        query = query.where(
          or(
            like(schools.name, `%${search}%`),
            like(schools.city, `%${search}%`)
          )
        );
      }
      
      const records = await query.limit(limit).offset(offset);
      // Return camelCase JSON
      const schoolsData = records.map(school => ({
        id: school.id,
        name: school.name,
        city: school.city,
        logoUrl: school.logoUrl,
        coverUrl: school.coverUrl,
        createdAt: school.createdAt
      }));
      return NextResponse.json(schoolsData);
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// POST handler - Create school
export async function POST(request: NextRequest) {
  try {
    const { name, city, logoUrl, coverUrl } = await request.json();
    
    // Validate required fields
    if (!name || !city) {
      return NextResponse.json({ 
        error: "Name and city are required", 
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }
    
    const newRecord = await db.insert(schools).values({
      name: name.trim(),
      city: city.trim(),
      logoUrl: logoUrl || null,
      coverUrl: coverUrl || null,
      createdAt: new Date().toISOString(),
    }).returning();
    
    // Return camelCase JSON
    const school = newRecord[0];
    return NextResponse.json({
      id: school.id,
      name: school.name,
      city: school.city,
      logoUrl: school.logoUrl,
      coverUrl: school.coverUrl,
      createdAt: school.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// PUT handler - Update school
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid school ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const updatedRecord = await db.update(schools)
      .set({
        ...updates,
      })
      .where(eq(schools.id, parseInt(id)))
      .returning();
    
    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    
    // Return camelCase JSON
    const school = updatedRecord[0];
    return NextResponse.json({
      id: school.id,
      name: school.name,
      city: school.city,
      logoUrl: school.logoUrl,
      coverUrl: school.coverUrl,
      createdAt: school.createdAt
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// DELETE handler - Delete school
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid school ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const deletedRecord = await db.delete(schools)
      .where(eq(schools.id, parseInt(id)))
      .returning();
    
    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'School deleted successfully',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}