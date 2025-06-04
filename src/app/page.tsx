
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ListChecks, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-lg shadow-lg">
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">
          Welcome to BlockVote
        </h1>
        <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
          Experience the future of voting: secure, transparent, and decentralized.
          Cast your vote with confidence.
        </p>
        <div className="space-x-4">
          <Link href="/elections">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <ListChecks className="mr-2 h-5 w-5" /> View Active Elections
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Secure Voting</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Leveraging blockchain technology, BlockVote ensures that every vote is encrypted, immutable, and tamper-proof. Your voice is protected.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
             <div className="p-3 bg-accent/10 rounded-full w-fit mb-3">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl">Transparent Process</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              All voting records are auditable on the blockchain, providing full transparency while maintaining voter anonymity. Trust in the process.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="p-3 bg-secondary/20 rounded-full w-fit mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users-round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="4"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>
            </div>
            <CardTitle className="font-headline text-2xl">Accessible & Fair</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Designed for ease of use, BlockVote aims to make democratic participation accessible to all eligible voters, ensuring a fair election.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
      
      <section className="py-10">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-lg shadow-xl">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-4">How It Works</h2>
            <p className="text-foreground/80 mb-3">
              BlockVote simplifies the voting process into a few easy steps. Register, verify your identity, browse elections, and cast your vote securely.
            </p>
            <ul className="space-y-2 text-foreground/70">
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-accent mr-2" /> Secure registration and identity verification.</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-accent mr-2" /> Browse active elections and candidate profiles.</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-accent mr-2" /> Cast your vote anonymously and securely.</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-accent mr-2" /> View transparent results once the election concludes.</li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Blockchain voting process" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="voting blockchain" 
            />
          </div>
        </div>
      </section>

      <section className="text-center py-10">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-6">Ready to Make Your Voice Heard?</h2>
        <Link href="/register">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Register to Vote Now
          </Button>
        </Link>
      </section>
    </div>
  );
}

// Dummy page for /learn-more link for now
export function LearnMorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Learn More About BlockVote</h1>
      <p className="mt-4">This page will contain more information about the BlockVote system.</p>
    </div>
  );
}

