import PlaidAccount from "../../models/PlaidAccount";
import BudgetProgress from "../../models/BudgetProgress";
import EstimatedBudget from "../../models/EstimatedBudget";
import { myMoneyCounterDbService } from "./my-money-counter-db-service";
import { plaidLinkService } from "../plaid/plaid-link-service";

class MyMoneyCounterService {

    constructor() { }

    async getAccounts(firebaseUserId: string): Promise<PlaidAccount[]> {
        let accounts = await myMoneyCounterDbService.getAccounts(firebaseUserId)
        return accounts
    }

    async getBudgetProgress(firebaseUserId: string): Promise<BudgetProgress | null> {
        return await myMoneyCounterDbService.getBudgetProgress(firebaseUserId)
    }

    async getEstimatedBudget(firebaseUserId: string): Promise<EstimatedBudget | null> {
        return await myMoneyCounterDbService.getEstimatedBudget(firebaseUserId)
    }

    async getBudgetData(firebaseUserId: string): Promise<{
        budgetProgress: BudgetProgress | null,
        estimatedBudget: EstimatedBudget | null
    }> {
        const [budgetProgress, estimatedBudget] = await Promise.all([
            this.getBudgetProgress(firebaseUserId),
            this.getEstimatedBudget(firebaseUserId)
        ])
        return { budgetProgress, estimatedBudget }
    }

    async getTransactions(firebaseUserId: string, limit: number = 50): Promise<any[]> {
        return await myMoneyCounterDbService.getTransactions(firebaseUserId, limit)
    }

}

export const myMoneyCounterService = new MyMoneyCounterService()