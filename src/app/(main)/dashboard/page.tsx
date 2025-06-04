
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, ShieldCheck, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, isLoading, logout, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }
  
  // If, after loading, user is still null (e.g., token expired and logout happened), redirect
  if (!user) return null;


  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Welcome, {user.username}!</h1>
          <p className="text-lg text-foreground/80 mt-1">This is your personal dashboard. Manage your profile and view your activity.</p>
        </div>
        <Button onClick={logout} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
          Logout
        </Button>
      </section>

      <Card className="shadow-xl w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserCircle className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
            <CardDescription>Details associated with your BlockVote account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <UserCircle className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="font-medium">Username:</span>
            <span className="ml-2 text-foreground/90">{user.username}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            <span className="ml-2 text-foreground/90">{user.email}</span>
          </div>
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="font-medium">Role:</span>
            <span className="ml-2 text-foreground/90 capitalize">{user.role.toLowerCase()}</span>
          </div>
           <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check mr-3 text-muted-foreground"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="font-medium">Verification Status:</span>
            <span className={`ml-2 font-semibold ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
              {user.verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
           {/* <Button variant="outline" size="sm" className="mt-4">
             <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Not Implemented)
           </Button> */}
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Your Recent Activity</h2>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* This section can be populated with user's voting history or other activities in the future */}
            <div className="text-center py-8 text-muted-foreground">
              <Image src="https://placehold.co/300x200.png" alt="No activity yet" width={300} height={200} className="mx-auto mb-4 rounded-md" data-ai-hint="data empty" />
              <p>No recent voting activity to display.</p>
              <Link href="/elections">
                <Button variant="link" className="text-primary mt-2">View Elections</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
