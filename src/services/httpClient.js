import axios from "axios";
import { attachInterceptors } from "./interceptors";

const httpClient = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
});

attachInterceptors(httpClient);

export default httpClient;