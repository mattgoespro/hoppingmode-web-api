import express from "express";
import morgan from "morgan";
import cors from "cors";

morgan.token("status-name", (_req, res) => {
  switch (res.statusCode) {
    case 200:
      return "OK";
    case 304:
      return "Not Modified";
    case 401:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    case 503:
      return "Service Unavailable";
  }
});

export default express().use(
  morgan("[:date[web]] - [:method] :url (:status :status-name) [:response-time ms]"),
  cors({
    origin: "http://localhost",
  })
);
