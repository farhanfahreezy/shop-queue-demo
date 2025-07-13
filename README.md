# Shoppotastic Queue Management System

A modern, real-time queue management system built for retail shops to efficiently manage customer queues with automatic PDF ticket generation.

## 🌟 Features

- **Real-time Queue Updates**: Live updates every 2 seconds without page refresh
- **Automatic PDF Tickets**: Customers receive downloadable queue tickets
- **Admin Dashboard**: Complete queue management with status updates
- **Race Condition Protection**: Prevents duplicate queue numbers
- **Daily Reset**: Queue numbers automatically reset each day
- **Mobile Responsive**: Works seamlessly on all devices
- **Professional Design**: Clean, modern UI with shadcn/ui components

## 🚀 Live Demo

Access the live application at: **https://shop-queue-demo.vercel.app**

- Customer Interface: https://shop-queue-demo.vercel.app
- Admin Dashboard: https://shop-queue-demo.vercel.app/admin

## 🛠 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **jsPDF** - Client-side PDF generation

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **MongoDB** - NoSQL database for flexible data storage

### Why This Stack?

#### Next.js + TypeScript

- **Full-stack Solution**: Single codebase for frontend and backend
- **Server-side Rendering**: Better SEO and performance
- **API Routes**: Built-in serverless functions
- **Type Safety**: Reduces runtime errors and improves maintainability
- **Developer Experience**: Hot reload, built-in optimization

#### MongoDB + Prisma

- **Flexible Schema**: Easy to modify queue structure as business grows
- **Horizontal Scaling**: Can handle high traffic loads
- **Real-time Capabilities**: Perfect for live queue updates
- **Type Safety**: Prisma provides full TypeScript support
- **Cloud Ready**: Easy deployment with MongoDB Atlas

#### Perfect for Queue Management

- **Real-time Updates**: MongoDB's change streams + polling for live data
- **Atomic Operations**: Prevents race conditions in queue numbering
- **Scalability**: Can handle multiple shops and high customer volume
- **Cost Effective**: Serverless architecture reduces operational costs

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/farhanfahreezy/shop-queue-demo.git
   cd shop-queue-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your MongoDB connection string:

   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔄 Real-time Updates Implementation

### Polling Mechanism

The application uses a custom polling hook to fetch live updates every 2 seconds:

```typescript
// hooks/use-polling.ts
export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  interval = 2000,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling interval
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);

  return { data, loading, error, refetch: fetchData };
}
```

### Usage in Components

```typescript
// Customer page - polls every 2 seconds
const { data: customerStatus } = usePolling(getCustomerStatus, 2000);

// Admin page - polls multiple endpoints
const { data: adminStats } = usePolling(getAdminStats, 2000);
const { data: queueData } = usePolling(getAllQueues, 2000);
```

This approach ensures:

- **Real-time Updates**: Data refreshes automatically
- **Efficient**: Only fetches when component is mounted
- **Error Handling**: Graceful degradation on network issues
- **Performance**: Configurable intervals and cleanup

## 🏁 Race Condition Prevention

### The Problem

When multiple customers try to join the queue simultaneously, they might receive the same queue number, causing conflicts.

### Our Solution

We use **Prisma transactions** to ensure atomic operations:

```typescript
// app/api/queue/route.ts - POST endpoint
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // 🔒 ATOMIC TRANSACTION - Prevents race conditions
    const newQueue = await prisma.$transaction(async (tx) => {
      // Step 1: Get the highest queue number for today
      const lastQueue = await tx.queue.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          number: "desc",
        },
      });

      // Step 2: Calculate next queue number
      const nextNumber = lastQueue ? lastQueue.number + 1 : 1;

      // Step 3: Create new queue entry atomically
      const queue = await tx.queue.create({
        data: {
          number: nextNumber,
          date: today,
          name: name.trim(),
          status: "Queuing",
        },
      });

      return queue;
    });

    return NextResponse.json(newQueue, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create queue entry" },
      { status: 500 }
    );
  }
}
```

### How It Works

1. **Transaction Isolation**: The entire operation runs in a single database transaction
2. **Atomic Read-Write**: Finding the last queue number and creating a new entry happens atomically
3. **Consistency**: If two requests arrive simultaneously, they're processed sequentially
4. **Error Recovery**: If any step fails, the entire transaction rolls back

### Database Index for Performance

```prisma
model Queue {
id String @id @default(auto()) @map("\_id") @db.ObjectId
number Int
date DateTime
name String
status QUEUE_STATUS @default(Queuing)

// 🚀 Composite index for fast lookups and uniqueness
@@index([date, number], name: "store_date_number_index")
@@map("queues")
}
```

This ensures:

- **Fast Queries**: Quick lookup of today's highest queue number
- **Data Integrity**: Prevents duplicate queue numbers
- **Scalability**: Efficient even with thousands of queue entries

## 📁 Project Structure

```
shoppotastic-queue/
├── app/
| ├── (site)/
| | ├── (home)/
| | | └── page.tsx # Customer interface
| | └── admin/
| |   └── page.tsx # Admin dashboard
│ ├── api/
│ │ ├── queue/route.ts # Queue CRUD operations
│ │ ├── status-admin/route.ts # Admin statistics
│ │ └── status-customer/route.ts # Customer status
│ └── layout.tsx # Root layout
├── components/
│ ├── ui/ # shadcn/ui components
│ └── navigation.tsx # Navigation header
├── hooks/
│ └── use-polling.ts # Real-time polling hook
├── lib/
│ ├── api.ts # API client functions
│ ├── pdf-generator.ts # PDF ticket generation
│ ├── prisma.ts # Database client
│ └── date.ts # Date utility functions
├── prisma/
│ └── schema.prisma # Database schema
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/api/status-customer` | Current queue number and count |
| GET    | `/api/status-admin`    | Admin dashboard statistics     |
| GET    | `/api/queue`           | All queue entries for today    |
| POST   | `/api/queue`           | Create new queue entry         |
| PUT    | `/api/queue`           | Update queue status            |

## 🎯 Usage

### For Customers

1. Visit the main page
2. Enter your name
3. Click "Enter Queue & Get Ticket"
4. PDF ticket downloads automatically
5. Wait for your number to be called

### For Admins

1. Navigate to `/admin`
2. View real-time queue statistics
3. Manage queue status with dropdowns
4. Monitor customer flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://mongodb.com/) - Database platform

---
