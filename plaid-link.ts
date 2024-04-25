import LinkTokenResponse from "./models/LinkTokenResponse";

class PlaidLinkService {

    constructor() { }

    async getLinkToken(): Promise<LinkTokenResponse> {
        const response = await fetch('https://sandbox.plaid.com/link/token/create', {
            method: 'POST',
            body: JSON.stringify({
                'client_id': '64a85063b3e32f001ae141d8', // Replace with your Plaid client ID
                'secret': 'a1469e4f377c6e8a55151bf660b86d', // Replace with your Plaid secret
                'user': {
                    'client_user_id':
                        '64a85063b3e32f001ae141d8', // Replace with the actual client_user_id
                },
                'client_name': 'Money Smart',
                'products': ['auth', 'transactions', 'liabilities'],
                'language': 'en',
                'webhook': 'https://webhook.example.com',
                'android_package_name': 'com.example.my_money_counter',
                'country_codes': ['US'],
            }),
            headers: { 'Content-Type': 'application/json', 'Plaid-API-Ke': 'a1469e4f377c6e8a55151bf660b86d' }
        });

        if (!response.ok) {
            console.log("Failed to craete Link token")
            return Promise.reject(new Error(`Failed to create link token, ${response.status}, ${response.statusText}`))
        } else {
            console.error("Create Link Token")
            let responseObject = response.json() as Promise<LinkTokenResponse>
            return await responseObject
        }
    }
}

export const plaidLinkService = new PlaidLinkService()