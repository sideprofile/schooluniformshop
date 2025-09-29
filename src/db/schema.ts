import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const schools = sqliteTable('schools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  city: text('city').notNull(),
  logoUrl: text('logo_url'),
  coverUrl: text('cover_url'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').references(() => schools.id).notNull(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // 'boys', 'girls', 'unisex'
  gradeMin: integer('grade_min').notNull(),
  gradeMax: integer('grade_max').notNull(),
  heightMin: integer('height_min').notNull(),
  heightMax: integer('height_max').notNull(),
  season: text('season').notNull(), // 'summer', 'winter', 'all'
  priceCents: integer('price_cents').notNull(),
  imageUrl: text('image_url'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  createdAt: text('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  totalCents: integer('total_cents').default(0),
  createdAt: text('created_at').notNull(),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  lineTotalCents: integer('line_total_cents').notNull(),
});

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: text('created_at').notNull(),
});