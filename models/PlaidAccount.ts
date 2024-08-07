interface PlaidAccount {
    itemId: string,
    accountId: string,
    mask: string,
    accountName: string,
    officialName: string | null,
    persistentAccountId: string | null,
    accountSubType: string,
    accountType: string,
    availableBalance: number | null,
    currentBalance: number,
    currencyCode: string,
    dateCreated: Date
}

export default PlaidAccount