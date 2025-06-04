
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ShieldCheck, Settings, BarChart2, Users, FileText, DatabaseZap } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login?redirect=/admin');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading admin dashboard...</p>
      </div>
    );
  }
  // If, after loading, user is still null or not admin, redirect (redundant due to useEffect but good for safety)
  if (!user || user.role !== 'ADMIN') return null;

  const adminFeatures = [
    { name: "Manage Elections", href: "/admin/elections", icon: Settings, description: "Create, edit, and activate elections." },
    { name: "Voter Insights", href: "/admin/insights", icon: BarChart2, description: "Generate AI-powered voter analytics." },
    // { name: "Manage Users", href: "/admin/users", icon: Users, description: "View and manage user accounts." },
    { name: "Blockchain Status", href: "/admin/blockchain", icon: DatabaseZap, description: "Monitor and manage the blockchain." },
    // { name: "System Logs", href: "/admin/logs", icon: FileText, description: "Review system activity and logs." },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-md">
        <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary">Admin Dashboard</h1>
        <p className="text-lg text-foreground/80 mt-2">Manage and oversee the BlockVote platform.</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => (
          <Card key={feature.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-primary/10 rounded-full">
                 <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline text-xl">{feature.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardContent>
              <Link href={feature.href} className="w-full">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                  Go to {feature.name}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/admin/elections/new">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Create New Election</Button>
          </Link>
          {/* Add other quick actions here */}
        </CardContent>
      </Card>
    </div>
  );
}

