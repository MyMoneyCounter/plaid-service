import { AuthGetResponse, ItemPublicTokenExchangeResponse, Transaction } from "plaid";
import { Client, connect, SSLMode } from 'ts-postgres';
import AccessToken from "../../models/AccessToken";

class PlaidDbService {
    client!: Client;

    private async getClient() {
        if (this.client != null) {
            return this.client
        }
        else {
            return await connect({
                host: "money-counter-dev.postgres.database.azure.com",
                port: 5432,
                user: "moneycounteradmin",
                password: "Easyas1234",
                database: "my_money_counter",
                ssl: {
                    mode: SSLMode.Require
                }
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

    async saveTransactions(itemId: string, transactions: Transaction[]): Promise<Boolean> {
        const client = await this.getClient()
        client.query('begin')
        for (let transaction of transactions) {
            try {


                await client.query(
                    `INSERT INTO plaid.transaction (
                    item_id, 
                    account_id, 
                    amount, 
                    category, 
                    category_detail, 
                    category_confidence, 
                    iso_currency_code, 
                    merchant_name,
                    name, 
                    payment_channel, 
                    transaction_id)
                    VALUES ($1,$2,$3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    // [itemId,
                    //     transaction.account_id,
                    //     transaction.amount,
                    //     "2024-02-01", //transaction.authorized_date ? Date.parse(transaction.authorized_date) : null,
                    //     Date(), //transaction.authorized_datetime ? Date.parse(transaction.authorized_datetime) : null,
                    //     "A", //transaction.personal_finance_category?.primary,
                    //     "B", //transaction.personal_finance_category?.detailed,
                    //     "C", //transaction.personal_finance_category?.confidence_level,
                    //     Date(), //Date.parse(transaction.date),
                    //     transaction.iso_currency_code,
                    //     transaction.merchant_name,
                    //     transaction.name,
                    //     transaction.payment_channel,
                    //     transaction.transaction_id
                    // ]
                    ["123",
                        "123456",
                        12,

                        "A", //transaction.personal_finance_category?.primary,
                        "B", //transaction.personal_finance_category?.detailed,
                        "C", //transaction.personal_finance_category?.confidence_level,

                        "USD",
                        "UBER",
                        "PAID",
                        "CARD",
                        "4123456"
                    ]
                )
            }
            catch (e) {
                console.log(e)
            }

        }
        const result = await client.query('commit')
        return result.rows.length > 0
    }

    async saveTransactionCursor(itemId: string, cursor: string): Promise<Boolean> {
        const client = await this.getClient()
        const result = await client.query(
            `INSERT INTO plaid.transaction (item_id, cursor)
                VALUES ($1,$2)
            ON CONFLICT (item_id) 
            DO UPDATE set cursor = NEW.cursor, last_updated = current_timestamp`,
            [itemId, cursor]
        )
        return result.rows.length > 0
    }

    async getTransactionCursor(itemId: string): Promise<string | undefined> {
        const client = await this.getClient()
        const result = await client.query(
            "select cursor from plaid.transaction_cursor where item_id = $1",
            [itemId]
        )
        if (result.rows[0] != null) {
            return result.rows[0].get('cursor')
        }
        else {
            return undefined
        }

    }

}

export const plaidDbService = new PlaidDbService()