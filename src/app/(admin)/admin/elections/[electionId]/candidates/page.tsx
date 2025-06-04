
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { Candidate, CandidateDTO, ApiResponse, Election } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, PlusCircle, Trash2, Users, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
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
import Image from 'next/image';


const candidateFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  party: z.string().min(2, "Party must be at least 2 characters.").max(50).optional().or(z.literal('')),
  position: z.string().min(2, "Position must be at least 2 characters.").max(50).optional().or(z.literal('')),
  biography: z.string().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

const fetchElectionDetails = async (electionId: string, token: string | null): Promise<Election> => {
  return apiClient<Election>(`/elections/${electionId}`, { token });
};

const fetchCandidates = async (electionId: string, token: string | null): Promise<Candidate[]> => {
  return apiClient<Candidate[]>(`/elections/${electionId}/candidates`, { token });
};

export default function ManageCandidatesPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: election, isLoading: electionLoading } = useQuery<Election, Error>({
    queryKey: ['electionDetailsForCandidates', electionId],
    queryFn: () => fetchElectionDetails(electionId, token),
    enabled: !!electionId && !!token,
  });

  const { data: candidates, isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery<Candidate[], Error>({
    queryKey: ['electionCandidates', electionId],
    queryFn: () => fetchCandidates(electionId, token),
    enabled: !!electionId && !!token,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push(`/login?redirect=/admin/elections/${electionId}/candidates`);
    }
  }, [user, authLoading, router, electionId]);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: { name: "", party: "", position: "", biography: "", imageUrl: "" },
  });

  const addCandidateMutation = useMutation<ApiResponse, Error, CandidateDTO>({
    mutationFn: (newCandidate) => apiClient<ApiResponse>(`/elections/${electionId}/candidates`, {
      method: 'POST',
      body: newCandidate,
      token,
    }),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "Candidate added successfully." });
      refetchCandidates();
      form.reset();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to Add Candidate", description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  const deleteCandidateMutation = useMutation<ApiResponse, Error, string>({
    mutationFn: (candidateId) => apiClient<ApiResponse>(`/elections/${electionId}/candidates/${candidateId}`, {
      method: 'DELETE',
      token,
    }),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "Candidate deleted successfully." });
      refetchCandidates();
    },
    onError: (error: any) => {
      toast({ title: "Failed to Delete Candidate", description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  async function onSubmit(data: CandidateFormValues) {
    addCandidateMutation.mutate(data);
  }

  if (authLoading || electionLoading || candidatesLoading) {
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
            <Users className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Manage Candidates</CardTitle>
          </div>
          <CardDescription>For Election: <span className="font-semibold">{election?.title || 'Loading...'}</span></CardDescription>
        </CardHeader>
        <CardFooter>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-5 w-5" /> {showAddForm ? "Cancel" : "Add New Candidate"}
            </Button>
        </CardFooter>
      </Card>

      {showAddForm && (
        <Card>
            <CardHeader><CardTitle>Add New Candidate</CardTitle></CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Candidate Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="party" render={({ field }) => (
                        <FormItem><FormLabel>Party (Optional)</FormLabel><FormControl><Input placeholder="Candidate Party" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="position" render={({ field }) => (
                        <FormItem><FormLabel>Position (Optional)</FormLabel><FormControl><Input placeholder="e.g., President, Senator" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="biography" render={({ field }) => (
                    <FormItem><FormLabel>Biography (Optional)</FormLabel><FormControl><Textarea placeholder="Short biography..." {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={addCandidateMutation.isPending}>
                    {addCandidateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Add Candidate
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Current Candidates</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates && candidates.length > 0 ? candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Image 
                        src={candidate.imageUrl || `https://placehold.co/50x50.png?text=${candidate.name.charAt(0)}`} 
                        alt={candidate.name} 
                        width={40} 
                        height={40} 
                        className="rounded-sm object-cover"
                        data-ai-hint="person placeholder"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.party || 'N/A'}</TableCell>
                  <TableCell>{candidate.position || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete Candidate" disabled={deleteCandidateMutation.isPending && deleteCandidateMutation.variables === candidate.id}>
                           {deleteCandidateMutation.isPending && deleteCandidateMutation.variables === candidate.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the candidate "{candidate.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCandidateMutation.mutate(candidate.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No candidates added yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    