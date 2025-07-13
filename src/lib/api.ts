// API functions for frontend
export interface CustomerStatus {
  currentNumber: number;
  queueCount: number;
}

export interface AdminStats {
  total: number;
  queuing: number;
  processed: number;
  finished: number;
}

export interface QueueEntry {
  id: string;
  number: number;
  date: string;
  name: string;
  status: "Queuing" | "Processed" | "Finished";
}

export interface CreateQueueRequest {
  name: string;
}

export interface UpdateQueueRequest {
  id: string;
  status: "Queuing" | "Processed" | "Finished";
}

// Customer API functions
export async function getCustomerStatus(): Promise<CustomerStatus> {
  const response = await fetch("/api/status-customer");
  if (!response.ok) {
    throw new Error("Failed to fetch customer status");
  }
  return response.json();
}

export async function createQueue(
  data: CreateQueueRequest
): Promise<QueueEntry> {
  const response = await fetch("/api/queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create queue entry");
  }
  return response.json();
}

// Admin API functions
export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/status-admin");
  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }
  return response.json();
}

export async function getAllQueues(): Promise<QueueEntry[]> {
  const response = await fetch("/api/queue");
  if (!response.ok) {
    throw new Error("Failed to fetch queue data");
  }
  return response.json();
}

export async function updateQueueStatus(
  data: UpdateQueueRequest
): Promise<QueueEntry> {
  const response = await fetch("/api/queue", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update queue status");
  }
  return response.json();
}
