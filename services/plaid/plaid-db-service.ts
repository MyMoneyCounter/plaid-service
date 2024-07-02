import { AuthGetResponse, ItemPublicTokenExchangeResponse } from "plaid";
import { Client, connect } from 'ts-postgres';
import AccessToken from "../../models/AccessToken";

class PlaidDbService {
    client!: Client;

    private async getClient() {
        if (this.client != null) {
            return this.client
        }
        else {
            return await connect({
                host: "money-counter-dev-restore.postgres.database.azure.com",
                port: 5432,
                user: "moneycounteradmin",
                password: "Easyas1234",
                database: "my_money_counter"
            })
        }
    }



    async saveAccessToken(publicToken: string, firbaseUserId: string, accessTokenResponse: ItemPublicTokenExchangeResponse): Promise<Boolean> {
        const client = await this.getClient()
        const result = await client.query(
            "INSERT INTO plaid.access_token (public_token, access_token, item_id, firebase_user_id) VALUES ($1,$2,$3,$4)",
            [publicToken, accessTokenResponse.access_token, accessTokenResponse.item_id, firbaseUserId]
        )
        return result.rows.length > 0
    }

    async getAccessTokenByUser(firbaseUserId: string): Promise<AccessToken> {
        const client = await this.getClient()
        const result = await client.query(
            "select access_token, item_id from plaid.access_token where firebase_user_id = $1",
            [firbaseUserId]
        )
        return {
            accessToken: result.rows[0].get('access_token'),
            itemId: result.rows[0].get('item_id')
        }

    }

    async saveAuthResponse(itemId: string, authResponse: AuthGetResponse): Promise<Boolean> {
        const client = await this.getClient()
        const result = await client.query(
            `INSERT INTO plaid.auth_response (item_id, auth_response) VALUES ($1,$2)
            ON CONFLICT (item_id) DO UPDATE SET auth_response = $2`,
            [itemId, authResponse]
        )
        return result.rows.length > 0
    }

    async saveAccounts(itemId: string, authResponse: AuthGetResponse): Promise<Boolean> {
        const client = await this.getClient()
        client.query('begin')
        for (let account of authResponse.accounts) {
            client.query(
                `INSERT INTO plaid.account (item_id, account_id, mask, account_name, official_name, persistent_account_id, account_sub_type, account_type, available_balance, current_balance, currency_code)
                 VALUES ($1,$2,$3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [itemId, account.account_id, account.mask, account.name, account.official_name, account.persistent_account_id, account.subtype, account.type, account.balances.available, account.balances.current, account.balances.iso_currency_code]
            )
        }
        const result = await client.query('commit')
        return result.rows.length > 0
    }

}

export const plaidDbService = new PlaidDbService()