import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "./log";
import { authenticateJWT } from "./auth";

export const restServer = (jwtSigningKey: string) => {
  return express().use(
    morgan("[:date[web]] - [:method] :url (:status :status-name) [:response-time ms]"),
    cors({
      origin: "http://localhost",
    }),
    bodyParser.json(),
    authenticateJWT(jwtSigningKey)
  );
};
