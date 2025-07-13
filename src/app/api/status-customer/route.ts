import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay } from "@/lib/date";
import { QUEUE_STATUS } from "@prisma/client";

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // Get current queue being processed (lowest number with "Processed" status)
    const currentProcessed = await prisma.queue.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: QUEUE_STATUS.Processed,
      },
      orderBy: {
        number: "asc",
      },
    });

    // If no one is being processed, get the last finished queue
    let currentNumber = 0;
    if (currentProcessed) {
      currentNumber = currentProcessed.number;
    } else {
      const lastFinished = await prisma.queue.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: QUEUE_STATUS.Finished,
        },
        orderBy: {
          number: "desc",
        },
      });
      currentNumber = lastFinished ? lastFinished.number : 0;
    }

    // Count total people in queue (Queuing status)
    const queueCount = await prisma.queue.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: QUEUE_STATUS.Queuing,
      },
    });

    return NextResponse.json({
      currentNumber,
      queueCount,
    });
  } catch (error) {
    console.error("Error fetching customer status:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer status" },
      { status: 500 }
    );
  }
}
