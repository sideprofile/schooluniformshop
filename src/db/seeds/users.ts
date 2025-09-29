import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'parent1@example.com',
            fullName: 'Sarah Johnson',
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            email: 'parent2@example.com',
            fullName: 'Michael Chen',
            createdAt: new Date('2024-01-16T14:45:00').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});