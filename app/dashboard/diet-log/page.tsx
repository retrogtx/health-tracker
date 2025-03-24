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
import { toast } from "sonner";

const dietLogSchema = z.object({
  mealType: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"], {
    required_error: "Please select a meal type",
  }),
  calories: z.number().min(0, "Calories cannot be negative").optional(),
  protein: z.number().min(0, "Protein cannot be negative").optional(),
  carbs: z.number().min(0, "Carbs cannot be negative").optional(),
  fats: z.number().min(0, "Fats cannot be negative").optional(),
});

type DietLogFormValues = z.infer<typeof dietLogSchema>;

export default function DietLogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pastEntries, setPastEntries] = useState<any[]>([]);
  
  const form = useForm<DietLogFormValues>({
    resolver: zodResolver(dietLogSchema),
    defaultValues: {
      mealType: "Breakfast",
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fats: undefined,
    },
  });

  useEffect(() => {
    async function fetchDietLogs() {
      const session = await auth();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch('/api/diet-log');
        if (!response.ok) {
          throw new Error('Failed to fetch diet logs');
        }
        
        const logs = await response.json();
        setPastEntries(logs);
      } catch (error) {
        console.error("Error fetching diet logs:", error);
        toast.error("Failed to load diet logs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDietLogs();
  }, [router]);

  async function onSubmit(values: DietLogFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/diet-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save diet log');
      }

      const newDietLog = await response.json();
      
      // Add to past entries for UI feedback
      setPastEntries([newDietLog, ...pastEntries]);
      form.reset();
      toast.success("Diet log saved successfully");
    } catch (error) {
      console.error("Error saving diet log:", error);
      toast.error("Failed to save diet log");
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
      <h1 className="text-3xl font-bold mb-8">Diet Log</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Record New Meal</CardTitle>
          <CardDescription>
            Track your daily food intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 500" 
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
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 30" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 60" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fats (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 15" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
                {isSaving ? "Saving..." : "Log Meal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Meals</CardTitle>
          <CardDescription>
            Your recently logged meals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Meal Type</th>
                    <th className="px-4 py-2 text-left">Calories</th>
                    <th className="px-4 py-2 text-left">Protein (g)</th>
                    <th className="px-4 py-2 text-left">Carbs (g)</th>
                    <th className="px-4 py-2 text-left">Fats (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEntries.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-4 py-2">{formatDate(entry.dateLogged)}</td>
                      <td className="px-4 py-2">{entry.mealType}</td>
                      <td className="px-4 py-2">{entry.calories || '-'}</td>
                      <td className="px-4 py-2">{entry.protein || '-'}</td>
                      <td className="px-4 py-2">{entry.carbs || '-'}</td>
                      <td className="px-4 py-2">{entry.fats || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No meals logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 