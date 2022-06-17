import express from "express";
import morgan from "morgan";
import cors from "cors";

export default express().use(
  morgan("[:date[web]] - [:method] :url [:status]"),
  cors({
    origin: "http://localhost:4000",
  })
);
