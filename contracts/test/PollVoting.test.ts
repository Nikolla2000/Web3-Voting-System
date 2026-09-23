import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';

describe('PollVoting', async function () {
  const { viem } = await network.getOrCreate();

  it('lets the owner create a poll and add a member; blocks non-owners', async () => {
    const [owner, other] = await viem.getWalletClients();

    const poseidonT3 = await viem.deployContract('PoseidonT3');
    const semaphoreVerifier = await viem.deployContract('SemaphoreVerifier');
    const semaphore = await viem.deployContract('Semaphore', [semaphoreVerifier.address], {
      libraries: { PoseidonT3: poseidonT3.address },
    });
    const pollVoting = await viem.deployContract('PollVoting', [semaphore.address, owner.account.address]);

    const pollId = 1n;
    await pollVoting.write.createPoll([pollId]);
    assert.equal(await pollVoting.read.pollExists([pollId]), true);

    await assert.rejects(pollVoting.write.createPoll([2n], { account: other.account }));

    const identityCommitment = 123456789n;
    await pollVoting.write.addMember([pollId, identityCommitment]);

    const groupId = await pollVoting.read.pollGroupId([pollId]);
    assert.equal(await semaphore.read.getMerkleTreeSize([groupId]), 1n);
  });
});
