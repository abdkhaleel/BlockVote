
"use client";
import Link from 'next/link';
import { Home, ListChecks, LogIn, LogOut, UserPlus, UserCircle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to home after logout
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Zap className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">BlockVote</h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          <Link href="/elections" passHref>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <ListChecks className="mr-2 h-4 w-4" /> Elections
            </Button>
          </Link>

          {isLoading ? (
            <Button variant="ghost" disabled>Loading...</Button>
          ) : user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" passHref>
                  <Button variant="ghost" className="text-foreground hover:text-primary">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard" passHref>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <UserCircle className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="border-primary text-primary hover:bg-primary/10">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="mr-2 h-4 w-4" /> Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
