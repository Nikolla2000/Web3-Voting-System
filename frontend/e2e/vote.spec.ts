import { expect, test } from './support/test';

// Real Groth16 proving runs in the browser here; the first run also downloads the circuit.
test.setTimeout(120_000);

test.describe('anonymous voting', () => {
  test.beforeEach(async ({ context, gateway }) => {
    await gateway.signIn(context, gateway.addUser());
  });

  test('casts a vote with a real zero-knowledge proof, and the tally updates', async ({
    page,
    gateway,
  }) => {
    const poll = gateway.addPoll({
      options: [
        ['Lisbon', 2],
        ['Prague', 1],
      ],
    });
    await page.goto(`/polls/${poll.id}`);
    await expect(page.getByText('3 votes')).toBeVisible();

    await page.getByRole('radio', { name: 'Prague' }).click();
    await page.getByRole('button', { name: 'Cast vote' }).click();

    await expect(page.getByRole('link', { name: 'View transaction' })).toBeVisible({
      timeout: 90_000,
    });
    // The mock accepted the vote only after Semaphore verified the proof, with a scope and message
    // that match the backend's own uuidToFieldElement for this poll and option.
    const [vote] = gateway.requestsTo('POST', `/polls/${poll.id}/vote`);
    expect(vote).toBeDefined();
    await expect(page.getByText('4 votes')).toBeVisible();
    expect(poll.options.map((o) => [o.label, o.votes])).toEqual([
      ['Lisbon', 2],
      ['Prague', 2],
    ]);

    // The vote went out with only the proof: nothing ties it to the account.
    expect(Object.keys(vote!.json as object).sort()).toEqual(
      ['merkleTreeDepth', 'merkleTreeRoot', 'message', 'nullifier', 'points', 'scope'].sort(),
    );
  });

  test('after voting, the poll remembers it in this browser and offers no second vote', async ({
    page,
    gateway,
  }) => {
    const poll = gateway.addPoll();
    await page.goto(`/polls/${poll.id}`);
    await page.getByRole('radio', { name: 'Lisbon' }).click();
    await page.getByRole('button', { name: 'Cast vote' }).click();
    const receipt = page.getByRole('link', { name: 'View transaction' });
    await expect(receipt).toBeVisible({ timeout: 90_000 });
    const href = await receipt.getAttribute('href');

    await page.reload();

    await expect(page.getByRole('link', { name: 'View transaction' })).toHaveAttribute(
      'href',
      href!,
    );
    await expect(page.getByRole('button', { name: 'Cast vote' })).toHaveCount(0);
  });

  test('a rejected vote shows the server’s reason and can be retried', async ({
    page,
    gateway,
  }) => {
    const poll = gateway.addPoll();
    await page.goto(`/polls/${poll.id}`);
    // Simulate the relayer being down for the first attempt only.
    let failNext = true;
    await page.route(`**/polls/${poll.id}/vote`, (route) => {
      // Let the CORS preflight through to the mock, or the browser sees a network error instead.
      if (!failNext || route.request().method() === 'OPTIONS') return route.fallback();
      failNext = false;
      return route.fulfill({
        status: 503,
        headers: {
          'access-control-allow-origin': new URL(page.url()).origin,
          'access-control-allow-credentials': 'true',
        },
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 503,
          message: 'The relayer is temporarily unavailable',
        }),
      });
    });

    await page.getByRole('radio', { name: 'Lisbon' }).click();
    await page.getByRole('button', { name: 'Cast vote' }).click();
    await expect(page.getByText('The relayer is temporarily unavailable')).toBeVisible({
      timeout: 90_000,
    });

    await page.getByRole('button', { name: 'Cast vote' }).click();
    await expect(page.getByRole('link', { name: 'View transaction' })).toBeVisible({
      timeout: 90_000,
    });
    // The retry reused the same anonymous identity: one group member, not two.
    const joins = gateway.requestsTo('POST', `/polls/${poll.id}/group/join`).map((r) => r.json);
    expect(new Set(joins.map((j) => JSON.stringify(j))).size).toBe(1);
  });
});
