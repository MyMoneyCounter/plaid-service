import LinkTokenResponse from "../../models/AccessToken";
import { plaidDbService } from "./plaid-db-service";
import { plaidLinkService } from "./plaid-link-service";

class PlaidService {

    constructor() { }

    async getLinkToken(user: string, mode: string): Promise<string> {
        let linkToken = ""
        if (mode == "UPDATE") {
            let accessToken = await plaidDbService.getAccessTokenByUser(user)
            linkToken = (await plaidLinkService.createLinkToken(accessToken.accessToken))
        }
        else {
            linkToken = (await plaidLinkService.createLinkToken())
        }
        return linkToken
    }

    async receivePublicToken(publicToken: string, firbaseUserId: string): Promise<Boolean> {
        let accessTokenResponse = await plaidLinkService.exchangePublicToken(publicToken)
        let dbResult = await plaidDbService.saveAccessToken(publicToken, firbaseUserId, accessTokenResponse)
        let accountResult = await this.getAuthToken(firbaseUserId)
        return dbResult && accountResult
    }

    async getAuthToken(firebaseUserId: string): Promise<Boolean> {
        let tokens = await plaidDbService.getAccessTokenByUser(firebaseUserId)
        let authTokenResponse = await plaidLinkService.getAuth(tokens.accessToken)
        let authResult = await plaidDbService.saveAuthResponse(tokens.itemId, authTokenResponse)
        let accountsResult = await plaidDbService.saveAccounts(tokens.itemId, authTokenResponse)
        let transactionResult = await this.syncTransactions(firebaseUserId)
        return authResult && accountsResult && transactionResult
    }


    async syncTransactions(firebaseUserId: string): Promise<Boolean> {
        let tokens = await plaidDbService.getAccessTokenByUser(firebaseUserId)
        let cursor = await plaidDbService.getTransactionCursor(tokens.itemId)
        console.log(tokens, cursor)
        return this.syncAllTransactons(tokens.accessToken, tokens.itemId, cursor)
    }

    private async syncAllTransactons(accessToken: string, itemId: string, cursor: string | undefined): Promise<Boolean> {
        let transactionsResponse = await plaidLinkService.getTransactions(accessToken, cursor)

        if (transactionsResponse.added.length > 0) {
            await plaidDbService.saveTransactions(itemId, transactionsResponse.added)
        }


        if (transactionsResponse.has_more) {
            return this.syncAllTransactons(accessToken, itemId, transactionsResponse.next_cursor)
        }
        else {
            let saveCursorResult = await plaidDbService.saveTransactionCursor(itemId, transactionsResponse.next_cursor)
            return saveCursorResult;
        }
    }


}

export const plaidService = new PlaidService()