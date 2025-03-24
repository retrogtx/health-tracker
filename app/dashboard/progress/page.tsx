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

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [metricsRes, workoutRes, dietRes] = await Promise.all([
          fetch('/api/health-metrics'),
          fetch('/api/workout-log'),
          fetch('/api/diet-log'),
        ]);

        if (!metricsRes.ok || !workoutRes.ok || !dietRes.ok) {
          if (metricsRes.status === 404 || workoutRes.status === 404 || dietRes.status === 404) {
            toast.info("No health data found. Start by adding some health metrics, workouts, or diet logs!");
            setHealthMetrics([]);
            setWorkoutLogs([]);
            setDietLogs([]);
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to fetch data");
        }

        const [metricsData, workoutData, dietData] = await Promise.all([
          metricsRes.json(),
          workoutRes.json(),
          dietRes.json(),
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
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load health data. Please try again later.");
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
      
      // Create a temporary style element to override oklch colors
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
          --chart-1: #4a90e2;
          --chart-2: #50e3c2;
          --chart-3: #f5a623;
          --chart-4: #9013fe;
          --chart-5: #7ed321;
        }
      `;
      document.head.appendChild(style);

      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Add header
      pdf.setFontSize(24);
      pdf.text("Health Progress Report", margin, margin + 10);
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, margin + 20);

      // Add user information section
      pdf.setFontSize(16);
      pdf.text("User Information", margin, margin + 40);
      pdf.setFontSize(12);
      pdf.text(`Name: ${session?.user?.name || 'Not provided'}`, margin, margin + 50);
      pdf.text(`Username/Email: ${session?.user?.email || session?.user?.username || 'Not provided'}`, margin, margin + 60);

      // Add latest health metrics summary
      if (healthMetrics.length > 0) {
        const latestMetrics = healthMetrics[0];
        pdf.setFontSize(14);
        pdf.text("Latest Health Metrics", margin, margin + 80);
        pdf.setFontSize(12);
        pdf.text(`Weight: ${latestMetrics.weight} kg`, margin, margin + 90);
        pdf.text(`BMI: ${latestMetrics.bmi}`, margin, margin + 100);
        pdf.text(`Heart Rate: ${latestMetrics.heartRate} bpm`, margin, margin + 110);
        pdf.text(`Blood Pressure: ${latestMetrics.bloodPressure}`, margin, margin + 120);
        pdf.text(`Sleep Hours: ${latestMetrics.sleepHours}`, margin, margin + 130);
      }

      // Add charts
      let currentY = margin + 150;

      // Health Metrics Charts
      if (healthMetrics.length > 0) {
        // Create a temporary container for the weight chart
        const weightChartContainer = document.createElement('div');
        weightChartContainer.style.width = '400px';
        weightChartContainer.style.height = '250px';
        weightChartContainer.style.position = 'absolute';
        weightChartContainer.style.left = '-9999px';
        document.body.appendChild(weightChartContainer);
        
        // Create and render the weight chart
        const weightChartRoot = ReactDOM.createRoot(weightChartContainer);
        weightChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const weightCanvas = await html2canvas(weightChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const weightImgData = weightCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(weightImgData, "PNG", margin, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        weightChartRoot.unmount();
        document.body.removeChild(weightChartContainer);
        
        // Create a temporary container for the BMI chart
        const bmiChartContainer = document.createElement('div');
        bmiChartContainer.style.width = '400px';
        bmiChartContainer.style.height = '250px';
        bmiChartContainer.style.position = 'absolute';
        bmiChartContainer.style.left = '-9999px';
        document.body.appendChild(bmiChartContainer);
        
        // Create and render the BMI chart
        const bmiChartRoot = ReactDOM.createRoot(bmiChartContainer);
        bmiChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const bmiCanvas = await html2canvas(bmiChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const bmiImgData = bmiCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(bmiImgData, "PNG", margin + contentWidth / 2 + 10, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        bmiChartRoot.unmount();
        document.body.removeChild(bmiChartContainer);
        
        currentY += 120;
      }

      // Workout Charts
      if (workoutLogs.length > 0) {
        // Create a temporary container for the duration chart
        const durationChartContainer = document.createElement('div');
        durationChartContainer.style.width = '400px';
        durationChartContainer.style.height = '250px';
        durationChartContainer.style.position = 'absolute';
        durationChartContainer.style.left = '-9999px';
        document.body.appendChild(durationChartContainer);
        
        // Create and render the duration chart
        const durationChartRoot = ReactDOM.createRoot(durationChartContainer);
        durationChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const durationCanvas = await html2canvas(durationChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const durationImgData = durationCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(durationImgData, "PNG", margin, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        durationChartRoot.unmount();
        document.body.removeChild(durationChartContainer);
        
        // Create a temporary container for the calories chart
        const caloriesChartContainer = document.createElement('div');
        caloriesChartContainer.style.width = '400px';
        caloriesChartContainer.style.height = '250px';
        caloriesChartContainer.style.position = 'absolute';
        caloriesChartContainer.style.left = '-9999px';
        document.body.appendChild(caloriesChartContainer);
        
        // Create and render the calories chart
        const caloriesChartRoot = ReactDOM.createRoot(caloriesChartContainer);
        caloriesChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const caloriesCanvas = await html2canvas(caloriesChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const caloriesImgData = caloriesCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(caloriesImgData, "PNG", margin + contentWidth / 2 + 10, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        caloriesChartRoot.unmount();
        document.body.removeChild(caloriesChartContainer);
        
        currentY += 120;
      }

      // Diet Charts
      if (dietLogs.length > 0) {
        // Create a temporary container for the calories chart
        const dietCaloriesChartContainer = document.createElement('div');
        dietCaloriesChartContainer.style.width = '400px';
        dietCaloriesChartContainer.style.height = '250px';
        dietCaloriesChartContainer.style.position = 'absolute';
        dietCaloriesChartContainer.style.left = '-9999px';
        document.body.appendChild(dietCaloriesChartContainer);
        
        // Create and render the calories chart
        const dietCaloriesChartRoot = ReactDOM.createRoot(dietCaloriesChartContainer);
        dietCaloriesChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const dietCaloriesCanvas = await html2canvas(dietCaloriesChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const dietCaloriesImgData = dietCaloriesCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(dietCaloriesImgData, "PNG", margin, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        dietCaloriesChartRoot.unmount();
        document.body.removeChild(dietCaloriesChartContainer);
        
        // Create a temporary container for the macronutrients chart
        const macrosChartContainer = document.createElement('div');
        macrosChartContainer.style.width = '400px';
        macrosChartContainer.style.height = '250px';
        macrosChartContainer.style.position = 'absolute';
        macrosChartContainer.style.left = '-9999px';
        document.body.appendChild(macrosChartContainer);
        
        // Create and render the macronutrients chart
        const macrosChartRoot = ReactDOM.createRoot(macrosChartContainer);
        macrosChartRoot.render(
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
        );
        
        // Wait for the chart to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the chart to canvas
        const macrosCanvas = await html2canvas(macrosChartContainer, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const macrosImgData = macrosCanvas.toDataURL("image/png");
        
        // Add the chart to PDF
        pdf.addImage(macrosImgData, "PNG", margin + contentWidth / 2 + 10, currentY, contentWidth / 2 - 10, 100);
        
        // Clean up
        macrosChartRoot.unmount();
        document.body.removeChild(macrosChartContainer);
      }

      // Add summary statistics
      currentY += 120;
      pdf.setFontSize(14);
      pdf.text("Summary Statistics", margin, currentY);
      pdf.setFontSize(12);
      currentY += 20;

      if (healthMetrics.length > 0) {
        const avgWeight = healthMetrics.reduce((acc, curr) => acc + curr.weight, 0) / healthMetrics.length;
        const avgBMI = healthMetrics.reduce((acc, curr) => acc + curr.bmi, 0) / healthMetrics.length;
        pdf.text(`Average Weight: ${avgWeight.toFixed(1)} kg`, margin, currentY);
        currentY += 10;
        pdf.text(`Average BMI: ${avgBMI.toFixed(1)}`, margin, currentY);
        currentY += 10;
      }

      if (workoutLogs.length > 0) {
        const totalWorkouts = workoutLogs.length;
        const totalCalories = workoutLogs.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
        const avgDuration = workoutLogs.reduce((acc, curr) => acc + curr.duration, 0) / totalWorkouts;
        pdf.text(`Total Workouts: ${totalWorkouts}`, margin, currentY);
        currentY += 10;
        pdf.text(`Total Calories Burned: ${totalCalories}`, margin, currentY);
        currentY += 10;
        pdf.text(`Average Workout Duration: ${avgDuration.toFixed(1)} minutes`, margin, currentY);
        currentY += 10;
      }

      if (dietLogs.length > 0) {
        const avgCalories = dietLogs.reduce((acc, curr) => acc + curr.calories, 0) / dietLogs.length;
        const avgProtein = dietLogs.reduce((acc, curr) => acc + curr.protein, 0) / dietLogs.length;
        const avgCarbs = dietLogs.reduce((acc, curr) => acc + curr.carbs, 0) / dietLogs.length;
        const avgFats = dietLogs.reduce((acc, curr) => acc + curr.fats, 0) / dietLogs.length;
        pdf.text(`Average Daily Calories: ${avgCalories.toFixed(1)}`, margin, currentY);
        currentY += 10;
        pdf.text(`Average Protein: ${avgProtein.toFixed(1)}g`, margin, currentY);
        currentY += 10;
        pdf.text(`Average Carbs: ${avgCarbs.toFixed(1)}g`, margin, currentY);
        currentY += 10;
        pdf.text(`Average Fats: ${avgFats.toFixed(1)}g`, margin, currentY);
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