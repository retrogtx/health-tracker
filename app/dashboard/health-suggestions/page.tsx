"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

interface HealthSuggestion {
  id: string;
  suggestionType: string;
  personalisedSuggestion: string;
  dateIssued: string;
}

const suggestionTypes = ["Diet", "Workout", "Rest"] as const;

const suggestionSchema = z.object({
  suggestionType: z.enum(suggestionTypes, {
    required_error: "Please select a suggestion type",
  }),
  personalisedSuggestion: z.string().min(10, {
    message: "Suggestion must be at least 10 characters.",
  }),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

export default function HealthSuggestionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<HealthSuggestion[]>([]);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      suggestionType: undefined,
      personalisedSuggestion: "",
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchSuggestions() {
      try {
        const response = await fetch('/api/health-suggestions');
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast.error("Failed to load suggestions");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [router, session, status]);

  async function onSubmit(values: SuggestionFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/health-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save suggestion');
      }

      const newSuggestion = await response.json();
      setSuggestions([newSuggestion, ...suggestions]);
      form.reset();
      toast.success("Health suggestion saved successfully");
    } catch (error) {
      console.error("Error saving suggestion:", error);
      toast.error("Failed to save suggestion");
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
      <h1 className="text-3xl font-bold mb-8">Health Suggestions</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Suggestion</CardTitle>
            <CardDescription>
              Create a new health suggestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="suggestionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select suggestion type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suggestionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalisedSuggestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggestion</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your health suggestion here..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Add Suggestion"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Health Suggestions</CardTitle>
            <CardDescription>
              Previously saved suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium capitalize">{suggestion.suggestionType}</h3>
                      <p className="text-sm text-gray-500 mt-1">{suggestion.personalisedSuggestion}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(suggestion.dateIssued)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">No suggestions available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 