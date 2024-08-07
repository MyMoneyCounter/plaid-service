import { AuthGetResponse, Configuration, CountryCode, ItemPublicTokenExchangeResponse, PlaidApi, PlaidEnvironments, Products, TransactionsSyncResponse } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': '64a85063b3e32f001ae141d8',
            'PLAID-SECRET': 'a1469e4f377c6e8a55151bf660b86d',
        },
    },
});

const plaidClient = new PlaidApi(configuration);

class PlaidLinkService {

    constructor() { }

    async createLinkToken(): Promise<string> {
        return plaidClient.linkTokenCreate({
            client_name: "Money Smart",
            language: "en",
            country_codes: [CountryCode.Us],
            user: {
                'client_user_id': '64a85063b3e32f001ae141d8',
            },
            products: [Products.Auth, Products.Transactions, Products.Liabilities]
        })
            .then((linkTokenResponse) => linkTokenResponse.data.link_token)
            .catch((error) => {
                console.error("Failed to create link tokne", error.response.data)
                throw Error(`Failed to create link token, ${error.response.data}`)
            })
    }

    async exchangePublicToken(publicToken: string): Promise<ItemPublicTokenExchangeResponse> {
        return plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        })
            .then((accessTokenResonse) => accessTokenResonse.data)
            .catch((error) => {
                console.error("Failed to exchange public token", error.response.data)
                throw Error(`Failed to exchange public token, ${error.response.data}`)
            })
    }

    async getAuth(access_token: string): Promise<AuthGetResponse> {
        return plaidClient.authGet({
            access_token: access_token
        })
            .then((authResonse) => authResonse.data)
            .catch((error) => {
                console.error("Failed to get auth", error.response.data)
                throw Error(`Failed to get auth, ${error.response.data}`)
            })
    }

    async getTransactions(access_token: string, cursor?: string): Promise<TransactionsSyncResponse> {
        return plaidClient.transactionsSync({
            access_token: access_token,
            cursor: cursor
        })
            .then((authResonse) => authResonse.data)
            .catch((error) => {
                console.error("Failed to get auth", error.response.data)
                throw Error(`Failed to get auth, ${error.response.data}`)
            })
    }

}

export const plaidLinkService = new PlaidLinkService()