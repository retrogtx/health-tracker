import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
          Health Tracker
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Monitor your health journey with our simple and effective tracking tools
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="px-8">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your weight, sleep, and activity levels over time.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Set Goals</h3>
            <p className="text-gray-600">Define health targets and track your progress towards them.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Stay Motivated</h3>
            <p className="text-gray-600">Visualize your journey and celebrate your achievements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
