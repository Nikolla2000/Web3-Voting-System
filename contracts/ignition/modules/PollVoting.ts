import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import 'dotenv/config';

/**
 * Deploys the canonical Semaphore verifier + registry, then this project's
 * thin PollVoting wrapper around it (see contracts/PollVoting.sol).
 *
 * relayerAddress must match apps/blockchain/.env's RELAYER_PRIVATE_KEY —
 * that's the only account PollVoting.sol will accept createPoll/addMember
 * calls from. Defaults to .env's RELAYER_ADDRESS directly (an Ignition
 * parameter alone won't pick it up — that needs an explicit --parameters
 * file, which nothing here passes), falling back to the burn address only
 * for local/dry-run deploys where no real relayer exists yet.
 */
export default buildModule('PollVotingModule', (m) => {
  const relayerAddress = m.getParameter(
    'relayerAddress',
    process.env.RELAYER_ADDRESS ?? '0x000000000000000000000000000000000000dEaD',
  );

  const poseidonT3 = m.library('PoseidonT3');
  const semaphoreVerifier = m.contract('SemaphoreVerifier');
  const semaphore = m.contract('Semaphore', [semaphoreVerifier], {
    libraries: { PoseidonT3: poseidonT3 },
  });
  const pollVoting = m.contract('PollVoting', [semaphore, relayerAddress]);

  return { semaphoreVerifier, semaphore, pollVoting };
});
