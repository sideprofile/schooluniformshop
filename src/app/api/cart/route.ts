import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET handler - Get cart items for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required", 
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }
    
    // Get cart items with product details
    const cartData = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          priceCents: products.priceCents,
          imageUrl: products.imageUrl,
          schoolId: products.schoolId
        }
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, parseInt(userId)));
    
    // Return camelCase JSON
    const cartItemsData = cartData.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        priceCents: item.product.priceCents,
        imageUrl: item.product.imageUrl,
        schoolId: item.product.schoolId
      }
    }));
    
    return NextResponse.json(cartItemsData);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// POST handler - Add to cart (upsert quantity)
export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json();
    
    // Validate required fields
    if (!userId || !productId || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "userId, productId, and positive quantity are required", 
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }
    
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, parseInt(userId)), eq(cartItems.productId, parseInt(productId))))
      .limit(1);
    
    let result;
    if (existingItem.length > 0) {
      // Update existing item quantity
      result = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem[0].quantity + parseInt(quantity),
          createdAt: new Date().toISOString()
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
    } else {
      // Insert new cart item
      result = await db.insert(cartItems).values({
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        createdAt: new Date().toISOString(),
      }).returning();
    }
    
    // Return camelCase JSON
    const cartItem = result[0];
    return NextResponse.json({
      id: cartItem.id,
      userId: cartItem.userId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt
    }, { status: existingItem.length > 0 ? 200 : 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// PATCH handler - Update cart quantity
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { quantity } = await request.json();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid cart item ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "Positive quantity is required", 
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }
    
    const updatedRecord = await db.update(cartItems)
      .set({ 
        quantity: parseInt(quantity),
        createdAt: new Date().toISOString()
      })
      .where(eq(cartItems.id, parseInt(id)))
      .returning();
    
    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }
    
    // Return camelCase JSON
    const cartItem = updatedRecord[0];
    return NextResponse.json({
      id: cartItem.id,
      userId: cartItem.userId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// DELETE handler - Remove from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid cart item ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    const deletedRecord = await db.delete(cartItems)
      .where(eq(cartItems.id, parseInt(id)))
      .returning();
    
    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Item removed from cart successfully',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}