import chalk from "chalk";
import { textSync } from "figlet";
import server from "./app/server";
import { setup } from "./environment/environment";

const environment = setup();
const port = environment.port;

server.listen(port, () => {
  const banner = textSync(["Started", "server"].join(" ".repeat(3)), {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80
  });
  console.log(banner);
  console.log("-".repeat(banner.length / 6));
  console.log();
  console.log(`${chalk.gray(`[${new Date().toUTCString()}]`)} Listening on port ${port}`);
});
