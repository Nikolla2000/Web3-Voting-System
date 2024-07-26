import axios from "axios";

const api = axios.create({
  // baseURL: 'http://localhost:5000', //local server url
  baseURL: 'https://web3-voting-system.onrender.com', //production server url
})

export default api;