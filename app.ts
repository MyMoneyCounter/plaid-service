import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { plaidLinkService } from "./plaid-link";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/link_token", async (req: Request, res: Response) => {
    const linkTokenResponse = await plaidLinkService.getLinkToken()
    res.send({
        token: linkTokenResponse.link_token
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});