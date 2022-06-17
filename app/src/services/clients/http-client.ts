import axios from "axios";
import { ApiClientDetails } from "../controllers/rest-controller";

export const axiosHttpClient = (details: ApiClientDetails) => {
  axios.defaults.headers.common["Authorization"] = `token ${details.githubApiPat}`;
  axios.defaults.baseURL = details.githubRestApiTarget;
  return axios;
};
