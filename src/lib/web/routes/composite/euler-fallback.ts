/**
 * HTTP status codes Euler Stream returns when the caller is not permitted to use a route:
 * missing key (401), plan does not include the route (402), or key is not allowed to use it (403).
 */
export const EULER_PERMISSION_STATUS_CODES: readonly number[] = [401, 402, 403];

export type EulerFallbackPermissionMessageParams = {
    /** Human description of what was being fetched, e.g. "the Room ID" */
    subject: string;
    /** Name of the exported config object that controls the fallback, e.g. "RoomIdRouteConfig" */
    configName: string;
    /** HTTP status code Euler Stream responded with */
    code: number;
    /** Message Euler Stream returned alongside the status, if any */
    serverMessage?: string;
};

/**
 * Builds the error message shown when the Euler Stream fallback was reached but the caller lacks permission
 * to use it. Tells the user why it happened, how to supply a key if they have one, and how to turn the
 * fallback off if they do not.
 */
export function eulerFallbackPermissionMessage(
    {
        subject,
        configName,
        code,
        serverMessage
    }: EulerFallbackPermissionMessageParams
): string {
    const trimmedServerMessage = serverMessage?.trim().replace(/\.+$/, '');
    const serverNote = trimmedServerMessage ? ` Euler Stream said: "${trimmedServerMessage}".` : '';

    return (
        `Failed to retrieve ${subject} from Euler Stream (https://www.eulerstream.com), which was attempted as a last resort ` +
        `after the TikTok HTML and API lookups failed. Euler Stream responded with HTTP ${code}: ` +
        `this fallback requires an Euler Stream API key on a plan that includes it (a business account).${serverNote} ` +
        `If you have such a key, pass it with the \`signApiKey\` client option or the SIGN_API_KEY environment variable. ` +
        `If you do not have a business account, disable this fallback so the library stops trying it: ` +
        `\`import { ${configName} } from 'tiktok-live-connector'; ${configName}.skipFetchRoomIdFromEulerRoute = true;\` ` +
        `The TikTok lookups listed above will still need to succeed for the request to work.`
    );
}
