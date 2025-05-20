export class CookieParams {
    private cookies: Map<string, string>;

    constructor(cookieString = "") {
        this.cookies = CookieParams.parse(cookieString);
    }

    public static parse(cookieString: string) {
        if (!cookieString) return new Map<string, string>();

        const cookies = new Map<string, string>();
        cookieString
            .split(";")
            .forEach((cookie) => {
                const [key, value] = cookie.split("=");
                
                if (!key || !value) return;
                cookies.set(key.trim(), encodeURIComponent(value));
            });

        return cookies;
    }

<<<<<<< HEAD
=======
    public static getSetCookie(name: string, cookieString: string[]) {
        for (const cookie of cookieString) {
            if (cookie.startsWith(name + "=")) {
              return cookie.split('"')[1];
            }
        }
        return "";
    }

>>>>>>> 3562679 (Add temporary chat, web search message)
    public get(key: string) {
        return this.cookies.get(key);
    }

    public set(key: string, value: string) {
        this.cookies.set(key.trim(), encodeURIComponent(value));
    }

    public delete(key: string) {
        this.cookies.delete(key);
    }

    public has(key: string) {
        return this.cookies.has(key);
    }

    public clear() {
        this.cookies.clear();
    }

    public entries() {
        return new Map(this.cookies).entries();
    }

    public keys() {
        return this.cookies.keys();
    }

    public values() {
        return this.cookies.values();
    }

    public size() {
        return this.cookies.size;
    }

    public toString() {
        return [...this.cookies.entries()].reduce((acc, [key, value]) => acc + `${key}=${value}; `, "");
    }

    public forEach(callback: (value: string, key: string) => void) {
        this.cookies.forEach(callback);
    }

    public copy() {
        return new CookieParams(this.toString());
    }
}
