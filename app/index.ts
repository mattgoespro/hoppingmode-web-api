import "./environment";
import generateBanner from "figlet";
import server from "./src/server";

server.listen(3000, () =>
  console.log(
    generateBanner.textSync("Server    started   ...", {
      font: "Standard",
      whitespaceBreak: true,
    })
  )
);
