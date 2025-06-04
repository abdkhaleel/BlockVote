
"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { BlockchainStatus, ApiResponse } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, XCircle, DatabaseZap, Hammer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const fetchBlockchainStatus = async (electionId: string, token: string | null): Promise<BlockchainStatus> => {
  // Note: The API GET /api/elections/{electionId}/blockchain-status requires an electionId.
  // For a general blockchain status, this might need to be adjusted or a general status endpoint used.
  // Assuming for now we need a "default" or a specific election ID for status check.
  // If no electionId is relevant for general status, the backend API needs to change.
  // For this example, let's assume we are checking status related to a 'primary_election' or similar.
  // This is a placeholder and needs clarification based on backend logic for a "general" blockchain status.
  if (!electionId) { // This is a hack, an election ID is needed.
     // throw new Error("Election ID is required to check blockchain status for a specific election context.");
     // For now, let's mock a scenario where an election ID is not strictly needed for a general mining operation
     // or a default chain status. This is not ideal.
     // A better approach would be if the backend has /api/blockchain/status and /api/blockchain/mine
     // that are not tied to a specific election.
     // Given the endpoint structure, it's probable that mining and status are per-election-chain.
     // For now, let's allow it to proceed and the user will have to provide an Election ID.
  }
  
  // The API endpoint /api/elections/{electionId}/blockchain-status requires an electionId.
  // This page is generic "Blockchain Management", so it might not always have an electionId context.
  // We'll make electionId an input for status, and mining is general.
  // The backend /api/elections/mine-blockchain is not election specific.
  return apiClient<BlockchainStatus>(`/elections/${electionId}/blockchain-status`, { token });
};

const mineBlockchain = async (token: string | null): Promise<ApiResponse> => {
  return apiClient<ApiResponse>('/elections/mine-blockchain', { method: 'POST', token });
};


export default function BlockchainAdminPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusElectionId, setStatusElectionId] = useState<string>(""); // Election ID for status check

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login?redirect=/admin/blockchain');
    }
  }, [user, authLoading, router]);

  const { data: blockchainStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useQuery<BlockchainStatus, Error>({
    queryKey: ['blockchainStatus', statusElectionId],
    queryFn: () => fetchBlockchainStatus(statusElectionId, token),
    enabled: !!statusElectionId && !!token, // Only fetch if electionId is provided
  });

  const mineMutation = useMutation<ApiResponse, Error, void>({
    mutationFn: () => mineBlockchain(token),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "Blockchain mined successfully." });
      if (statusElectionId) refetchStatus(); // Refetch status if an election context is active
    },
    onError: (error: any) => {
      toast({ title: "Mining Failed", description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  const handleCheckStatus = () => {
    if (!statusElectionId.trim()) {
        toast({ title: "Input Required", description: "Please enter an Election ID to check its blockchain status.", variant: "destructive" });
        return;
    }
    refetchStatus();
  }

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
           <div className="flex items-center gap-3 mb-2">
            <DatabaseZap className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Blockchain Management</CardTitle>
          </div>
          <CardDescription>
            Monitor the status of the election blockchain and perform administrative actions like mining new blocks.
            Note: Blockchain status is typically checked per election.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Check Blockchain Status (Per Election)</CardTitle>
          <CardDescription>Enter an Election ID to view its specific blockchain status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
                <div className="flex-grow">
                    <label htmlFor="statusElectionId" className="block text-sm font-medium text-muted-foreground mb-1">Election ID for Status Check</label>
                    <input 
                        id="statusElectionId"
                        type="text"
                        value={statusElectionId}
                        onChange={(e) => setStatusElectionId(e.target.value)}
                        placeholder="e.g., election_xyz_2024"
                        className="block w-full rounded-md border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>
                <Button onClick={handleCheckStatus} disabled={statusLoading || !statusElectionId.trim()}>
                    {statusLoading && statusElectionId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Check Status
                </Button>
            </div>

          {statusLoading && statusElectionId && <div className="flex items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Fetching status...</div>}
          {statusError && statusElectionId && <Alert variant="destructive"><AlertTriangle className="h-5 w-5"/><AlertTitle>Error</AlertTitle><AlertDescription>{statusError.message}</AlertDescription></Alert>}
          
          {blockchainStatus && statusElectionId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Chain Validity</CardDescription>
                  <CardTitle className={`text-2xl flex items-center ${blockchainStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {blockchainStatus.valid ? <CheckCircle className="mr-2"/> : <XCircle className="mr-2"/>}
                    {blockchainStatus.valid ? 'Valid' : 'Invalid'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Pending Transactions</CardDescription>
                  <CardTitle className="text-2xl">{blockchainStatus.pendingTransactions}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardDescription>Block Count</CardDescription>
                  <CardTitle className="text-2xl">{blockchainStatus.blockCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
          {!statusElectionId && <p className="text-sm text-muted-foreground pt-2">Enter an Election ID above and click "Check Status".</p>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Mine Pending Transactions</CardTitle>
          <CardDescription>Process all pending transactions by mining a new block. This action applies globally to the blockchain if not election-specific.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => mineMutation.mutate()} 
            disabled={mineMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {mineMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hammer className="mr-2 h-4 w-4" />}
            {mineMutation.isPending ? 'Mining...' : 'Mine Blockchain'}
          </Button>
          {mineMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Mining Error</AlertTitle>
              <AlertDescription>{mineMutation.error.message}</AlertDescription>
            </Alert>
          )}
           {mineMutation.isSuccess && (
            <Alert variant="default" className="mt-4 border-green-500 text-green-700 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Mining Successful</AlertTitle>
              <AlertDescription>{mineMutation.data.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

