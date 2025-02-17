import { v1 } from 'jsr:@std/uuid';
import { createHash } from 'node:crypto';
import browserConfig from './browserPrint/browserConfig.json' with { type: 'json' };

export class RequirementsTokenSolver {
    static tokenPrefix  = 'gAAAAAB';
    static answerPrefix = 'wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D';

    static maxAttempts = 5e5;

    constructor() {
        this.answer = '';
        this.seed   = Math.random().toString();
    }

    static encode(x) {
        const e = JSON.stringify(x);
        return btoa(String.fromCharCode(...new TextEncoder().encode(e)));
    }

    static choose(e) {
        return e[Math.floor(Math.random() * e.length)];
    }

    static getConfig() {
        return [
            browserConfig.screen.width + browserConfig.screen.height,
            '' + new Date(),
            browserConfig.performance.memory.jsHeapSizeLimit,
            Math.random(),
            browserConfig.navigator.userAgent,
            '',
            '',
            browserConfig.navigator.language,
            browserConfig.navigator.languages.join(','),
            Math.random(),
            RequirementsTokenSolver.choose(Object.keys(browserConfig.navigator)),
            RequirementsTokenSolver.choose(Object.keys(browserConfig.document)),
            RequirementsTokenSolver.choose(Object.keys(browserConfig.window)),
            performance.now(),
            v1.generate(),
            '',
            browserConfig.navigator.hardwareConcurrency,
        ];
    }

    static generateAnswer() {
        let n = 'e';
        const i = performance.now();

        try {
            const o = this.getConfig();

            for (let s = 0; s < RequirementsTokenSolver.maxAttempts; ++s) {
                o[3] = s;
                o[9] = Math.round(performance.now() - i);

                const u = RequirementsTokenSolver.encode(o);
                const hash = createHash('sha3-512').update(this.seed + u).digest('hex');
                if (hash.substring(0, this.difficulty.length) <= this.difficulty) {
                    return u;
                }
            }
        } catch (e) {
            n = RequirementsTokenSolver.encode('' + e);
        }

        return RequirementsTokenSolver.answerPrefix + n;
    }

    static getRequirementsToken() {
        if (this.answer) {
            return this.answer;
        }

        return RequirementsTokenSolver.tokenPrefix + this.generateAnswer();
    }
}

export default new RequirementsTokenSolver();