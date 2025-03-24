"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Define a type for the health metric entry
type HealthMetricEntry = {
  id: string;
  heartRate: number | null;
  bloodPressure: string | null;
  sleepHours: number | null;
  weight: number | null;
  bmi: number | null;
  dateRecorded: string;
};

const healthMetricSchema = z.object({
  heartRate: z.number().min(40, "Heart rate should be at least 40").max(200, "Heart rate should be at most 200").optional(),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Blood pressure should be in format SYS/DIA, e.g. 120/80").optional(),
  sleepHours: z.number().min(0, "Sleep hours should be at least 0").max(24, "Sleep hours should be at most 24").optional(),
  weight: z.number().min(30, "Weight should be at least 30").max(200, "Weight should be at most 200").optional(),
  bmi: z.number().min(10, "BMI should be at least 10").max(50, "BMI should be at most 50").optional(),
});

type HealthMetricFormValues = z.infer<typeof healthMetricSchema>;

export default function HealthMetricsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pastEntries, setPastEntries] = useState<HealthMetricEntry[]>([]);
  
  const form = useForm<HealthMetricFormValues>({
    resolver: zodResolver(healthMetricSchema),
    defaultValues: {
      heartRate: undefined,
      bloodPressure: "",
      sleepHours: undefined,
      weight: undefined,
      bmi: undefined,
    },
  });

  useEffect(() => {
    async function fetchHealthMetrics() {
      if (status === "loading") return;
      
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch('/api/health-metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch health metrics');
        }
        
        const metrics = await response.json();
        setPastEntries(metrics);
      } catch (error) {
        console.error("Error fetching health metrics:", error);
        toast.error("Failed to load health metrics");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHealthMetrics();
  }, [router, session, status]);

  async function onSubmit(values: HealthMetricFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/health-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save health metric');
      }

      const newMetric = await response.json();
      
      // Add to past entries for UI feedback
      setPastEntries([newMetric, ...pastEntries]);
      form.reset();
      toast.success("Health metrics saved successfully");
    } catch (error) {
      console.error("Error saving health metric:", error);
      toast.error("Failed to save health metrics");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Health Metrics</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Record New Health Metrics</CardTitle>
          <CardDescription>
            Track your health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart Rate (BPM)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 75" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Between 40-200 BPM</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bloodPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 120/80" {...field} />
                      </FormControl>
                      <FormDescription>Format: SYS/DIA (e.g., 120/80)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 8" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Hours of sleep (0-24)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 70" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Weight in kilograms (30-200)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 22.5" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Body Mass Index (10-50)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Health Metrics"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Health Metrics</CardTitle>
          <CardDescription>
            Your recently recorded health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Heart Rate</th>
                    <th className="px-4 py-2 text-left">Blood Pressure</th>
                    <th className="px-4 py-2 text-left">Sleep Hours</th>
                    <th className="px-4 py-2 text-left">Weight</th>
                    <th className="px-4 py-2 text-left">BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEntries.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-4 py-2">{formatDate(entry.dateRecorded)}</td>
                      <td className="px-4 py-2">{entry.heartRate || '-'}</td>
                      <td className="px-4 py-2">{entry.bloodPressure || '-'}</td>
                      <td className="px-4 py-2">{entry.sleepHours || '-'}</td>
                      <td className="px-4 py-2">{entry.weight || '-'}</td>
                      <td className="px-4 py-2">{entry.bmi || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No health metrics recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 