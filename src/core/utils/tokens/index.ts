export interface ChatGPTRequireTokens {
    chatRequirementsToken:  string;
    proofToken:             string;
    turnstileToken:         string;
}

export * from './tokenSolver.ts';