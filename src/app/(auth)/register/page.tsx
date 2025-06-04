
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { RegisterResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserPlus } from "lucide-react";

const registerFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(50),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);


  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setVerificationToken(null);
    try {
      const response = await apiClient<RegisterResponse>('/users/register', {
        method: 'POST',
        body: data,
      });

      if (response.message && response.verificationToken) {
        toast({
          title: "Registration Successful",
          description: response.message,
        });
        setVerificationToken(response.verificationToken); // Store token to display verification link/info
        // Optionally redirect to a page that explains email verification or directly to login.
        // For now, we'll stay on the page and show the token.
        // router.push("/login"); 
      } else {
        // If backend returns success:false or error message in a specific structure
        throw new Error(response.error || "Registration failed. Please try again.");
      }
    } catch (error: any) {
       toast({
        title: "Registration Failed",
        description: error.data?.error || error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join BlockVote and make your voice count.</CardDescription>
        </CardHeader>
        <CardContent>
          {verificationToken ? (
            <div className="space-y-4 text-center">
              <p className="text-green-600">Registration successful! Please verify your email.</p>
              <p className="text-sm text-muted-foreground">
                A verification link would typically be sent to your email. For this demo, you can use the token below:
              </p>
              <div className="p-2 bg-muted rounded text-xs break-all">{verificationToken}</div>
              <Link href={`/verify?token=${verificationToken}`}>
                <Button className="w-full">Verify Email</Button>
              </Link>
               <p className="mt-2 text-center text-sm text-muted-foreground">
                Already verified?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="chooseausername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          )}
          {!verificationToken && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login here
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
