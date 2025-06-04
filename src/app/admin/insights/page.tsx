
"use client";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BarChartBig, BrainCircuit, Lightbulb, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVoterInsights } from '@/ai/flows/voter-insights-flow'; // Adjusted import path
import type { VoterInsightsInput, VoterInsightsOutput } from '@/ai/flows/voter-insights-flow';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VoterInsightsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [electionId, setElectionId] = useState('');
  const [voterData, setVoterData] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login?redirect=/admin/insights');
    }
  }, [user, authLoading, router]);

  const mutation = useMutation<VoterInsightsOutput, Error, VoterInsightsInput>({
    mutationFn: generateVoterInsights,
    onSuccess: (data) => {
      toast({
        title: 'Insights Generated',
        description: 'Voter insights have been successfully generated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Generating Insights',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!electionId.trim()) {
      toast({ title: 'Missing Field', description: 'Please enter an Election ID.', variant: 'destructive' });
      return;
    }
    if (!voterData.trim()) {
      toast({ title: 'Missing Field', description: 'Please provide voter data.', variant: 'destructive' });
      return;
    }
    mutation.mutate({ electionId, voterData });
  };
  
  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Voter Insights Generator</CardTitle>
          </div>
          <CardDescription>
            Utilize AI to analyze voter data and generate valuable insights for a specific election.
            Enter the Election ID and paste the relevant voter data (e.g., CSV, JSON, or plain text summary).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="electionId" className="text-lg font-medium">Election ID</Label>
              <Input
                id="electionId"
                type="text"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                placeholder="Enter the Election ID (e.g., ELECTION_2024_PRES)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="voterData" className="text-lg font-medium">Voter Data</Label>
              <Textarea
                id="voterData"
                value={voterData}
                onChange={(e) => setVoterData(e.target.value)}
                placeholder="Paste voter data here (e.g., demographics, voting history in text or structured format)"
                rows={10}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide data such as demographics, past voting behavior, survey responses, etc. The more detailed the data, the better the insights.
              </p>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <BarChartBig className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}

      {mutation.isSuccess && mutation.data && (
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Generated Insights for Election: {electionId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-accent" />Summary</h3>
              <p className="text-foreground/90 bg-muted/50 p-3 rounded-md">{mutation.data.summary}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center"><BarChartBig className="mr-2 h-5 w-5 text-accent" />Demographic Trends</h3>
              <p className="text-foreground/90 bg-muted/50 p-3 rounded-md">{mutation.data.demographicTrends}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center"><BrainCircuit className="mr-2 h-5 w-5 text-accent" />Behavioral Patterns</h3>
              <p className="text-foreground/90 bg-muted/50 p-3 rounded-md">{mutation.data.behavioralPatterns}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent" />Recommendations</h3>
              <p className="text-foreground/90 bg-muted/50 p-3 rounded-md">{mutation.data.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

