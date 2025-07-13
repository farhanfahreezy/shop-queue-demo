import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay } from "@/lib/date";
import { QUEUE_STATUS } from "@prisma/client";

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // Get all queues for today
    const todayQueues = await prisma.queue.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: todayQueues.length,
      queuing: todayQueues.filter((q) => q.status === QUEUE_STATUS.Queuing)
        .length,
      processed: todayQueues.filter((q) => q.status === QUEUE_STATUS.Processed)
        .length,
      finished: todayQueues.filter((q) => q.status === QUEUE_STATUS.Finished)
        .length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin status:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin status" },
      { status: 500 }
    );
  }
}
