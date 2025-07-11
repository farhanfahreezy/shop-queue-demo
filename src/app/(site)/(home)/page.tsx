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
import { Clock, Users } from "lucide-react";

// Dummy data for current queue
const currentQueueNumber = 15;
const estimatedWaitTime = "12 minutes";
const totalInQueue = 8;

export default function CustomerPage() {
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnterQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form and show success (in real app, this would redirect or show confirmation)
    setCustomerName("");
    setIsSubmitting(false);
    alert(`Welcome ${customerName}! You've been added to the queue.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Remove the header section since it's now in navigation */}
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
              {currentQueueNumber}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Est. wait: {estimatedWaitTime}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>{totalInQueue} in queue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enter Queue Form */}
        <Card>
          <CardHeader>
            <CardTitle>Join the Queue</CardTitle>
            <CardDescription>Enter your name to get in line</CardDescription>
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
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !customerName.trim()}
              >
                {isSubmitting ? "Adding to Queue..." : "Enter Queue"}
              </Button>
            </form>
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
