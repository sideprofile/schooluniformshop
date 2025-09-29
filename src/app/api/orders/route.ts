import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, cartItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET handler - Get orders for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!userId && !id) {
      return NextResponse.json({ 
        error: "User ID or order ID is required", 
        code: "MISSING_PARAMETERS" 
      }, { status: 400 });
    }
    
    if (id) {
      // Get single order with items
      const orderData = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);
      
      if (orderData.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      // Get order items
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPriceCents: orderItems.unitPriceCents,
          lineTotalCents: orderItems.lineTotalCents,
          product: {
            id: products.id,
            name: products.name,
            imageUrl: products.imageUrl
          }
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, parseInt(id)));
      
      const order = orderData[0];
      return NextResponse.json({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
        items: items.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl
          }
        }))
      });
    } else {
      // Get orders list for user
      const ordersData = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, parseInt(userId)))
        .limit(limit)
        .offset(offset);
      
      // Return camelCase JSON
      const ordersResult = ordersData.map(order => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt
      }));
      
      return NextResponse.json(ordersResult);
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// POST handler - Create order from cart (checkout)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required", 
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }
    
    // Get cart items with product details
    const cartData = await db
      .select({
        cartItem: cartItems,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, parseInt(userId)));
    
    if (cartData.length === 0) {
      return NextResponse.json({ 
        error: "Cart is empty", 
        code: "EMPTY_CART" 
      }, { status: 400 });
    }
    
    // Calculate total
    let totalCents = 0;
    const orderItemsData = cartData.map(item => {
      const lineTotalCents = item.cartItem.quantity * item.product.priceCents;
      totalCents += lineTotalCents;
      
      return {
        productId: item.cartItem.productId,
        quantity: item.cartItem.quantity,
        unitPriceCents: item.product.priceCents,
        lineTotalCents
      };
    });
    
    // Create order
    const newOrder = await db.insert(orders).values({
      userId: parseInt(userId),
      status: 'pending',
      totalCents,
      createdAt: new Date().toISOString(),
    }).returning();
    
    const orderId = newOrder[0].id;
    
    // Create order items
    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      orderId
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.userId, parseInt(userId)));
    
    // Return the created order with camelCase JSON
    const order = newOrder[0];
    return NextResponse.json({
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      itemsCount: orderItemsData.length
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

// PUT handler - Update order status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid order ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    if (!status) {
      return NextResponse.json({ 
        error: "Status is required", 
        code: "MISSING_STATUS" 
      }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: " + validStatuses.join(', '), 
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }
    
    const updatedRecord = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Return camelCase JSON
    const order = updatedRecord[0];
    return NextResponse.json({
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}