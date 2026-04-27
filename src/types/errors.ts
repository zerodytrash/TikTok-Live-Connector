/**
 * Minimal structural type for the response object passed to {@link SignatureRateLimitError}.
 * Avoids depending on axios's declaration files (which the library no longer ships at runtime).
 */
type RateLimitedResponse = {
    headers: Record<string, string | undefined>;
};

class ConnectError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidUniqueIdError extends Error {
}

type InvalidResponseErrorConfig = {
    routeId: string;
    requestErr?: Error
}

type InvalidRequestErrorConfig = {
    routeId: string;
}


export class InvalidResponseError extends Error {
    constructor(
        public readonly config: InvalidResponseErrorConfig,
        ...args: string[]
    ) {
        super(`[${config.routeId}] ${args.join(' ')}`);
    }
}

type InvalidResponseCompositeErrorConfig = {
    routeId: string;
    requestErrs?: Error[]
}

export class InvalidResponseCompositeError extends Error {
    constructor(
        public readonly config: InvalidResponseCompositeErrorConfig,
        ...args: any[]
    ) {
        super(...args);
    }
}

export class InvalidRequestError extends Error {
    constructor(
        public readonly config: InvalidRequestErrorConfig,
        ...args: string[]
    ) {
        super(`[${config.routeId}] ${args.join(' ')}`);
    }
}

export class AlreadyConnectingError extends ConnectError {
}

export class AlreadyConnectedError extends ConnectError {
}

export class UserOfflineError extends ConnectError {
}

export class ConnectTimeoutError extends ConnectError {

}

export class InvalidSchemaNameError extends Error {
}

export class SchemaDecodeError extends Error {

}

export class TikTokLiveError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export enum ErrorReason {
    RATE_LIMIT = 'Rate Limited',
    CONNECT_ERROR = 'Connect Error',
    EMPTY_PAYLOAD = 'Empty Payload',
    SIGN_NOT_200 = 'Sign Error',
    EMPTY_COOKIES = 'Empty Cookies',
    PREMIUM_FEATURE = 'Premium Feature',
    AUTHENTICATED_WS = 'Authenticated WS'
}


export class SignAPIError extends TikTokLiveError {
    public reason: ErrorReason;
    public readonly requestId?: string;
    public readonly agentId?: string;

    constructor(
        reason: ErrorReason,
        requestId?: string,
        agentId?: string,
        ...args: (string | Error | undefined)[]
    ) {
        super([`[${reason}]`, ...args.filter((a) => a !== undefined).map((a) => a instanceof Error ? a.message : a)].join(' '));
        this.reason = reason;
        this.requestId = requestId;
        this.agentId = agentId;
    }

    public static formatSignServerMessage(message: string): string {
        message = message.trim();
        const msgLen = message.length;
        const headerText = 'SIGN SERVER MESSAGE';
        const headerLen = Math.floor((msgLen - headerText.length) / 2);
        const paddingLen = (msgLen - headerText.length) % 2;

        const footer = '+' + '-'.repeat(msgLen + 2) + '+';
        const header = '+' + '-'.repeat(headerLen) + ' ' + headerText + ' ' + '-'.repeat(headerLen + paddingLen) + '+';
        const prefix = '|' + ' '.repeat(header.length - 2) + '|';
        const body = '| ' + message + ' |';

        return `\n\t${prefix}\n\t${header}\n\t${body}\n\t${footer}\n`;
    }
}

export class SignatureRateLimitError extends SignAPIError {
    public readonly retryAfter: number;
    public readonly resetTime?: number;

    constructor(apiMessage: string | undefined, formatStr: string, response: RateLimitedResponse) {
        const retryAfter = SignatureRateLimitError.calculateRetryAfter(response);
        const resetTime = SignatureRateLimitError.calculateResetTime(response);
        const logId = response.headers['x-log-id'];
        const agentId = response.headers['x-agent-id'];

        const formattedMsg = formatStr.replace('%s', retryAfter.toString());
        const args: string[] = [formattedMsg];

        if (apiMessage) {
            const serverMsg = SignAPIError.formatSignServerMessage(apiMessage);
            args.push(serverMsg);
        }

        super(ErrorReason.RATE_LIMIT, logId, agentId, ...args);

        this.retryAfter = retryAfter;
        this.resetTime = resetTime;
    }

    private static parseHeaderNumber(value: string | undefined): number | undefined {
        return value ? parseInt(value) : undefined;
    }

    private static calculateRetryAfter(response: RateLimitedResponse): number {
        const retryAfter = parseInt(response.headers['retry-after'] || '0');
        return retryAfter * 1000;
    }

    private static calculateResetTime(response: RateLimitedResponse): number | undefined {
        const value = response.headers['x-ratelimit-reset'];
        return value ? parseInt(value) * 1000 : undefined;
    }

}

export class SignatureMissingTokensError extends SignAPIError {
    constructor(...args: string[]) {
        super(ErrorReason.EMPTY_PAYLOAD, undefined, undefined, ...args);
    }
}

export class PremiumFeatureError extends SignAPIError {
    constructor(apiMessage: string, ...args: string[]) {
        args.push(SignAPIError.formatSignServerMessage(apiMessage));
        super(ErrorReason.PREMIUM_FEATURE, undefined, undefined, ...args);
    }
}

export class AuthenticatedWebSocketConnectionError extends SignAPIError {
    constructor(...args: string[]) {
        super(ErrorReason.AUTHENTICATED_WS, undefined, undefined, ...args);
    }
}

