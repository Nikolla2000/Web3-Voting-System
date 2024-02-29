import { unstable_noStore as noStore } from 'next/cache';
import { votingPolls } from './placeholder-data'

export async function fetchPollsData() {
  try {
    const data = votingPolls;
    return data;
  } catch (error) {
    console.error('Error: ', error);
  }
}

export async function fetchPollById(id: number) {
  noStore()
  try {
    const poll = votingPolls.find(poll => poll.id === id)
    return poll;
  } catch (error) {
    console.error('Error: ', error);
  }
}