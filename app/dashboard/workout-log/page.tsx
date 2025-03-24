"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const workoutTypes = [
  "Cardio",
  "Strength Training",
  "Yoga",
  "Pilates",
  "HIIT",
  "Swimming",
  "Cycling",
  "Running",
  "Walking",
  "Other"
];

const workoutLogSchema = z.object({
  workoutType: z.string({
    required_error: "Please select a workout type",
  }),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  caloriesBurned: z.number().min(0, "Calories cannot be negative").optional(),
});

type WorkoutLogFormValues = z.infer<typeof workoutLogSchema>;

export default function WorkoutLogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pastEntries, setPastEntries] = useState<any[]>([]);
  
  const form = useForm<WorkoutLogFormValues>({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: {
      workoutType: "Cardio",
      duration: 30,
      caloriesBurned: undefined,
    },
  });

  useEffect(() => {
    async function checkAuth() {
      const session = await auth();
      if (!session) {
        router.push("/login");
      } else {
        // TODO: Fetch past workout log entries
        // For now, use mock data
        setPastEntries([
          { id: '1', dateLogged: new Date().toLocaleDateString(), workoutType: 'Cardio', duration: 30, caloriesBurned: 320 },
          { id: '2', dateLogged: new Date(Date.now() - 86400000).toLocaleDateString(), workoutType: 'Strength Training', duration: 45, caloriesBurned: 280 }
        ]);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  function onSubmit(values: WorkoutLogFormValues) {
    // TODO: Save workout log data to database
    console.log(values);
    // Add to past entries for UI feedback
    setPastEntries([
      {
        id: String(Date.now()),
        dateLogged: new Date().toLocaleDateString(),
        ...values
      },
      ...pastEntries
    ]);
    form.reset({ workoutType: "Cardio", duration: 30, caloriesBurned: undefined });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Workout Log</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Record New Workout</CardTitle>
          <CardDescription>
            Track your workout activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="workoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {workoutTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 30" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="caloriesBurned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories Burned</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 300" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto">Log Workout</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>
            Your recently logged workout activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Workout Type</th>
                    <th className="px-4 py-2 text-left">Duration (min)</th>
                    <th className="px-4 py-2 text-left">Calories Burned</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEntries.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-4 py-2">{entry.dateLogged}</td>
                      <td className="px-4 py-2">{entry.workoutType}</td>
                      <td className="px-4 py-2">{entry.duration}</td>
                      <td className="px-4 py-2">{entry.caloriesBurned || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No workouts logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 