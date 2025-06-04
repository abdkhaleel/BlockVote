
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Zap, ShieldCheck, CheckCircle, UsersRound, ArrowLeft } from "lucide-react";

export default function LearnMorePage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <section className="text-center">
        <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">
          About BlockVote
        </h1>
        <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
          Discover how BlockVote is revolutionizing the electoral process through cutting-edge blockchain technology, ensuring security, transparency, and accessibility for all voters.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Image
            src="https://placehold.co/600x450.png"
            alt="Blockchain network visualization"
            width={600}
            height={450}
            className="rounded-lg shadow-xl"
            data-ai-hint="blockchain network"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-headline font-semibold text-primary">
            The Power of Blockchain in Voting
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Traditional voting systems often face challenges related to security, transparency, and efficiency. BlockVote addresses these issues by utilizing a decentralized ledger (blockchain). Each vote is recorded as a transaction in a block, cryptographically secured, and linked to previous blocks, creating an immutable and auditable trail.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            This means once a vote is cast, it cannot be altered or deleted, preventing fraud and ensuring the integrity of the election results. Voter anonymity is maintained through cryptographic techniques, while the overall process remains transparent for public verification.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-headline font-semibold text-primary text-center">
          Core Features & Benefits
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline text-xl">Unmatched Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Votes are encrypted and stored on a distributed ledger, making them highly resistant to tampering and cyberattacks.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-full w-fit mb-3">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="font-headline text-xl">Full Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The voting process and results can be audited by anyone without compromising voter privacy, fostering trust in the system.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-secondary/20 rounded-full w-fit mb-3">
                <UsersRound className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="font-headline text-xl">Enhanced Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                BlockVote aims to make voting easier and more convenient for eligible citizens, potentially increasing voter turnout.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="text-center py-10 bg-card rounded-lg shadow-xl">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-6">
          Join the Future of Democracy
        </h2>
        <p className="text-foreground/80 max-w-2xl mx-auto mb-8">
          BlockVote is committed to building a more secure, transparent, and fair democratic process. By embracing blockchain technology, we empower voters and strengthen the foundations of democracy.
        </p>
        <div className="space-x-4">
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Register to Vote
            </Button>
          </Link>
          <Link href="/elections">
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
              View Elections
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
