import { requestInterceptor } from "./requestInterceptor";
import { responseInterceptor } from "./responseInterceptor";

export const attachInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(requestInterceptor);
  responseInterceptor(axiosInstance);
};