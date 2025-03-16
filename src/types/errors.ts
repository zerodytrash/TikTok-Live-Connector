class ConnectError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidUniqueIdError extends Error {
}

export class InvalidSessionIdError extends Error {
}

export class ExtractRoomIdError extends Error {
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

export class SignatureError extends InvalidResponseError {
    constructor(
        message: string,
        requestErr: Error = undefined
    ) {
        super(message, requestErr);
        this.name = 'SignatureError';
    }
}

export class InitialFetchError extends ConnectError {
    constructor(
        message: string,
        public readonly retryAfter: number
    ) {
        super(message);
    }
}

export class AlreadyConnectingError extends ConnectError {
}

export class AlreadyConnectedError extends ConnectError {
}

export class UserOfflineError extends ConnectError {
}

export class NoWSUpgradeError extends ConnectError {
}

export class InvalidSchemaNameError extends Error {
}

