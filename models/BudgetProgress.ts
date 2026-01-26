export default interface BudgetProgress {
    userId: string;
    userCloseMonth: number;
    statementYear: number;
    daysRemaining: number;
    variableExpenses: number;
    dailySpendingLimit: number;
    spendRemaining: number;
}
