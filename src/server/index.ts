import express from "express";
import config from "../config";
import { getTokenRoutes } from "./routes";

export const app = express();

app.get("/", (req, res) => {
    res.json({msg:"Server is running"});
})

app.use("/api/v1/tokens", getTokenRoutes());


export function startServer(){
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    })
}