import { createHash } from 'node:crypto';
import { v1 } from 'jsr:@std/uuid';
import browserConfig from './browserPrint/browserConfig.json' with { type: 'json' };

export class ProofTokenSolver {
    static tokenPrefix  = 'gAAAAAB';
    static answerPrefix = 'wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D';

    static maxAttempts = 5e5;

    constructor(proofOfWork) {
        if (!proofOfWork || !proofOfWork.seed || !proofOfWork.difficulty) {
            throw new Error('Invalid proof of work configuration');
        }

        const { seed, difficulty } = proofOfWork;

        this.seed = seed;
        this.difficulty = difficulty;

        this.answers = new Map();
    }

    static encode(x) {
        const e = JSON.stringify(x);
        return btoa(String.fromCharCode(...new TextEncoder().encode(e)));
    }

    static choose(e) {
        return e[Math.floor(Math.random() * e.length)];
    }

    getConfig() {
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
            ProofTokenSolver.choose(Object.keys(browserConfig.navigator)),
            ProofTokenSolver.choose(Object.keys(browserConfig.document)),
            ProofTokenSolver.choose(Object.keys(browserConfig.window)),
            performance.now(),
            v1.generate(),
            '',
            browserConfig.navigator.hardwareConcurrency,
        ];
    }

    generateAnswer() {
        let n = 'e';
        const i = performance.now();

        try {
            const o = this.getConfig();

            for (let s = 0; s < ProofTokenSolver.maxAttempts; ++s) {
                o[3] = s;
                o[9] = Math.round(performance.now() - i);

                const u = ProofTokenSolver.encode(o);
                const hash = createHash('sha3-512').update(this.seed + u).digest('hex');
                if (hash.substring(0, this.difficulty.length) <= this.difficulty) {
                    return u;
                }
            }
        } catch (e) {
            n = ProofTokenSolver.encode('' + e);
        }

        return ProofTokenSolver.answerPrefix + n;
    }

    getAnswer() {
        if (this.answers.has(this.seed)) {
            return ProofTokenSolver.tokenPrefix + this.answers.get(this.seed);
        }

        const answer = this.generateAnswer();
        this.answers.set(this.seed, answer);

        return ProofTokenSolver.tokenPrefix + answer;
    }

    /**
     * @returns {Promise<string>}
     */
    solve() {
        return new Promise((resolve) => {
            resolve(this.getAnswer());
        });
    }
}

const main = async () => {
    const proofOfWork = {
        'required': true,
        'seed': '0.5771510402197845',
        'difficulty': '06fb55',
    };

    const solver = new ProofTokenSolver(proofOfWork);
    const token = await solver.solve();

    console.log(token);
};

if (import.meta.main) {
    main();
<<<<<<< HEAD
}
=======
}
>>>>>>> 3562679 (Add temporary chat, web search message)
