import * as dotenv from "dotenv";
import { Server } from "./Server";

dotenv.config({ path: ".env" });
const server = new Server({ port: 8080 });
server.loadRoutes("./routes/").then(() => {
	server.start();
});
