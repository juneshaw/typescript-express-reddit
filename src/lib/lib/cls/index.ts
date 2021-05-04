import cls from "cls-hooked";
import express from "express";

class RequestContext {
    private ns: cls.Namespace;

    public init(nsid: string) {
        this.ns = cls.createNamespace(nsid);
    }

    // Express.js middleware that is responsible for initializing the context for each request.
    public middleware() {
        const n = this.ns;
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            n.run(() => next());
        };
    }

   // Gets a value from the context by key.  Will return undefined if the context has not yet been initialized for this request or if a value is not found for the specified key.
    public get(key: string) {
        if (this.ns && this.ns.active) {
            return this.ns.get(key);
        }
    }

    public namespace() {
        return this.ns;
    }

    // Adds a value to the context by key.  If the key already exists, its value will be overwritten.  No value will persist if the context has not yet been initialized.
    public set(key: string, value: any) {
        if (this.ns && this.ns.active) {
            return this.ns.set(key, value);
        }
    }
}
export const requestContext = new RequestContext();
