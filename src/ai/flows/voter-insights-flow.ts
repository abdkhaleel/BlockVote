// Voter Insights Flow
'use server';
/**
 * @fileOverview An AI agent that generates insights on voter demographics and trends based on the voting data.
 *
 * - generateVoterInsights - A function that generates insights on voter demographics and trends.
 * - VoterInsightsInput - The input type for the generateVoterInsights function.
 * - VoterInsightsOutput - The return type for the generateVoterInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoterInsightsInputSchema = z.object({
  electionId: z.string().describe('The ID of the election to analyze.'),
  voterData: z.string().describe('Voting data for the election.  This could include demographics, voting history, etc.'),
});
export type VoterInsightsInput = z.infer<typeof VoterInsightsInputSchema>;

const VoterInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the voter insights.'),
  demographicTrends: z.string().describe('Key demographic trends observed in the voting data.'),
  behavioralPatterns: z.string().describe('Voting behavior patterns and potential explanations.'),
  recommendations: z.string().describe('Recommendations for improving election strategies based on the insights.'),
});
export type VoterInsightsOutput = z.infer<typeof VoterInsightsOutputSchema>;

export async function generateVoterInsights(input: VoterInsightsInput): Promise<VoterInsightsOutput> {
  return voterInsightsFlow(input);
}

const voterInsightsPrompt = ai.definePrompt({
  name: 'voterInsightsPrompt',
  input: {schema: VoterInsightsInputSchema},
  output: {schema: VoterInsightsOutputSchema},
  prompt: `You are an AI-powered analysis tool designed to generate insights on voter demographics and trends based on the provided voting data.

  Analyze the following data for election ID: {{{electionId}}}.

  Voter Data: {{{voterData}}}

  Provide a detailed summary, highlight key demographic trends, describe voting behavior patterns, and offer recommendations for improving election strategies.  Structure the output according to the provided schema.`,  
});

const voterInsightsFlow = ai.defineFlow(
  {
    name: 'voterInsightsFlow',
    inputSchema: VoterInsightsInputSchema,
    outputSchema: VoterInsightsOutputSchema,
  },
  async input => {
    const {output} = await voterInsightsPrompt(input);
    return output!;
  }
);
