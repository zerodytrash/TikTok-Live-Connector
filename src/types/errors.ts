import { AxiosResponse } from 'axios';

class ConnectError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidUniqueIdError extends Error {
}

export class ExtractRoomIdError extends Error {
    constructor(public readonly errors: Error[], ...args: any[]) {
        super();
    }
}

export class FetchIsLiveError extends Error {
    constructor(public readonly errors: Error[], ...args: any[]) {
        super();
    }
}


export class InvalidResponseError extends Error {
    constructor(
        message: string,
        public readonly requestErr: Error = undefined
    ) {
        super(message);
        this.name = 'InvalidResponseError';
    }
}

export class MissingRoomIdError extends Error {
}


export class AlreadyConnectingError extends ConnectError {
}

export class AlreadyConnectedError extends ConnectError {
}

export class UserOfflineError extends ConnectError {
}

export class InvalidSchemaNameError extends Error {
}

export class TikTokLiveError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export enum ErrorReason {
    RATE_LIMIT = 1,
    CONNECT_ERROR,
    EMPTY_PAYLOAD,
    SIGN_NOT_200,
    EMPTY_COOKIES,
    PREMIUM_ENDPOINT,
    AUTHENTICATED_WS
}

export class FetchSignedWebSocketIdentityParameterError extends Error {
}

export class SignAPIError extends TikTokLiveError {
    public reason: ErrorReason;
    private readonly _logId?: number;
    private readonly _agentId?: string;

    constructor(
        reason: ErrorReason,
        logId?: number,
        agentId?: string,
        ...args: (string | undefined)[]
    ) {
        super([`[${ErrorReason[reason]}]`, ...args].join(' '));
        this.reason = reason;
        this._logId = logId;
        this._agentId = agentId;
    }

    public get log_id(): number | undefined {
        return this._logId;
    }

    public get agent_id(): string | undefined {
        return this._agentId;
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
    private readonly _retryAfter: number;
    private readonly _resetTime?: number;

    constructor(apiMessage: string | undefined, formatStr: string, response: AxiosResponse) {
        const retryAfter = SignatureRateLimitError.calculateRetryAfter(response);
        const resetTime = SignatureRateLimitError.calculateResetTime(response);
        const logId = SignatureRateLimitError.parseHeaderNumber(response.headers['X-Log-ID']);
        const agentId = response.headers['X-Agent-ID'];

        const formattedMsg = formatStr.replace('%s', retryAfter.toString());
        const args: string[] = [formattedMsg];

        if (apiMessage) {
            const serverMsg = SignAPIError.formatSignServerMessage(apiMessage);
            args.push(serverMsg);
        }

        super(ErrorReason.RATE_LIMIT, logId, agentId, ...args);

        this._retryAfter = retryAfter;
        this._resetTime = resetTime;
    }

    private static parseHeaderNumber(value: string | undefined): number | undefined {
        return value ? parseInt(value) : undefined;
    }

    private static calculateRetryAfter(response: AxiosResponse): number {
        return parseInt(response.headers['RateLimit-Remaining'] || '0');
    }

    private static calculateResetTime(response: AxiosResponse): number | undefined {
        const value = response.headers['RateLimit-Reset'];
        return value ? parseInt(value) : undefined;
    }

    public get retry_after(): number {
        return this._retryAfter;
    }

    public get reset_time(): number | undefined {
        return this._resetTime;
    }
}

export class UnexpectedSignatureError extends SignAPIError {
    constructor(...args: string[]) {
        super(ErrorReason.SIGN_NOT_200, undefined, undefined, ...args);
    }
}

export class SignatureMissingTokensError extends SignAPIError {
    constructor(...args: string[]) {
        super(ErrorReason.EMPTY_PAYLOAD, undefined, undefined, ...args);
    }
}

export class PremiumEndpointError extends SignAPIError {
    constructor(apiMessage: string, ...args: string[]) {
        args.push(SignAPIError.formatSignServerMessage(apiMessage));
        super(ErrorReason.PREMIUM_ENDPOINT, undefined, undefined, ...args);
    }
}

export class AuthenticatedWebSocketConnectionError extends SignAPIError {
    constructor(...args: string[]) {
        super(ErrorReason.AUTHENTICATED_WS, undefined, undefined, ...args);
    }
}
