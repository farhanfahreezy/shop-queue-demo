"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Loader2, Download } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import { getCustomerStatus, createQueue } from "@/lib/api";
import { generateQueueTicketPDF } from "@/lib/pdf-generator";

export default function CustomerPage() {
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [lastCreatedQueue, setLastCreatedQueue] = useState<any>(null);

  // Poll customer status every 2 seconds
  const {
    data: customerStatus,
    loading,
    error,
  } = usePolling(getCustomerStatus, 2000);

  const handleEnterQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);
    setLastCreatedQueue(null);

    try {
      const newQueue = await createQueue({ name: customerName.trim() });

      // Generate and download PDF automatically
      generateQueueTicketPDF({
        name: newQueue.name,
        queueNumber: newQueue.number,
        date: newQueue.date,
        shopName: "Shoppotastic",
      });

      setLastCreatedQueue(newQueue);
      setCustomerName("");
      setSubmitMessage(
        `Welcome ${newQueue.name}! You are queue number ${newQueue.number}. Your ticket has been downloaded.`
      );
    } catch (error) {
      setSubmitMessage("Failed to join queue. Please try again.");
      console.error("Error creating queue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAgain = () => {
    if (lastCreatedQueue) {
      generateQueueTicketPDF({
        name: lastCreatedQueue.name,
        queueNumber: lastCreatedQueue.number,
        date: lastCreatedQueue.date,
        shopName: "Shoppotastic",
      });
    }
  };

  if (loading && !customerStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading queue status</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">Queue Management System</p>
        </div>

        {/* Current Queue Status */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Current Queue Number</CardTitle>
            <CardDescription>Now serving</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {customerStatus?.currentNumber || 0}
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>{customerStatus?.queueCount || 0} people in queue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enter Queue Form */}
        <Card>
          <CardHeader>
            <CardTitle>Join the Queue</CardTitle>
            <CardDescription>
              Enter your name to get in line and receive your ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnterQueue} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !customerName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding to Queue...
                  </>
                ) : (
                  "Enter Queue & Get Ticket"
                )}
              </Button>
            </form>

            {/* Success/Error Message */}
            {submitMessage && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  submitMessage.includes("Failed")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {submitMessage}

                {/* Download Again Button */}
                {lastCreatedQueue && !submitMessage.includes("Failed") && (
                  <div className="mt-3">
                    <Button
                      onClick={handleDownloadAgain}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Ticket Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Info */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600">
              <Download className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="font-medium mb-1">Automatic Ticket Download</p>
              <p>
                Your queue ticket will be automatically downloaded as a PDF when
                you join the queue.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Thank you for choosing Shoppotastic!</p>
        </div>
      </div>
    </div>
  );
}
