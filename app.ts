import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { plaidService } from "./services/plaid/plaid-service";
import bodyParser from "body-parser";
import { myMoneyCounterService } from "./services/my_money_counter/my-money-count-service";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());

app.get("/link_token", async (req: Request, res: Response) => {
    console.log("Generating Link Token")
    const user = req.query.user as string
    const mode = req.query.mode as string
    console.log(user, mode)
    const linkToken = await plaidService.getLinkToken(user, mode)
    res.send({
        linkToken: linkToken
    });
});

app.post("/public_token", async (req: Request, res: Response) => {
    console.log("Exchanging Public Token")
    let publicToken = req.body.publicToken
    let firebaseUser = req.body.user
    const linkTokenResponse = await plaidService.receivePublicToken(publicToken, firebaseUser)
    res.send({
        result: true
    });
});

app.post("/get_auth", async (req: Request, res: Response) => {
    console.log("Get and Save Auth Data")
    let firebaseUser = req.body.user
    const authTokenResponse = await plaidService.getAuthToken(firebaseUser)
    res.send({
        result: true
    });
});


app.get("/accounts/:userId", async (req: Request, res: Response) => {
    console.log("Getting User's Plaid Accounts")
    let firebaseUser = req.params.userId
    const accounts = await myMoneyCounterService.getAccounts(firebaseUser)
    res.send({
        accounts: accounts
    });
});


app.post("/sync_transactions/:userId", async (req: Request, res: Response) => {
    console.log("Syncing User Transactions")
    let firebaseUser = req.params.userId
    const accounts = await plaidService.syncTransactions(firebaseUser)
    res.send({
        success: accounts
    });
});


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});