import { db } from '@/db';
import { schools } from '@/db/schema';

async function main() {
    // Replace all existing schools with the specified list
    await db.delete(schools);

    const sampleSchools = [
        {
            name: 'Allied School',
            city: 'Lahore, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Bahria Foundation',
            city: 'Islamabad, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Fauji Foundation',
            city: 'Rawalpindi, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'The Educators',
            city: 'Lahore, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Peace School and College',
            city: 'Peshawar, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Rahmia Islamic Model School',
            city: 'Karachi, PK',
            logoUrl: null,
            coverUrl: null,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(schools).values(sampleSchools);
    
    console.log('✅ Schools seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});