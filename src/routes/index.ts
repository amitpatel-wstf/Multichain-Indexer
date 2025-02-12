import express from "express";
import config from "../config";

export const app = express();

app.get("/", (req, res) => {
    res.json({msg:"Server is running"});
})




export function startServer(){
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    })
}