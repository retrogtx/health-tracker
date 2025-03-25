/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PlusCircle, Activity, Dumbbell, Utensils, LucideIcon } from "lucide-react";
import ReactDOM from "react-dom/client";

interface HealthMetric {
  dateRecorded: string;
  heartRate: number;
  bloodPressure: string;
  sleepHours: number;
  weight: number;
  bmi: number;
}

interface WorkoutLog {
  dateLogged: string;
  workoutType: string;
  duration: number;
  caloriesBurned: number;
}

interface DietLog {
  dateLogged: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface HealthSuggestion {
  id: string;
  suggestionType: string;
  personalisedSuggestion: string;
  dateIssued: string;
}

const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel,
  onAction 
}: { 
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel: string;
  onAction: () => void;
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-[400px] border-2 border-dashed rounded-lg">
    <Icon className="w-12 h-12 mb-4 text-gray-400" />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
    <Button onClick={onAction} className="gap-2">
      <PlusCircle className="w-4 h-4" />
      {actionLabel}
    </Button>
  </div>
);

export default function ProgressPage() {    
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [healthSuggestions, setHealthSuggestions] = useState<HealthSuggestion[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [metricsRes, workoutRes, dietRes, suggestionsRes] = await Promise.all([
          fetch('/api/health-metrics'),
          fetch('/api/workout-log'),
          fetch('/api/diet-log'),
          fetch('/api/health-suggestions'),
        ]);

        if (!metricsRes.ok || !workoutRes.ok || !dietRes.ok || !suggestionsRes.ok) {
          if (metricsRes.status === 404 || workoutRes.status === 404 || dietRes.status === 404) {
            toast.info("No health data found. Start by adding some health metrics, workouts, or diet logs!");
            setHealthMetrics([]);
            setWorkoutLogs([]);
            setDietLogs([]);
            setHealthSuggestions([]);
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to fetch data");
        }

        const [metricsData, workoutData, dietData, suggestionsData] = await Promise.all([
          metricsRes.json(),
          workoutRes.json(),
          dietRes.json(),
          suggestionsRes.json(),
        ]);

        // Check if any of the data arrays are empty and show specific messages
        if (!metricsData?.length && !workoutData?.length && !dietData?.length) {
          toast.info("No health data found. Start by adding some health metrics, workouts, or diet logs!");
        } else if (!workoutData?.length) {
          toast.info("No workout data found. Start tracking your workouts to monitor your fitness progress!");
        }

        setHealthMetrics(metricsData || []);
        setWorkoutLogs(workoutData || []);
        setDietLogs(dietData || []);
        setHealthSuggestions(suggestionsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load health data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router, session, status]);

  const exportToPDF = async () => {
    try {
      const element = document.getElementById("progress-content");
      if (!element) return;

      const toastId = toast.loading("Generating PDF...");
      
      // Create a temporary style element for better PDF formatting
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --background: #ffffff;
          --foreground: #000000;
          --card: #ffffff;
          --card-foreground: #000000;
          --popover: #ffffff;
          --popover-foreground: #000000;
          --primary: #000000;
          --primary-foreground: #ffffff;
          --secondary: #f5f5f5;
          --secondary-foreground: #000000;
          --muted: #f5f5f5;
          --muted-foreground: #666666;
          --accent: #f5f5f5;
          --accent-foreground: #000000;
          --destructive: #ff4444;
          --border: #e5e5e5;
          --input: #e5e5e5;
          --ring: #000000;
        }
      `;
      document.head.appendChild(style);

      // First fetch the full user profile to get all user details
      let userProfileData = null;
      try {
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          userProfileData = await profileResponse.json();
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }

      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = margin;

      // Helper function to add a new page
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
      };

      // Helper function to check if we need a new page
      const checkForNewPage = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          addNewPage();
          return true;
        }
        return false;
      };

      // Helper function to create a table
      const createTable = (headers: string[], rows: any[][], title: string) => {
        checkForNewPage(40); // Space for title and table headers
        
        // Add title above the table
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(title, margin, currentY);
        currentY += 10;
        
        // Reset font
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        // Calculate column widths
        const colWidth = contentWidth / headers.length;
        
        // Draw headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY - 5, contentWidth, 10, 'F');
        pdf.setFont(undefined, 'bold');
        
        headers.forEach((header: string, i: number) => {
          pdf.text(header, margin + i * colWidth + 2, currentY);
        });
        
        pdf.setFont(undefined, 'normal');
        currentY += 10;
        
        // Draw rows
        rows.forEach((row: any[]) => {
          // Check if we need a new page for this row
          if (checkForNewPage(10)) {
            // Redraw headers on new page
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin, currentY - 5, contentWidth, 10, 'F');
            pdf.setFont(undefined, 'bold');
            
            headers.forEach((header: string, i: number) => {
              pdf.text(header, margin + i * colWidth + 2, currentY);
            });
            
            pdf.setFont(undefined, 'normal');
            currentY += 10;
          }
          
          // Draw row data
          row.forEach((cell: any, i: number) => {
            pdf.text(String(cell || '-'), margin + i * colWidth + 2, currentY);
          });
          currentY += 8;
        });
        
        currentY += 10; // Add spacing after table
      };

      // Add a header with logo
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Health Progress Report", pageWidth / 2, currentY, { align: "center" });
      currentY += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, currentY, { align: "center" });
      currentY += 20;

      // Add user information section
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text("User Information", margin, currentY);
      currentY += 8;
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, margin + 50, currentY);
      currentY += 10;
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      
      // Format all user info in two columns
      if (userProfileData) {
        const userData = [
          { label: "Full Name", value: `${userProfileData.firstName} ${userProfileData.lastName}` },
          { label: "Username", value: userProfileData.username },
          { label: "Email", value: userProfileData.email },
          { label: "Age", value: userProfileData.age || "Not provided" },
          { label: "Gender", value: userProfileData.gender || "Not provided" },
          { label: "Contact", value: userProfileData.contact || "Not provided" },
          { label: "Join Date", value: new Date(userProfileData.joinDate).toLocaleDateString() }
        ];
        
        const colWidth = contentWidth / 2;
        const halfIndex = Math.ceil(userData.length / 2);
        
        // First column
        userData.slice(0, halfIndex).forEach((info, index) => {
          pdf.setFont(undefined, 'bold');
          pdf.text(`${info.label}:`, margin, currentY);
          pdf.setFont(undefined, 'normal');
          pdf.text(`${info.value}`, margin + 30, currentY);
          currentY += 8;
        });
        
        // Reset Y position for second column
        currentY -= 8 * halfIndex;
        
        // Second column
        userData.slice(halfIndex).forEach((info, index) => {
          pdf.setFont(undefined, 'bold');
          pdf.text(`${info.label}:`, margin + colWidth, currentY);
          pdf.setFont(undefined, 'normal');
          pdf.text(`${info.value}`, margin + colWidth + 30, currentY);
          currentY += 8;
        });
        
        // Adjust Y position to after the furthest point
        currentY += 8 * Math.max(0, halfIndex - userData.slice(halfIndex).length);
      } else {
        // Fallback to session data if profile fetch failed
        pdf.text(`Name: ${session?.user?.name || 'Not provided'}`, margin, currentY);
        currentY += 8;
        pdf.text(`Email: ${session?.user?.email || 'Not provided'}`, margin, currentY);
        currentY += 8;
        pdf.text(`User ID: ${session?.user?.id || 'Not provided'}`, margin, currentY);
        currentY += 8;
      }
      
      currentY += 20;

      // Add Health Metrics Data Table
      if (healthMetrics.length > 0) {
        const headers = ['Date', 'Weight (kg)', 'BMI', 'Heart Rate (bpm)', 'Blood Pressure', 'Sleep (hrs)'];
        const rows = healthMetrics.map(metric => [
          new Date(metric.dateRecorded).toLocaleDateString(),
          metric.weight ? metric.weight.toFixed(1) : '-',
          metric.bmi ? metric.bmi.toFixed(1) : '-',
          metric.heartRate || '-',
          metric.bloodPressure || '-',
          metric.sleepHours ? metric.sleepHours.toFixed(1) : '-'
        ]);
        
        createTable(headers, rows, "Health Metrics");
      }

      // Add Workout Logs Data Table
      if (workoutLogs.length > 0) {
        const headers = ['Date', 'Workout Type', 'Duration (min)', 'Calories Burned'];
        const rows = workoutLogs.map(workout => [
          new Date(workout.dateLogged).toLocaleDateString(),
          workout.workoutType,
          workout.duration,
          workout.caloriesBurned || '-'
        ]);
        
        createTable(headers, rows, "Workout Logs");
      }

      // Add Diet Logs Data Table
      if (dietLogs.length > 0) {
        const headers = ['Date', 'Meal Type', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)'];
        const rows = dietLogs.map(diet => [
          new Date(diet.dateLogged).toLocaleDateString(),
          diet.mealType,
          diet.calories || '-',
          diet.protein ? diet.protein.toFixed(1) : '-',
          diet.carbs ? diet.carbs.toFixed(1) : '-',
          diet.fats ? diet.fats.toFixed(1) : '-'
        ]);
        
        createTable(headers, rows, "Diet Logs");
      }

      // Add summary statistics
      checkForNewPage(50);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text("Summary Statistics", margin, currentY);
      currentY += 8;
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, margin + 50, currentY);
      currentY += 10;
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');

      if (healthMetrics.length > 0) {
        const avgWeight = healthMetrics.reduce((acc, curr) => acc + (curr.weight || 0), 0) / healthMetrics.length;
        const avgBMI = healthMetrics.reduce((acc, curr) => acc + (curr.bmi || 0), 0) / healthMetrics.length;
        const avgHeartRate = healthMetrics.reduce((acc, curr) => acc + (curr.heartRate || 0), 0) / healthMetrics.length;
        const avgSleepHours = healthMetrics.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0) / healthMetrics.length;
        
        pdf.text(`Average Weight: ${avgWeight.toFixed(1)} kg`, margin, currentY);
        currentY += 8;
        pdf.text(`Average BMI: ${avgBMI.toFixed(1)}`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Heart Rate: ${avgHeartRate.toFixed(1)} bpm`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Sleep Hours: ${avgSleepHours.toFixed(1)} hours`, margin, currentY);
        currentY += 8;
      }

      if (workoutLogs.length > 0) {
        const totalWorkouts = workoutLogs.length;
        const totalCalories = workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
        const avgDuration = workoutLogs.reduce((acc, curr) => acc + curr.duration, 0) / totalWorkouts;
        const workoutTypes: Record<string, number> = {};
        
        workoutLogs.forEach(log => {
          workoutTypes[log.workoutType] = (workoutTypes[log.workoutType] || 0) + 1;
        });
        
        const favoriteWorkout = Object.entries(workoutTypes)
          .sort((a, b) => b[1] - a[1])
          .map(([type]) => type)[0];
        
        pdf.text(`Total Workouts: ${totalWorkouts}`, margin, currentY);
        currentY += 8;
        pdf.text(`Total Calories Burned: ${totalCalories}`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Workout Duration: ${avgDuration.toFixed(1)} minutes`, margin, currentY);
        currentY += 8;
        pdf.text(`Favorite Workout Type: ${favoriteWorkout}`, margin, currentY);
        currentY += 8;
      }

      if (dietLogs.length > 0) {
        const avgCalories = dietLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0) / dietLogs.length;
        const avgProtein = dietLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0) / dietLogs.length;
        const avgCarbs = dietLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0) / dietLogs.length;
        const avgFats = dietLogs.reduce((acc, curr) => acc + (curr.fats || 0), 0) / dietLogs.length;
        
        pdf.text(`Average Daily Calories: ${avgCalories.toFixed(1)}`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Protein: ${avgProtein.toFixed(1)}g`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Carbs: ${avgCarbs.toFixed(1)}g`, margin, currentY);
        currentY += 8;
        pdf.text(`Average Fats: ${avgFats.toFixed(1)}g`, margin, currentY);
        currentY += 8;
      }

      // Add Health Suggestions section
      if (healthSuggestions.length > 0 || healthMetrics.length > 0 || workoutLogs.length > 0 || dietLogs.length > 0) {
        // Add a new page for suggestions
        pdf.addPage();
        currentY = margin;

        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text("Health Suggestions", margin, currentY);
        currentY += 8;
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, margin + 50, currentY);
        currentY += 10;

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');

        // First add suggestions from the database
        if (healthSuggestions.length > 0) {
          pdf.setFont(undefined, 'bold');
          pdf.text("Personalized Suggestions:", margin, currentY);
          currentY += 8;
          pdf.setFont(undefined, 'normal');

          healthSuggestions.forEach(suggestion => {
            if (checkForNewPage(25)) {
              currentY = margin + 10;
            }
            
            // Add bullet point and suggestion type on its own line
            pdf.setFont(undefined, 'bold');
            pdf.text(`• ${suggestion.suggestionType}:`, margin, currentY);
            currentY += 6; // Move to next line for the suggestion content
            pdf.setFont(undefined, 'normal');
            
            // Word wrap the suggestion text with proper indentation
            const words = suggestion.personalisedSuggestion.split(" ");
            let line = "";
            let lineY = currentY;
            
            words.forEach(word => {
              const testLine = line + word + " ";
              const testWidth = pdf.getStringUnitWidth(testLine) * 11 / pdf.internal.scaleFactor;
              
              if (testWidth > contentWidth - 20) {
                pdf.text(line, margin + 10, lineY); // Increased indentation
                line = word + " ";
                lineY += 6;
                
                if (lineY > pageHeight - margin) {
                  addNewPage();
                  lineY = margin + 10;
                }
              } else {
                line = testLine;
              }
            });
            
            if (line.trim().length > 0) {
              pdf.text(line, margin + 10, lineY); // Increased indentation
              currentY = lineY + 10; // Add more spacing after each suggestion
            } else {
              currentY = lineY + 4; // Still add some spacing if the line is empty
            }
          });
          
          currentY += 10;
        }

        // Then add auto-generated suggestions if needed
        if (healthMetrics.length > 0 || workoutLogs.length > 0 || dietLogs.length > 0) {
          pdf.setFont(undefined, 'bold');
          pdf.text("Additional Recommendations:", margin, currentY);
          currentY += 8;
          pdf.setFont(undefined, 'normal');

          const autoSuggestions = generateHealthSuggestions(healthMetrics, workoutLogs, dietLogs);
          autoSuggestions.forEach(suggestion => {
            if (checkForNewPage(20)) {
              currentY = margin + 10;
            }
            
            // Add bullet point
            pdf.text("•", margin, currentY);
            
            // Word wrap the suggestion text
            const words = suggestion.split(" ");
            let line = "";
            let lineY = currentY;
            
            words.forEach(word => {
              const testLine = line + word + " ";
              const testWidth = pdf.getStringUnitWidth(testLine) * 11 / pdf.internal.scaleFactor;
              
              if (testWidth > contentWidth - 20) {
                pdf.text(line, margin + 15, lineY);
                line = word + " ";
                lineY += 6;
                
                if (lineY > pageHeight - margin) {
                  addNewPage();
                  lineY = margin + 10;
                }
              } else {
                line = testLine;
              }
            });
            
            if (line.trim().length > 0) {
              pdf.text(line, margin + 15, lineY);
              currentY = lineY + 10;
            }
          });
        }
      }

      // Add charts with proper spacing
      if (healthMetrics.length > 0 || workoutLogs.length > 0 || dietLogs.length > 0) {
        // Add a new page for charts
        pdf.addPage();
        currentY = margin;
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text("Visual Data Summary", margin, currentY);
        currentY += 8;
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, margin + 60, currentY);
        currentY += 15;

        // Calculate dimensions for charts (2 per row)
        const chartWidth = contentWidth / 2 - 10;
        const chartHeight = 60; // Reduced height
        let chartY = currentY;
        
        // Add Health Metrics Charts
        if (healthMetrics.length > 0) {
          const promises = [];
          
          // Weight and BMI charts
          promises.push(
            addChartToPDF(
              healthMetrics,
              "weight",
              "Weight Tracking",
              "line",
              "dateRecorded",
              margin,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          promises.push(
            addChartToPDF(
              healthMetrics,
              "bmi",
              "BMI History",
              "line",
              "dateRecorded",
              margin + chartWidth + 20,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          await Promise.all(promises);
          chartY += chartHeight + 30; // Increased spacing between rows
          
          // Heart Rate and Sleep Hours charts
          if (checkForNewPage(chartHeight + 40)) {
            chartY = margin;
          }
          
          promises.length = 0;
          
          promises.push(
            addChartToPDF(
              healthMetrics,
              "heartRate",
              "Heart Rate",
              "line",
              "dateRecorded",
              margin,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          promises.push(
            addChartToPDF(
              healthMetrics,
              "sleepHours",
              "Sleep Hours",
              "line",
              "dateRecorded",
              margin + chartWidth + 20,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          await Promise.all(promises);
          chartY += chartHeight + 30;
        }
        
        // Add Workout Charts
        if (workoutLogs.length > 0) {
          if (checkForNewPage(chartHeight + 40)) {
            chartY = margin;
          }
          
          const promises = [];
          
          promises.push(
            addChartToPDF(
              workoutLogs,
              "duration",
              "Workout Duration",
              "bar",
              "dateLogged",
              margin,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          promises.push(
            addChartToPDF(
              workoutLogs,
              "caloriesBurned",
              "Calories Burned",
              "bar",
              "dateLogged",
              margin + chartWidth + 20,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          await Promise.all(promises);
          chartY += chartHeight + 30;
        }
        
        // Add Diet Charts
        if (dietLogs.length > 0) {
          if (checkForNewPage(chartHeight + 40)) {
            chartY = margin;
          }
          
          const promises = [];
          
          promises.push(
            addChartToPDF(
              dietLogs,
              "calories",
              "Calorie Intake",
              "line",
              "dateLogged",
              margin,
              chartY,
              chartWidth,
              chartHeight,
              pdf
            )
          );
          
          // Create macronutrients chart
          const macroChartContainer = document.createElement('div');
          macroChartContainer.style.width = '400px';
          macroChartContainer.style.height = '250px';
          macroChartContainer.style.position = 'absolute';
          macroChartContainer.style.left = '-9999px';
          document.body.appendChild(macroChartContainer);
          
          const macroChartRoot = ReactDOM.createRoot(macroChartContainer);
          macroChartRoot.render(
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dietLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLogged" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="protein" stroke="#8884d8" name="Protein" />
                <Line type="monotone" dataKey="carbs" stroke="#82ca9d" name="Carbs" />
                <Line type="monotone" dataKey="fats" stroke="#ffc658" name="Fats" />
              </LineChart>
            </ResponsiveContainer>
          );
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const macroCanvas = await html2canvas(macroChartContainer, {
            useCORS: true,
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const macroImgData = macroCanvas.toDataURL("image/png");
          
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text("Macronutrients", margin + chartWidth + 20, chartY - 5);
          
          pdf.addImage(macroImgData, "PNG", margin + chartWidth + 20, chartY, chartWidth, chartHeight);
          
          macroChartRoot.unmount();
          document.body.removeChild(macroChartContainer);
          
          await Promise.all(promises);
          chartY += chartHeight + 30;
        }
      }

      // Save the PDF
      pdf.save("health-progress-report.pdf");
      
      // Remove the temporary style element
      document.head.removeChild(style);
      
      toast.dismiss(toastId);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const addChartToPDF = async (
    data: any[], 
    dataKey: string, 
    title: string, 
    chartType: 'line' | 'bar',
    dateKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    pdf: any
  ) => {
    // Create a temporary container for the chart
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '400px';
    chartContainer.style.height = '250px';
    chartContainer.style.position = 'absolute';
    chartContainer.style.left = '-9999px';
    document.body.appendChild(chartContainer);
    
    // Create and render the chart
    const chartRoot = ReactDOM.createRoot(chartContainer);
    
    if (chartType === 'line') {
      chartRoot.render(
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={dateKey} 
              tickFormatter={(date) => format(new Date(date), "MMM d")}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" name={dataKey} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      chartRoot.render(
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={dateKey} 
              tickFormatter={(date) => format(new Date(date), "MMM d")}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#8884d8" name={dataKey} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // Wait for the chart to render
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Convert the chart to canvas
    const canvas = await html2canvas(chartContainer, {
      useCORS: true,
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png");
    
    // Add title
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, x, y - 5);
    
    // Add the chart to PDF
    pdf.addImage(imgData, "PNG", x, y, width, height);
    
    // Clean up
    chartRoot.unmount();
    document.body.removeChild(chartContainer);
  };

  const navigateToAdd = (type: string) => {
    switch (type) {
      case 'health-metrics':
        router.push('/dashboard/health-metrics');
        break;
      case 'workouts':
        router.push('/dashboard/workout-log');
        break;
      case 'diet':
        router.push('/dashboard/diet-log');
        break;
    }
  };

  const renderHealthMetricsContent = () => {
    if (healthMetrics.length === 0) {
      return (
        <EmptyState
          title="No Health Metrics"
          description="Start tracking your health metrics to see your progress over time. Add measurements like weight, BMI, heart rate, and more."
          icon={Activity}
          actionLabel="Add Health Metrics"
          onAction={() => navigateToAdd('health-metrics')}
        />
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weight Tracking</CardTitle>
            <CardDescription>Your weight progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateRecorded" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BMI History</CardTitle>
            <CardDescription>Your BMI changes over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateRecorded" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWorkoutContent = () => {
    if (workoutLogs.length === 0) {
      return (
        <EmptyState
          title="No Workout Data"
          description="Track your workouts to monitor your fitness progress. Add details about your exercises, duration, and calories burned."
          icon={Dumbbell}
          actionLabel="Log Workout"
          onAction={() => navigateToAdd('workouts')}
        />
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Duration</CardTitle>
            <CardDescription>Minutes spent working out</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLogged" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
            <CardDescription>Calories burned during workouts</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLogged" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="caloriesBurned" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDietContent = () => {
    if (dietLogs.length === 0) {
      return (
        <EmptyState
          title="No Diet Logs"
          description="Keep track of your nutrition by logging your meals. Monitor your calorie intake and macronutrient distribution."
          icon={Utensils}
          actionLabel="Log Meal"
          onAction={() => navigateToAdd('diet')}
        />
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calorie Intake</CardTitle>
            <CardDescription>Daily calorie consumption</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dietLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLogged" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Macronutrients</CardTitle>
            <CardDescription>Protein, Carbs, and Fats distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dietLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLogged" 
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="protein" stroke="#8884d8" />
                <Line type="monotone" dataKey="carbs" stroke="#82ca9d" />
                <Line type="monotone" dataKey="fats" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const generateHealthSuggestions = (
    healthMetrics: HealthMetric[],
    workoutLogs: WorkoutLog[],
    dietLogs: DietLog[]
  ) => {
    const suggestions: string[] = [];

    // Health Metrics Suggestions
    if (healthMetrics.length > 0) {
      const latestMetrics = healthMetrics[healthMetrics.length - 1];
      const avgSleepHours = healthMetrics.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0) / healthMetrics.length;

      if (latestMetrics.bmi > 25) {
        suggestions.push("Your BMI indicates you're above the healthy weight range. Consider increasing physical activity and maintaining a balanced diet.");
      } else if (latestMetrics.bmi < 18.5) {
        suggestions.push("Your BMI indicates you're below the healthy weight range. Consider consulting a nutritionist for a proper diet plan.");
      }

      if (avgSleepHours < 7) {
        suggestions.push("You're averaging less than 7 hours of sleep. Aim for 7-9 hours of sleep per night for optimal health.");
      }

      if (latestMetrics.heartRate > 100) {
        suggestions.push("Your resting heart rate is elevated. Consider stress-reduction techniques and regular cardiovascular exercise.");
      }
    }

    // Workout Suggestions
    if (workoutLogs.length > 0) {
      const last7DaysWorkouts = workoutLogs.filter(log => 
        new Date(log.dateLogged) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (last7DaysWorkouts.length < 3) {
        suggestions.push("Try to maintain at least 3 workouts per week for optimal fitness benefits.");
      }

      const workoutTypes = new Set(workoutLogs.map(log => log.workoutType));
      if (workoutTypes.size < 3) {
        suggestions.push("Consider diversifying your workout routine to include a mix of cardio, strength training, and flexibility exercises.");
      }
    } else {
      suggestions.push("Start incorporating regular physical activity into your routine. Begin with 30 minutes of moderate exercise 3 times a week.");
    }

    // Diet Suggestions
    if (dietLogs.length > 0) {
      const avgCalories = dietLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0) / dietLogs.length;
      const avgProtein = dietLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0) / dietLogs.length;
      const avgCarbs = dietLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0) / dietLogs.length;
      const avgFats = dietLogs.reduce((acc, curr) => acc + (curr.fats || 0), 0) / dietLogs.length;

      if (avgCalories > 2500) {
        suggestions.push("Your average daily calorie intake is high. Consider reducing portion sizes and choosing lower-calorie alternatives.");
      }

      if (avgProtein < 50) {
        suggestions.push("Your protein intake appears to be low. Include more lean meats, fish, legumes, or protein supplements in your diet.");
      }

      const totalMacros = avgProtein + avgCarbs + avgFats;
      const proteinPercentage = (avgProtein * 4 / (totalMacros * 4)) * 100;
      if (proteinPercentage < 20) {
        suggestions.push("Consider increasing your protein intake to support muscle maintenance and recovery.");
      }
    } else {
      suggestions.push("Start tracking your daily food intake to better understand your nutrition patterns and make informed dietary choices.");
    }

    return suggestions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your health data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Progress & Statistics</h1>
          <p className="text-gray-500 mt-1">Track your health journey over time</p>
        </div>
        {(healthMetrics.length > 0 || workoutLogs.length > 0 || dietLogs.length > 0) && (
          <Button onClick={exportToPDF}>
            Export as PDF
          </Button>
        )}
      </div>

      <div id="progress-content" className="space-y-8">
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health" className="gap-2">
              <Activity className="w-4 h-4" />
              Health Metrics
            </TabsTrigger>
            <TabsTrigger value="workout" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout Progress
            </TabsTrigger>
            <TabsTrigger value="diet" className="gap-2">
              <Utensils className="w-4 h-4" />
              Diet Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            {renderHealthMetricsContent()}
          </TabsContent>

          <TabsContent value="workout">
            {renderWorkoutContent()}
          </TabsContent>

          <TabsContent value="diet">
            {renderDietContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 