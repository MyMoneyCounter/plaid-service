import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { plaidService } from "./services/plaid/plaid-service";
import bodyParser from "body-parser";
import { myMoneyCounterService } from "./services/my_money_counter/my-money-count-service";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins (for development)
// In production, you should restrict this to your domain
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());

app.get("/link_token", async (req: Request, res: Response) => {
    console.log("Generating Link Token")
    const user = req.query.user as string
    const item = req.query.item as string | undefined
    console.log(user, item)
    const linkToken = await plaidService.getLinkToken(user, item)
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
    let itemId = req.body.itemId
    const authTokenResponse = await plaidService.getAuthToken(firebaseUser, itemId)
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
    let firebaseUser = req.body.user
    let itemId = req.body.itemId
    const accounts = await plaidService.syncTransactions(firebaseUser, itemId)
    res.send({
        success: accounts
    });
});

// Budget endpoints
app.get("/budget/:userId", async (req: Request, res: Response) => {
    console.log("Getting User's Budget Data")
    try {
        let firebaseUser = req.params.userId
        const budgetData = await myMoneyCounterService.getBudgetData(firebaseUser)
        res.send(budgetData);
    } catch (error) {
        console.error("Error getting budget data:", error)
        res.status(500).send({ error: "Failed to get budget data" })
    }
});

app.get("/budget/:userId/progress", async (req: Request, res: Response) => {
    console.log("Getting User's Budget Progress")
    try {
        let firebaseUser = req.params.userId
        const budgetProgress = await myMoneyCounterService.getBudgetProgress(firebaseUser)
        res.send({ budgetProgress });
    } catch (error) {
        console.error("Error getting budget progress:", error)
        res.status(500).send({ error: "Failed to get budget progress" })
    }
});

app.get("/budget/:userId/estimated", async (req: Request, res: Response) => {
    console.log("Getting User's Estimated Budget")
    try {
        let firebaseUser = req.params.userId
        const estimatedBudget = await myMoneyCounterService.getEstimatedBudget(firebaseUser)
        res.send({ estimatedBudget });
    } catch (error) {
        console.error("Error getting estimated budget:", error)
        res.status(500).send({ error: "Failed to get estimated budget" })
    }
});

app.get("/transactions/:userId", async (req: Request, res: Response) => {
    console.log("Getting User's Transactions")
    try {
        let firebaseUser = req.params.userId
        let limit = parseInt(req.query.limit as string) || 50
        const transactions = await myMoneyCounterService.getTransactions(firebaseUser, limit)
        res.send({ transactions });
    } catch (error) {
        console.error("Error getting transactions:", error)
        res.status(500).send({ error: "Failed to get transactions" })
    }
});


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});