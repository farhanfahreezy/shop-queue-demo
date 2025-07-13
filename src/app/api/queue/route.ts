import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay } from "@/lib/date";
import { QUEUE_STATUS } from "@prisma/client";

// GET /api/queue - Get all queue data from today only
export async function GET() {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    const queues = await prisma.queue.findMany({
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

    return NextResponse.json(queues);
  } catch (error) {
    console.error("Error fetching queues:", error);
    return NextResponse.json(
      { error: "Failed to fetch queues" },
      { status: 500 }
    );
  }
}

// POST /api/queue - Create a new queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // Use a transaction to ensure atomicity when getting the next queue number
    const newQueue = await prisma.$transaction(async (tx) => {
      // Get the highest queue number for today
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

      // Calculate next queue number (starts from 1 each day)
      const nextNumber = lastQueue ? lastQueue.number + 1 : 1;

      // Create the new queue entry
      const queue = await tx.queue.create({
        data: {
          number: nextNumber,
          date: today,
          name: name.trim(),
          status: QUEUE_STATUS.Queuing,
        },
      });

      return queue;
    });

    return NextResponse.json(newQueue, { status: 201 });
  } catch (error) {
    console.error("Error creating queue:", error);
    return NextResponse.json(
      { error: "Failed to create queue entry" },
      { status: 500 }
    );
  }
}

// PUT /api/queue - Update queue status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Queue ID is required" },
        { status: 400 }
      );
    }

    if (!status || !Object.values(QUEUE_STATUS).includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (Queuing, Processed, or Finished)" },
        { status: 400 }
      );
    }

    const updatedQueue = await prisma.queue.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedQueue);
  } catch (error) {
    console.error("Error updating queue:", error);
    return NextResponse.json(
      { error: "Failed to update queue status" },
      { status: 500 }
    );
  }
}
