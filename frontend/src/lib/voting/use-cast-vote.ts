import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerkleProof, joinGroup, submitVote } from '@/lib/api/voting';
import { getOrCreateVotingIdentity } from '@/lib/voting/identity';
import { generateVoteProof } from '@/lib/voting/generate-vote-proof';
import { markVoted } from '@/lib/voting/voted-storage';

export type CastVoteStep = 'joining' | 'proving' | 'submitting';

const STEP_LABELS: Record<CastVoteStep, string> = {
  joining: 'Registering your anonymous identity…',
  proving: 'Generating zero-knowledge proof…',
  submitting: 'Submitting your vote on-chain…',
};

export function useCastVote(pollId: string) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CastVoteStep | null>(null);

  const mutation = useMutation({
    mutationFn: async (optionId: string) => {
      const identity = getOrCreateVotingIdentity(pollId);
      const identityCommitment = identity.commitment.toString();

      setStep('joining');
      await joinGroup(pollId, identityCommitment);
      const merkleProof = await getMerkleProof(pollId, identityCommitment);

      setStep('proving');
      const proof = await generateVoteProof(identity, merkleProof, pollId, optionId);

      setStep('submitting');
      const { transactionHash } = await submitVote(pollId, proof);

      markVoted(pollId, transactionHash);
      return transactionHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    },
    onSettled: () => setStep(null),
  });

  return {
    castVote: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    transactionHash: mutation.data,
    reset: mutation.reset,
    step,
    stepLabel: step ? STEP_LABELS[step] : null,
  };
}
