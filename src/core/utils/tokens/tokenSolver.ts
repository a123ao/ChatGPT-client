import { ChatGPTRequireTokens } from './index.ts';
import { RequirementsTokenSolver } from './requirementsTokenSolver.js';
import { ProofTokenSolver } from './proofTokenSolver.js';

interface ChatGPTRequirements {
    persona:    string;
    token:      string;
    arkose:     string;
    turnstile: {
        required:   boolean;
        dx:         string;
    };
    proofofwork: {
        required:   boolean;
        seed:       string;
        difficulty: number;
    }
}

export class TokenSolver {
    private readonly headers: Record<string, string>;

    constructor(headers: Record<string, string>) {
        this.headers = headers;
    }

    public async getRequirements(): Promise<ChatGPTRequirements> {
        const url = 'https://chatgpt.com/backend-api/sentinel/chat-requirements';

        const headers = {
            ...this.headers,
            'content-type': 'application/json',
        };

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ p: RequirementsTokenSolver.getRequirementsToken() }),
        });
        if (!res.ok) throw new Error('Failed to get requirements. Try to update your cookie.');

        return await res.json();
    }

    public async getTokens(): Promise<ChatGPTRequireTokens> {
        const requirements = await this.getRequirements();

        const proofOfWorkSolver = new ProofTokenSolver(requirements.proofofwork);
        const proofToken        = await proofOfWorkSolver.solve();

        // Turnstile token is not necessary currently

        return { chatRequirementsToken: requirements.token, proofToken, turnstileToken: '' };
    }
}