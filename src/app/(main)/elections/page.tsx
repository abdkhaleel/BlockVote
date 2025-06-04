
"use client";
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { Election } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, ListChecks, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const fetchElections = async (): Promise<Election[]> => {
  return apiClient<Election[]>('/elections');
};

const ElectionCard = ({ election }: { election: Election }) => {
  const startDate = election.startDate ? format(parseISO(election.startDate), 'MMMM d, yyyy HH:mm') : 'N/A';
  const endDate = election.endDate ? format(parseISO(election.endDate), 'MMMM d, yyyy HH:mm') : 'N/A';
  const electionIsPast = election.endDate ? isPast(parseISO(election.endDate)) : false;
  const status = election.active ? (electionIsPast ? "Closed" : "Active") : "Inactive";
  
  let statusColor = "text-yellow-500";
  if (status === "Active") statusColor = "text-green-500";
  if (status === "Closed") statusColor = "text-red-500";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{election.title}</CardTitle>
        <CardDescription className="h-16 overflow-hidden text-ellipsis">{election.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-sm text-muted-foreground flex items-center">
          <CalendarDays className="mr-2 h-4 w-4" /> 
          Starts: {startDate}
        </p>
        <p className="text-sm text-muted-foreground flex items-center">
          <CalendarDays className="mr-2 h-4 w-4" /> 
          Ends: {endDate}
        </p>
        <p className={`text-sm font-semibold ${statusColor}`}>Status: {status}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/elections/${election.id}`} className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default function ElectionsPage() {
  const { data: elections, isLoading, error } = useQuery<Election[], Error>({
    queryKey: ['elections'],
    queryFn: fetchElections,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading elections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-xl">Failed to load elections: {error.message}</p>
      </div>
    );
  }

  const activeElections = elections?.filter(e => e.active && (e.endDate ? !isPast(parseISO(e.endDate)) : true)) || [];
  const pastElections = elections?.filter(e => !e.active || (e.endDate ? isPast(parseISO(e.endDate)) : false)) || [];


  return (
    <div className="space-y-10">
      <section className="text-center py-8">
        <ListChecks className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">
          Available Elections
        </h1>
        <p className="text-lg text-foreground/80 max-w-xl mx-auto">
          Browse through active and past elections. Click on an election to view details, candidates, and results.
        </p>
      </section>

      {activeElections.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-semibold text-green-600 mb-6">Active Elections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </section>
      )}
      
      {activeElections.length === 0 && !isLoading && (
         <section className="text-center py-6">
            <p className="text-muted-foreground text-lg">No active elections at the moment. Please check back later.</p>
        </section>
      )}


      {pastElections.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-semibold text-red-600 mb-6">Past Elections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
