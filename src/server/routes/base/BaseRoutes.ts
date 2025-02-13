// Base Routes

import { Router } from "express";
import { getTokenService } from "../../../services";

const BaseRouter = Router();

BaseRouter.get("/", async (req, res) => {
    try {
        const {offset, limit} = req.query;
        // get all tokens
        const tokens = await getTokenService().getAllTokens(Number(offset ?? 1), Number(limit ?? 10));
        res.status(200).json(tokens);
    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
})

BaseRouter.get("/:tokenAddress", async (req, res) => {
    try {
        const {tokenAddress} = req.params;
        const token = await getTokenService().getTokenByAddress(tokenAddress);
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
})

export default BaseRouter;