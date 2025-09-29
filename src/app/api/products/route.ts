import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, gte, lte } from 'drizzle-orm';

// GET handler - Always return empty array (no products available)
export async function GET(request: NextRequest) {
  // Always return no products (and 404 for specific id) as per request to remove all products
  const { searchParams } = new URL(request.url);
  if (searchParams.get('id')) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json([]);
}

// POST handler - Method Not Allowed
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Method Not Allowed - Product creation is disabled' 
  }, { status: 405 });
}

// PUT handler - Method Not Allowed
export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Method Not Allowed - Product updates are disabled' 
  }, { status: 405 });
}

// DELETE handler - Method Not Allowed
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Method Not Allowed - Product deletion is disabled' 
  }, { status: 405 });
}