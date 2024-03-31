import { unstable_noStore as noStore } from 'next/cache';
import { votingPolls } from './placeholder-data'
import axios, { AxiosError } from 'axios';
import { Inputs } from "../ui/login/register-form"
import { toast } from "react-hot-toast"

export async function fetchPollsData() {
  try {
    const response = await axios.get("http://localhost:5000/polls");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
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

export async function fetchRegisterUser(data: Inputs) {
  if(data.confirmPass !== data.password) {
    return;
  }

  const { confirmPass, ...registerData } = data;

  try {
    const response = await axios.post("http://localhost:5000/auth/register", registerData);
    console.log(data, response);
    toast.success("Account created successfully!");

    setTimeout(() => {
      window.location.href = ('/api/auth/signin');
    }, 800)

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 409) {
        toast.error("User with this email already exists");
      } else {
        // Handle other error cases
        console.error("An error occurred:", axiosError.message);
        toast.error("An error occurred. Please try again later.");
      }
}
  }}