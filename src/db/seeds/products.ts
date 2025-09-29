import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    await db.delete(products);
    
    console.log('✅ Products table cleared successfully - all records removed');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});