import { Client } from "pg";
import PlaidAccount from "../../models/PlaidAccount";

class MyMoneyCounterDbService {
    private client!: Client;

    private async getClient(): Promise<Client> {
        if (this.client != null) {
            return this.client
        }
        else {
            this.client = new Client({
                host: "money-counter-dev.postgres.database.azure.com",
                port: 5432,
                user: "moneycounteradmin",
                password: "Easyas1234",
                database: "my_money_counter",
                ssl: true
            })

            await this.client.connect();
            return this.client;
        }
    }

    async getAccounts(firbaseUserId: string): Promise<PlaidAccount[]> {
        const client = await this.getClient()
        const result = await client.query(
            `SELECT id, item_id, account_id, mask, account_name, official_name, persistent_account_id, account_sub_type, account_type, available_balance, current_balance, currency_code, date_created FROM plaid.account where item_id in (
                select item_id from plaid.access_token where firebase_user_id = $1
            )
            `,
            [firbaseUserId]
        )
        return result.rows.map((row) => {
            let account: PlaidAccount = {
                itemId: row.item_id,
                accountId: row.account_id,
                mask: row.mask,
                accountName: row.account_name,
                officialName: row.official_name,
                persistentAccountId: row.persistent_account_id,
                accountSubType: row.account_sub_type,
                accountType: row.account_type,
                availableBalance: row.available_balance,
                currentBalance: row.current_balance,
                currencyCode: row.currency_code,
                dateCreated: row.date_created
            }
            return account
        }

        )

    }


}

export const myMoneyCounterDbService = new MyMoneyCounterDbService()