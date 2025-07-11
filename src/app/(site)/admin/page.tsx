"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Clock, CheckCircle } from "lucide-react";

// Dummy queue data
const initialQueueData = [
  {
    id: 1,
    queueNumber: 16,
    customerName: "John Smith",
    timestamp: "2024-01-15 10:30:00",
    status: "Queuing" as const,
  },
  {
    id: 2,
    queueNumber: 17,
    customerName: "Sarah Johnson",
    timestamp: "2024-01-15 10:32:15",
    status: "Queuing" as const,
  },
  {
    id: 3,
    queueNumber: 18,
    customerName: "Mike Davis",
    timestamp: "2024-01-15 10:35:22",
    status: "Queuing" as const,
  },
  {
    id: 4,
    queueNumber: 19,
    customerName: "Emily Brown",
    timestamp: "2024-01-15 10:38:45",
    status: "Queuing" as const,
  },
  {
    id: 5,
    queueNumber: 15,
    customerName: "David Wilson",
    timestamp: "2024-01-15 10:25:10",
    status: "Processed" as const,
  },
  {
    id: 6,
    queueNumber: 14,
    customerName: "Lisa Anderson",
    timestamp: "2024-01-15 10:20:30",
    status: "Finished" as const,
  },
  {
    id: 7,
    queueNumber: 13,
    customerName: "Robert Taylor",
    timestamp: "2024-01-15 10:15:45",
    status: "Finished" as const,
  },
];

type QueueStatus = "Queuing" | "Processed" | "Finished";

export default function AdminPage() {
  const [queueData, setQueueData] = useState(initialQueueData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleStatusChange = (id: number, newStatus: QueueStatus) => {
    setQueueData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "Queuing":
        return <Badge variant="secondary">Queuing</Badge>;
      case "Processed":
        return <Badge variant="outline">Processed</Badge>;
      case "Finished":
        return <Badge variant="default">Finished</Badge>;
    }
  };

  const stats = {
    total: queueData.length,
    queuing: queueData.filter((item) => item.status === "Queuing").length,
    processed: queueData.filter((item) => item.status === "Processed").length,
    finished: queueData.filter((item) => item.status === "Finished").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - simplified since navigation is now separate */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Queue Management System</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Queue
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Queuing</p>
                  <p className="text-2xl font-bold">{stats.queuing}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold">{stats.processed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Finished</p>
                  <p className="text-2xl font-bold">{stats.finished}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Management</CardTitle>
            <CardDescription>
              Manage customer queue status and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue #</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueData
                  .sort((a, b) => b.queueNumber - a.queueNumber)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        #{item.queueNumber}
                      </TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value: QueueStatus) =>
                            handleStatusChange(item.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Queuing">Queuing</SelectItem>
                            <SelectItem value="Processed">Processed</SelectItem>
                            <SelectItem value="Finished">Finished</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
