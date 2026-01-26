import { Client } from "pg";
import PlaidAccount from "../../models/PlaidAccount";
import BudgetProgress from "../../models/BudgetProgress";
import EstimatedBudget from "../../models/EstimatedBudget";

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

    async getBudgetProgress(firebaseUserId: string): Promise<BudgetProgress | null> {
        const client = await this.getClient()
        try {
            const result = await client.query(
                `SELECT userid, user_close_month, statement_year, days_remaining,
                        variable_expenses, daily_spending_limit, spend_remaining
                 FROM mmc.current_budget_progress
                 WHERE userid = $1`,
                [firebaseUserId]
            )
            if (result.rows.length > 0) {
                const row = result.rows[0]
                return {
                    userId: row.userid,
                    userCloseMonth: row.user_close_month,
                    statementYear: row.statement_year,
                    daysRemaining: row.days_remaining,
                    variableExpenses: parseFloat(row.variable_expenses) || 0,
                    dailySpendingLimit: parseFloat(row.daily_spending_limit) || 0,
                    spendRemaining: parseFloat(row.spend_remaining) || 0
                }
            }
            return null
        } catch (error) {
            console.error("Error fetching budget progress:", error)
            throw error
        }
    }

    async getEstimatedBudget(firebaseUserId: string): Promise<EstimatedBudget | null> {
        const client = await this.getClient()
        try {
            const result = await client.query(
                `SELECT userid, est_variable_expense, est_fixed_expense,
                        est_income, est_saving_amount, est_loan_payment
                 FROM mmc.estimated_current_budget
                 WHERE userid = $1`,
                [firebaseUserId]
            )
            if (result.rows.length > 0) {
                const row = result.rows[0]
                return {
                    userId: row.userid,
                    estVariableExpense: parseFloat(row.est_variable_expense) || 0,
                    estFixedExpense: parseFloat(row.est_fixed_expense) || 0,
                    estIncome: parseFloat(row.est_income) || 0,
                    estSavingAmount: parseFloat(row.est_saving_amount) || 0,
                    estLoanPayment: parseFloat(row.est_loan_payment) || 0
                }
            }
            return null
        } catch (error) {
            console.error("Error fetching estimated budget:", error)
            throw error
        }
    }

    async getTransactions(firebaseUserId: string, limit: number = 50): Promise<any[]> {
        const client = await this.getClient()
        try {
            const result = await client.query(
                `SELECT t.id, t.item_id, t.account_id, t.amount, t.authorized_date,
                        t.date, t.merchant_name, t.name, t.payment_channel,
                        t.transaction_id, t.date_created
                 FROM plaid.transaction t
                 INNER JOIN plaid.access_token a ON t.item_id = a.item_id
                 WHERE a.firebase_user_id = $1
                 ORDER BY t.date DESC
                 LIMIT $2`,
                [firebaseUserId, limit]
            )
            return result.rows.map((row) => ({
                id: row.id,
                itemId: row.item_id,
                accountId: row.account_id,
                amount: parseFloat(row.amount),
                authorizedDate: row.authorized_date,
                date: row.date,
                merchantName: row.merchant_name,
                name: row.name,
                paymentChannel: row.payment_channel,
                transactionId: row.transaction_id,
                dateCreated: row.date_created
            }))
        } catch (error) {
            console.error("Error fetching transactions:", error)
            throw error
        }
    }

}

export const myMoneyCounterDbService = new MyMoneyCounterDbService()