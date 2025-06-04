
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { Election, ApiResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2, Save, ArrowLeft, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const electionFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type ElectionFormValues = z.infer<typeof electionFormSchema>;

const fetchElectionDetails = async (electionId: string, token: string | null): Promise<Election> => {
  return apiClient<Election>(`/elections/${electionId}`, { token });
};

export default function EditElectionPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: electionData, isLoading: electionLoading, error: electionError } = useQuery<Election, Error>({
    queryKey: ['electionDetails', electionId],
    queryFn: () => fetchElectionDetails(electionId, token),
    enabled: !!electionId && !!token,
  });
  
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push(`/login?redirect=/admin/elections/${electionId}/edit`);
    }
  }, [user, authLoading, router, electionId]);

  useEffect(() => {
    if (electionData) {
      form.reset({
        title: electionData.title,
        description: electionData.description,
        startDate: parseISO(electionData.startDate),
        endDate: parseISO(electionData.endDate),
      });
    }
  }, [electionData, form]);

  const updateElectionMutation = useMutation<ApiResponse, Error, { id: string; data: Omit<Election, 'id' | 'active' | 'candidates' | 'results'> }>({
    mutationFn: ({ id, data }) => apiClient<ApiResponse>(`/elections/${id}`, {
      method: 'PUT',
      body: data,
      token,
    }),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "Election updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminElections'] });
      queryClient.invalidateQueries({ queryKey: ['electionDetails', electionId] });
      router.push("/admin/elections");
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.data?.message || error.message, variant: "destructive" });
    },
  });

  async function onSubmit(data: ElectionFormValues) {
    const updatedData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };
    updateElectionMutation.mutate({ id: electionId, data: updatedData });
  }

  if (authLoading || electionLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || user.role !== 'ADMIN') return null;

  if (electionError) {
     return <div className="text-destructive text-center py-10">Error loading election details: {electionError.message}</div>;
  }
   if (!electionData && !electionLoading) {
    return <div className="text-center py-10">Election not found or you do not have permission to edit it.</div>;
  }


  return (
    <div className="space-y-8">
       <Link href="/admin/elections" className="inline-flex items-center text-primary hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Elections
      </Link>
      <Card className="shadow-xl">
        <CardHeader>
           <div className="flex items-center gap-3 mb-2">
            <Edit className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Edit Election</CardTitle>
          </div>
          <CardDescription>Modify the details for election: <span className="font-semibold">{electionData?.title}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                if (date) {
                                    const currentTime = field.value || new Date();
                                    date.setHours(currentTime.getHours());
                                    date.setMinutes(currentTime.getMinutes());
                                    field.onChange(date);
                                }
                            }}
                            initialFocus
                          />
                          <div className="p-2 border-t border-border">
                            <Input type="time" 
                                   defaultValue={field.value ? format(field.value, "HH:mm") : "00:00"}
                                   onChange={(e) => {
                                     if(field.value) {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours,10));
                                        newDate.setMinutes(parseInt(minutes,10));
                                        field.onChange(newDate);
                                     }
                                   }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                             onSelect={(date) => {
                                if (date) {
                                    const currentTime = field.value || new Date();
                                    date.setHours(currentTime.getHours());
                                    date.setMinutes(currentTime.getMinutes());
                                    field.onChange(date);
                                }
                            }}
                            initialFocus
                          />
                          <div className="p-2 border-t border-border">
                            <Input type="time" 
                                   defaultValue={field.value ? format(field.value, "HH:mm") : "00:00"}
                                   onChange={(e) => {
                                     if(field.value) {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours,10));
                                        newDate.setMinutes(parseInt(minutes,10));
                                        field.onChange(newDate);
                                     }
                                   }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={updateElectionMutation.isPending}>
                {updateElectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    