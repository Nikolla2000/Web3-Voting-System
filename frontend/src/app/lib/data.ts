import { unstable_noStore as noStore } from 'next/cache';
import { votingPolls } from './placeholder-data'
import axios from 'axios';
import { Inputs } from '../ui/login/register-form';
import { toast } from "react-hot-toast"

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

export async function fetchRegister(data: Inputs) {
  if(data.confirmPass != data.password) {
    console.log(data);
    toast.error("Passwords do not match");
    return;
  }
  // axios.post('http://localhost:5000/user/regiseter', data);
}