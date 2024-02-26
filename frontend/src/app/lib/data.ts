import { votingPolls } from './placeholder-data'

export async function fetchPollsData() {
  try {
    const data = votingPolls;
    return data;
  } catch (error) {
    console.error('Error: ', error);
  }
}