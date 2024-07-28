import { textSync } from "figlet";
import server from "./app/server";
import { setup } from "./environment";

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
  console.log(`\n[${new Date().toUTCString()}] Listening on port ${port}`);
});
