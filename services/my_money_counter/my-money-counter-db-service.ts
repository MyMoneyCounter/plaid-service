import { AuthGetResponse, ItemPublicTokenExchangeResponse } from "plaid";
import { Client, connect } from 'ts-postgres';
import AccessToken from "../../models/AccessToken";
import PlaidAccount from "../../models/PlaidAccount";

class MyMoneyCounterDbService {
    client!: Client;

    private async getClient() {
        if (this.client != null) {
            return this.client
        }
        else {
            return await connect({
                host: "localhost",
                port: 5432,
                user: "postgres",
                password: "password",
                database: "my_money_counter"
            })
        }
    }

    async getAccounts(firbaseUserId: string): Promise<PlaidAccount[]> {
        const client = await this.getClient()
        const result = await client.query(
            `SELECT id, item_id, account_id, mask, account_name, official_name, persistent_account_id, account_sub_type, account_type, available_balance, current_balance, currency_code, date_created FROM plaid.account where item_id in (
                select item_id from plaid.access_tokens where firebase_user_id = $1
            )
            `,
            [firbaseUserId]
        )
        return result.rows.map((row) => {
            let account: PlaidAccount = {
                itemId: row.get('item_id'),
                accountId: row.get('account_id'),
                mask: row.get('mask'),
                accountName: row.get('account_name'),
                officialName: row.get('official_name'),
                persistentAccountId: row.get('persistent_account_id'),
                acountSubType: row.get('account_sub_type'),
                accountType: row.get('account_type'),
                availableBalance: row.get('available_balance'),
                currentBalance: row.get('current_balance'),
                currencyCode: row.get('currency_code'),
                dateCreated: row.get('date_created')
            }
            return account
        }

        )

    }


}

export const myMoneyCounterDbService = new MyMoneyCounterDbService()