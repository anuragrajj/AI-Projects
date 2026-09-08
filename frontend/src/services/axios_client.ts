import axios from "axios";

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = "your_token_here"; // get from storage/context

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request sent:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data, // auto extract data
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error("API Error:", error.response.data);

      if (error.response.status === 401) {
        console.log("Unauthorized - redirect to login");
      }
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
