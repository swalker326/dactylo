import * as dotenv from "dotenv";
import { Server } from "./Server";

dotenv.config({ path: "../../.env.local" });
const server = new Server({ port: 5000 });
server.loadRoutes("./routes/").then(() => {
	server.start();
});
