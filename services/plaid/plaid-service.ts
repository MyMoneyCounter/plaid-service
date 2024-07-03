import LinkTokenResponse from "../../models/AccessToken";
import { plaidDbService } from "./plaid-db-service";
import { plaidLinkService } from "./plaid-link-service";

class PlaidService {

    constructor() { }

    async getLinkToken(): Promise<string> {
        let linkToken = (await plaidLinkService.createLinkToken())
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
        return authResult && accountsResult
    }


}

export const plaidService = new PlaidService()