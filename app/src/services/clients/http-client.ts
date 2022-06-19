import { ApiClientDetails } from "../controllers/rest-controller";
import axios from "axios";

export const axiosHttpClient = (details: ApiClientDetails) => {
  axios.defaults.headers.common["Authorization"] = `token ${details.githubApiPat}`;
  axios.defaults.baseURL = details.githubRestApiTarget;
  axios.defaults.timeout = 2000;
  return axios;
};
