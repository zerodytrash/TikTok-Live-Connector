import { HttpRoute, WrappedHttpRoute } from '@/types/route';

export function createRoute<P extends object, R>(
    routeId: string,
    routeHandler: WrappedHttpRoute<P, R>
): HttpRoute<P, R> {
    return (args: P) => routeHandler({ ...args, routeId });
}
