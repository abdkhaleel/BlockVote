
"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { Election, Candidate, EligibilityStatus, VoteDTO, ApiResponse, ElectionResults } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CalendarDays, Info, UserCheck, UserX, Vote, BarChart3, CheckCircle, XCircle, Link } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import Image from 'next/image';

const fetchElectionDetails = async (electionId: string): Promise<Election> => {
  return apiClient<Election>(`/elections/${electionId}`);
};

const fetchCandidates = async (electionId: string): Promise<Candidate[]> => {
  return apiClient<Candidate[]>(`/elections/${electionId}/candidates`);
};

const fetchEligibilityStatus = async (electionId: string, token: string | null): Promise<EligibilityStatus> => {
  if (!token) throw new Error("User not authenticated");
  return apiClient<EligibilityStatus>(`/elections/${electionId}/eligibility`, { token });
};

const fetchElectionResults = async (electionId: string): Promise<ElectionResults> => {
  return apiClient<ElectionResults>(`/elections/${electionId}/results`);
};

export default function ElectionDetailPage() {
  const params = useParams();
  const electionId = params.electionId as string;
  const { user, token, isLoading: authLoading } = useAuth();
  const { toast }: { toast: (options: { title: string; description?: string; variant?: string }) => void } = useToast();
  const queryClient = useQueryClient();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const { data: election, isLoading: electionLoading, error: electionError } = useQuery<Election, Error>({
    queryKey: ['election', electionId],
    queryFn: () => fetchElectionDetails(electionId),
    enabled: !!electionId,
  });

  const { data: candidates, isLoading: candidatesLoading, error: candidatesError } = useQuery<Candidate[], Error>({
    queryKey: ['candidates', electionId],
    queryFn: () => fetchCandidates(electionId),
    enabled: !!electionId,
  });

  const { data: eligibility, isLoading: eligibilityLoading, error: eligibilityError, refetch: refetchEligibility } = useQuery<EligibilityStatus, Error>({
    queryKey: ['eligibility', electionId, user?.id],
    queryFn: () => fetchEligibilityStatus(electionId, token),
    enabled: !!electionId && !!user && !!token,
  });

  const electionIsPast = election?.endDate ? isPast(parseISO(election.endDate)) : false;

  const { data: results, isLoading: resultsLoading, error: resultsError } = useQuery<ElectionResults, Error>({
    queryKey: ['results', electionId],
    queryFn: () => fetchElectionResults(electionId),
    enabled: !!electionId && electionIsPast && !!election, // Only fetch results if election is past
  });
  
  const voteMutation = useMutation<ApiResponse, Error, VoteDTO>({
    mutationFn: (voteData) => apiClient<ApiResponse>('/votes', { method: 'POST', body: voteData, token }),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['eligibility', electionId, user?.id] });
      refetchEligibility(); // Refetch eligibility to update "hasVoted" status
      setSelectedCandidateId(null); // Reset selection
    },
    onError: (error: any) => {
      toast({ title: "Vote Failed", description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  const handleVote = () => {
    if (!selectedCandidateId) {
      toast({ title: "No Candidate Selected", description: "Please select a candidate to vote.", variant: "destructive" });
      return;
    }
    if (user && election) {
      voteMutation.mutate({ electionId: election.id, candidateId: selectedCandidateId });
    }
  };

  if (electionLoading || candidatesLoading || authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Loading election details...</p></div>;
  }

  if (electionError || candidatesError) {
    return <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-destructive"><AlertTriangle className="h-12 w-12 mb-4" /><p className="text-xl">Failed to load election data: {electionError?.message || candidatesError?.message}</p></div>;
  }

  if (!election) {
    return <div className="text-center py-10"><p>Election not found.</p></div>;
  }
  
  const canVote = election.active && !electionIsPast && user && eligibility?.eligible && !eligibility?.hasVoted;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary">{election.title}</CardTitle>
          <CardDescription className="text-lg">{election.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center text-muted-foreground"><CalendarDays className="mr-2 h-5 w-5" /> Starts: {format(parseISO(election.startDate), 'PPPp')}</p>
          <p className="flex items-center text-muted-foreground"><CalendarDays className="mr-2 h-5 w-5" /> Ends: {format(parseISO(election.endDate), 'PPPp')}</p>
          <p className={`font-semibold ${election.active && !electionIsPast ? 'text-green-600' : 'text-red-600'}`}>
            Status: {election.active ? (electionIsPast ? "Closed" : "Active") : "Inactive"}
          </p>
        </CardContent>
      </Card>

      {user && !authLoading && !eligibilityLoading && (
        <Alert variant={eligibility?.eligible && !eligibility?.hasVoted ? "default" : "destructive"} className="border-2">
           {eligibility?.eligible && !eligibility?.hasVoted && <UserCheck className="h-5 w-5" />}
           {(!eligibility?.eligible || eligibility?.hasVoted) && <UserX className="h-5 w-5" />}
          <AlertTitle className="font-semibold">
            {eligibilityError ? "Eligibility Check Error" : 
             eligibility?.eligible ? (eligibility.hasVoted ? "You Have Already Voted" : "You Are Eligible to Vote") : "You Are Not Eligible to Vote"}
          </AlertTitle>
          <AlertDescription>
            {eligibilityError ? `Could not determine your voting eligibility: ${eligibilityError.message}` : 
             eligibility?.eligible ? (eligibility.hasVoted ? "Your vote has been recorded for this election." : "Please select a candidate below to cast your vote.") : "You may not be on the voter roll for this election, or there might be other restrictions."}
          </AlertDescription>
        </Alert>
      )}
      {!user && !authLoading && (
         <Alert variant="default" className="border-accent border-2">
          <Info className="h-5 w-5 text-accent"/>
          <AlertTitle className="font-semibold text-accent">Login to Participate</AlertTitle>
          <AlertDescription>
            Please <Link href="/login" className="underline hover:text-accent/80">login</Link> or <Link href="/register" className="underline hover:text-accent/80">register</Link> to check your eligibility and vote.
          </AlertDescription>
        </Alert>
      )}

      {!electionIsPast && election.active && (
        <section>
          <h2 className="text-3xl font-headline font-semibold text-primary mb-6">Candidates</h2>
          {candidates && candidates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className={`shadow-lg transition-all duration-200 ease-in-out ${selectedCandidateId === candidate.id ? 'ring-2 ring-primary scale-105' : 'hover:shadow-xl'} ${!canVote ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => canVote && setSelectedCandidateId(candidate.id)}
                >
                  <CardHeader>
                    <Image 
                      src={candidate.imageUrl || `https://placehold.co/300x200.png?text=${candidate.name.replace(/\s+/g, '+')}`}
                      alt={candidate.name}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded-t-md mb-2"
                      data-ai-hint="politician person"
                    />
                    <CardTitle className="font-headline text-xl">{candidate.name}</CardTitle>
                    <CardDescription>{candidate.party} - {candidate.position}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{candidate.biography || "No biography available."}</p>
                  </CardContent>
                  {canVote && selectedCandidateId === candidate.id && (
                    <CardFooter>
                       <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                       <p className="text-sm font-semibold text-green-600">Selected</p>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p>No candidates found for this election.</p>
          )}
          {canVote && candidates && candidates.length > 0 && (
            <div className="mt-8 text-center">
              <Button 
                size="lg" 
                onClick={handleVote} 
                disabled={!selectedCandidateId || voteMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {voteMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Vote className="mr-2 h-5 w-5" />}
                {voteMutation.isPending ? "Casting Vote..." : "Cast Your Vote"}
              </Button>
            </div>
          )}
           {!canVote && election.active && !electionIsPast && user && eligibility && !eligibility.hasVoted && (
             <Alert variant="default" className="mt-6 border-yellow-500 text-yellow-700 bg-yellow-50">
                <Info className="h-5 w-5"/>
                <AlertTitle>Voting Not Possible</AlertTitle>
                <AlertDescription>
                    You cannot vote at this time. This might be because you are not eligible, have already voted, or the election is not currently active for voting.
                </AlertDescription>
            </Alert>
           )}
        </section>
      )}

      {electionIsPast && (
        <section>
          <h2 className="text-3xl font-headline font-semibold text-primary mb-6 flex items-center"><BarChart3 className="mr-3 h-8 w-8"/>Election Results</h2>
          {resultsLoading && <div className="flex items-center"><Loader2 className="h-6 w-6 animate-spin mr-2" />Loading results...</div>}
          {resultsError && <Alert variant="destructive"><AlertTriangle className="h-5 w-5"/><AlertTitle>Error</AlertTitle><AlertDescription>{resultsError.message}</AlertDescription></Alert>}
          {results && candidates && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Final Vote Counts</CardTitle>
                <CardDescription>Total Votes Cast: {results.totalVotes}</CardDescription>
                {results.winner && <p className="text-lg font-semibold text-green-600">Winner: {candidates.find(c => c.id === results.winner)?.name || results.winner}</p>}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {candidates
                    .sort((a,b) => (results.results[b.id] || 0) - (results.results[a.id] || 0) )
                    .map((candidate) => (
                    <li key={candidate.id} className="p-3 bg-muted/50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{candidate.name} ({candidate.party})</span>
                        <span className="font-bold text-primary">{results.results[candidate.id] || 0} votes</span>
                      </div>
                       <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                        <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${results.totalVotes > 0 ? ((results.results[candidate.id] || 0) / results.totalVotes) * 100 : 0}%` }}
                        ></div>
                        </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
