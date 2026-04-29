type ErrorHandler = { handleError: (err: Error, info: string) => void };

export function HandleError(errMsg: string, exceptionWrapper?: new (err: Error, ...args: any[]) => Error) {

    return function (
        _target: object,
        _propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {

        const originalMethod = descriptor.value as (...args: any[]) => any;

        descriptor.value = function (this: ErrorHandler, ...args: any[]) {
            const handle = (err: Error) => {

                // Handle wrapper classes
                if (exceptionWrapper) {
                    err = new exceptionWrapper(err, errMsg);
                }

                this.handleError(err, errMsg);
            };
            try {
                const result = originalMethod.apply(this, args);
                if (result instanceof Promise) {
                    return result.catch((err: Error) => {
                        handle(err);
                        throw err;
                    });
                }
                return result;
            } catch (err) {
                handle(err as Error);
                throw err;
            }
        };

        return descriptor;
    };
}


