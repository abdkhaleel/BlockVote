
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MailCheck, MailWarning, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setMessage("No verification token provided.");
      setVerificationStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient<ApiResponse>(`/users/verify?token=${token}`, { // Using GET for /users/verify
          method: "GET", // Spring controller uses GET for /verify
        });
        if (response && response.message) { // Assuming successful verification returns a simple message
          setMessage(response.message || "User verified successfully!");
          setVerificationStatus("success");
        } else {
          // This path might not be hit if apiClient throws for non-ok responses
          setMessage("Verification failed. The token might be invalid or expired.");
          setVerificationStatus("error");
        }
      } catch (error: any) {
        setMessage(error.data?.error || error.message || "Verification failed. Please try again or contact support.");
        setVerificationStatus("error");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            {verificationStatus === "pending" && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
            {verificationStatus === "success" && <MailCheck className="h-10 w-10 text-green-500" />}
            {verificationStatus === "error" && <MailWarning className="h-10 w-10 text-destructive" />}
          </div>
          <CardTitle className="text-3xl font-headline">Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === "pending" ? "Verifying your email address..." : 
             verificationStatus === "success" ? "Verification Successful!" : "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={verificationStatus === "success" ? "text-green-600" : verificationStatus === "error" ? "text-destructive" : ""}>
            {message}
          </p>
          {verificationStatus === "success" && (
            <Link href="/login">
              <Button className="w-full">Proceed to Login</Button>
            </Link>
          )}
          {verificationStatus === "error" && (
            <Link href="/register">
              <Button variant="outline" className="w-full">Try Registering Again</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
