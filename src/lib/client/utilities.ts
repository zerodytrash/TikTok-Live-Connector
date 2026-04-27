type ErrorHandler = { handleError: (err: Error, info: string) => void };

export function HandleError(errMsg: string, exceptionWrapper?: new (err: Error, ...args: any[]) => Error) {

    return function <This, Args extends any[], Return>(
        originalMethod: (this: This, ...args: Args) => Return,
        _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ) {

        return function(this: This, ...args: Args): Return {
            const handle = (err: Error) => {

                // Handle wrapper classes
                if (exceptionWrapper) {
                    err = new exceptionWrapper(err, errMsg);
                }

                (this as This & ErrorHandler).handleError(err, errMsg);
            };
            try {
                const result = originalMethod.apply(this, args);
                if (result instanceof Promise) {
                    return result.catch((err: Error) => {
                        handle(err);
                        throw err;
                    }) as Return;
                }
                return result;
            } catch (err) {
                handle(err as Error);
                throw err;
            }
        };
    };
}


