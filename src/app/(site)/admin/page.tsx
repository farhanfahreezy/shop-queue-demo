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
import { RefreshCw, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import {
  getAdminStats,
  getAllQueues,
  updateQueueStatus,
  type QueueEntry,
} from "@/lib/api";
import { QUEUE_STATUS } from "@prisma/client";

type QueueStatus = "Queuing" | "Processed" | "Finished";

export default function AdminPage() {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Poll admin stats every 2 seconds
  const {
    data: adminStats,
    loading: statsLoading,
    error: statsError,
  } = usePolling(getAdminStats, 2000);

  // Poll queue data every 2 seconds
  const {
    data: queueData,
    loading: queueLoading,
    error: queueError,
    refetch: refetchQueues,
  } = usePolling(getAllQueues, 2000);

  const handleStatusChange = async (id: string, newStatus: QueueStatus) => {
    setUpdatingStatus(id);
    try {
      await updateQueueStatus({ id, status: newStatus });
      // Refetch data to get updated information
      await refetchQueues();
    } catch (error) {
      console.error("Error updating queue status:", error);
      alert("Failed to update queue status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRefresh = async () => {
    await refetchQueues();
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case QUEUE_STATUS.Queuing:
        return <Badge variant="secondary">Queuing</Badge>;
      case QUEUE_STATUS.Processed:
        return <Badge variant="outline">Processed</Badge>;
      case QUEUE_STATUS.Finished:
        return <Badge variant="default">Finished</Badge>;
    }
  };

  if ((statsLoading && !adminStats) || (queueLoading && !queueData)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError || queueError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading admin data</p>
          <p className="text-sm text-gray-600">{statsError || queueError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Queue Management System</p>
            </div>
            <Button onClick={handleRefresh} disabled={queueLoading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${queueLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

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
                  <p className="text-2xl font-bold">{adminStats?.total || 0}</p>
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
                  <p className="text-2xl font-bold">
                    {adminStats?.queuing || 0}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {adminStats?.processed || 0}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {adminStats?.finished || 0}
                  </p>
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
            {queueData && queueData.length > 0 ? (
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
                  {queueData.map((item: QueueEntry) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        #{item.number}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value: QueueStatus) =>
                            handleStatusChange(item.id, value)
                          }
                          disabled={updatingStatus === item.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                            {updatingStatus === item.id && (
                              <Loader2 className="h-3 w-3 animate-spin ml-2" />
                            )}
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No queue entries for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
