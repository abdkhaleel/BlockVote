
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Election } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, UserPlus, UserMinus, UsersRound, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const fetchElectionDetails = async (electionId: string, token: string | null): Promise<Election> => {
  return apiClient<Election>(`/elections/${electionId}`, { token });
};

export default function ManageVotersPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [targetUserId, setTargetUserId] = useState("");

  const { data: election, isLoading: electionLoading } = useQuery<Election, Error>({
    queryKey: ['electionDetailsForVoters', electionId],
    queryFn: () => fetchElectionDetails(electionId, token),
    enabled: !!electionId && !!token,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push(`/login?redirect=/admin/elections/${electionId}/voters`);
    }
  }, [user, authLoading, router, electionId]);

  const voterMutation = useMutation<ApiResponse, Error, { userId: string; action: 'add' | 'remove' }>({
    mutationFn: ({ userId, action }) => {
      const endpoint = `/elections/${electionId}/voters/${userId}`;
      const method = action === 'add' ? 'POST' : 'DELETE';
      return apiClient<ApiResponse>(endpoint, { method, token });
    },
    onSuccess: (data, variables) => {
      toast({ title: "Success", description: data.message || `Voter ${variables.action === 'add' ? 'added' : 'removed'} successfully.` });
      // Potentially invalidate a query for eligible voters if one existed
      setTargetUserId(""); // Clear input
    },
    onError: (error: any, variables) => {
      toast({ title: `Failed to ${variables.action} Voter`, description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  const handleAddVoter = () => {
    if (!targetUserId.trim()) {
      toast({ title: "User ID Required", description: "Please enter a User ID.", variant: "destructive" });
      return;
    }
    voterMutation.mutate({ userId: targetUserId.trim(), action: 'add' });
  };

  const handleRemoveVoter = () => {
    if (!targetUserId.trim()) {
      toast({ title: "User ID Required", description: "Please enter a User ID.", variant: "destructive" });
      return;
    }
    voterMutation.mutate({ userId: targetUserId.trim(), action: 'remove' });
  };

  if (authLoading || electionLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
        <Link href={`/admin/elections`} className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Elections
        </Link>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UsersRound className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Manage Eligible Voters</CardTitle>
          </div>
          <CardDescription>For Election: <span className="font-semibold">{election?.title || 'Loading...'}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="default" className="border-primary/50">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold">Voter Management Note</AlertTitle>
                <AlertDescription>
                    Currently, voters are managed by their User ID. There is no endpoint to list all eligible voters for this election.
                    Please ensure you have the correct User ID before adding or removing.
                </AlertDescription>
            </Alert>
          <div>
            <label htmlFor="targetUserId" className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
            <Input
              id="targetUserId"
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Enter User ID to add or remove"
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAddVoter} disabled={voterMutation.isPending && voterMutation.variables?.action === 'add'} className="bg-green-600 hover:bg-green-700 text-white">
              {voterMutation.isPending && voterMutation.variables?.action === 'add' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Add Voter
            </Button>
            <Button onClick={handleRemoveVoter} disabled={voterMutation.isPending && voterMutation.variables?.action === 'remove'} variant="destructive">
              {voterMutation.isPending && voterMutation.variables?.action === 'remove' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
              Remove Voter
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Adding a voter makes them eligible to vote in this specific election. Removing them revokes this eligibility.
            </p>
        </CardFooter>
      </Card>
      
      {/* Future: Display list of eligible voters if an API endpoint becomes available */}
      {/* 
      <Card>
        <CardHeader><CardTitle>Current Eligible Voters</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feature to list voters not yet implemented or API not available.</p>
        </CardContent>
      </Card> 
      */}
    </div>
  );
}

    