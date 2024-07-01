import PlaidAccount from "../../models/PlaidAccount";
import { myMoneyCounterDbService } from "./my-money-counter-db-service";
import { plaidLinkService } from "../plaid/plaid-link-service";

class MyMoneyCounterService {

    constructor() { }

    async getAccounts(firebaseUserId: string): Promise<PlaidAccount[]> {
        let accounts = await myMoneyCounterDbService.getAccounts(firebaseUserId)
        return accounts
    }


}

export const myMoneyCounterService = new MyMoneyCounterService()