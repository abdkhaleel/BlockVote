
"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { Election, ApiResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2, Power, PowerOff, Settings, ListFilter, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const fetchAdminElections = async (token: string | null): Promise<Election[]> => {
  return apiClient<Election[]>('/elections', { token }); // Assuming admin gets all elections
};

export default function ManageElectionsPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login?redirect=/admin/elections');
    }
  }, [user, authLoading, router]);

  const { data: elections, isLoading, error } = useQuery<Election[], Error>({
    queryKey: ['adminElections'],
    queryFn: () => fetchAdminElections(token),
    enabled: !!token && !!user && user.role === 'ADMIN',
  });

  const mutationOptions = {
    onSuccess: (data: ApiResponse) => {
      toast({ title: "Success", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['adminElections'] });
    },
    onError: (error: any) => {
      toast({ title: "Operation Failed", description: error.data?.message || error.message, variant: "destructive" });
    },
  };

  const deleteMutation = useMutation<ApiResponse, Error, string>(
    (electionId) => apiClient<ApiResponse>(`/elections/${electionId}`, { method: 'DELETE', token }),
    mutationOptions
  );
  const activateMutation = useMutation<ApiResponse, Error, string>(
    (electionId) => apiClient<ApiResponse>(`/elections/${electionId}/activate`, { method: 'POST', token }),
    mutationOptions
  );
  const deactivateMutation = useMutation<ApiResponse, Error, string>(
    (electionId) => apiClient<ApiResponse>(`/elections/${electionId}/deactivate`, { method: 'POST', token }),
    mutationOptions
  );

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Loading elections management...</p></div>;
  }
  if (!user || user.role !== 'ADMIN') return null; // Should be handled by useEffect redirect

  if (error) {
    return <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-destructive"><AlertTriangle className="h-12 w-12 mb-4" /><p className="text-xl">Failed to load elections: {error.message}</p></div>;
  }

  const filteredElections = elections?.filter(election => {
    if (filter === 'active') return election.active;
    if (filter === 'inactive') return !election.active;
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Settings className="h-10 w-10 text-primary" />
                    <CardTitle className="text-3xl font-headline">Manage Elections</CardTitle>
                </div>
                <CardDescription>Oversee, create, and modify all electoral events on the platform.</CardDescription>
            </div>
          <Link href="/admin/elections/new">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Election
            </Button>
          </Link>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Election List</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" /> Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('inactive')}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredElections.length > 0 ? filteredElections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${election.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {election.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{format(parseISO(election.startDate), 'PPp')}</TableCell>
                  <TableCell>{format(parseISO(election.endDate), 'PPp')}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link href={`/admin/elections/${election.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>
                    </Link>
                     <Link href={`/admin/elections/${election.id}/candidates`}>
                        <Button variant="ghost" size="icon" title="Manage Candidates">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </Button>
                    </Link>
                     <Link href={`/admin/elections/${election.id}/voters`}>
                        <Button variant="ghost" size="icon" title="Manage Voters">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                        </Button>
                    </Link>
                    <Link href={`/elections/${election.id}`} passHref>
                        <Button variant="ghost" size="icon" title="View Results">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                        </Button>
                    </Link>
                    {election.active ? (
                      <Button variant="ghost" size="icon" title="Deactivate" onClick={() => deactivateMutation.mutate(election.id)} disabled={deactivateMutation.isPending && deactivateMutation.variables === election.id}>
                        {deactivateMutation.isPending && deactivateMutation.variables === election.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <PowerOff className="h-4 w-4 text-orange-500" />}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" title="Activate" onClick={() => activateMutation.mutate(election.id)} disabled={activateMutation.isPending && activateMutation.variables === election.id}>
                        {activateMutation.isPending && activateMutation.variables === election.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Power className="h-4 w-4 text-green-500" />}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete" disabled={deleteMutation.isPending && deleteMutation.variables === election.id}>
                           {deleteMutation.isPending && deleteMutation.variables === election.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the election "{election.title}" and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(election.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No elections found {filter !== 'all' ? `for "${filter}" filter` : ''}.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

