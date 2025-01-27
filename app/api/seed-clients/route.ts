import { db, clients } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await db.insert(clients).values([
    {
      name: 'Sarah Johnson',
      company: 'Creative Visuals Studio',
      email: 'sarah@creativevisuals.com',
      phone: '(555) 123-4567',
      type: 'business',
      status: 'active',
      notes: 'Regular client for promotional videos',
      lastProject: new Date('2024-01-15'),
      createdAt: new Date('2023-06-10')
    },
    {
      name: 'Mike Chen',
      company: null,
      email: 'mike.chen@email.com',
      phone: '(555) 234-5678',
      type: 'individual',
      status: 'active',
      notes: 'Wedding photography client',
      lastProject: new Date('2024-01-20'),
      createdAt: new Date('2023-08-15')
    },
    {
      name: 'Emma Davis',
      company: 'Spotlight Media Agency',
      email: 'emma@spotlightmedia.com',
      phone: '(555) 345-6789',
      type: 'agency',
      status: 'active',
      notes: 'Monthly retainer for social media content',
      lastProject: new Date('2024-01-25'),
      createdAt: new Date('2023-05-01')
    },
    {
      name: 'Tom Wilson',
      company: 'Local Cafe Chain',
      email: 'tom@localcafe.com',
      phone: '(555) 456-7890',
      type: 'business',
      status: 'inactive',
      notes: 'Seasonal menu photography',
      lastProject: new Date('2023-11-30'),
      createdAt: new Date('2023-03-20')
    },
    {
      name: 'Lisa Park',
      company: 'Fashion Forward',
      email: 'lisa@fashionforward.com',
      phone: '(555) 567-8901',
      type: 'business',
      status: 'active',
      notes: 'Product photography and social media content',
      lastProject: new Date('2024-01-10'),
      createdAt: new Date('2023-07-15')
    },
    {
      name: 'David Brown',
      company: 'Marketing Masters',
      email: 'david@marketingmasters.com',
      phone: '(555) 678-9012',
      type: 'agency',
      status: 'active',
      notes: 'Video production for multiple clients',
      lastProject: new Date('2024-01-05'),
      createdAt: new Date('2023-04-10')
    },
    {
      name: 'Rachel Kim',
      company: null,
      email: 'rachel.kim@email.com',
      phone: '(555) 789-0123',
      type: 'individual',
      status: 'active',
      notes: 'Portrait photography client',
      lastProject: new Date('2023-12-15'),
      createdAt: new Date('2023-09-01')
    },
    {
      name: 'James Martinez',
      company: 'Tech Innovators',
      email: 'james@techinnovators.com',
      phone: '(555) 890-1234',
      type: 'business',
      status: 'archived',
      notes: 'Product launch videos and photos',
      lastProject: new Date('2023-06-30'),
      createdAt: new Date('2023-02-15')
    }
  ]);

  return Response.json({
    message: 'Sample clients seeded successfully!'
  });
} 