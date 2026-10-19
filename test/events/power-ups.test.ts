import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    BaseProtoMessage,
    ControlEvent,
    ProtoMessageFetchResult,
    TikTokLiveConnection,
    WebcastDeserializeConfig,
    WebcastEvent,
    WebcastLikeMessage,
    WebcastLinkMicBattleItemCard,
    createBaseWebcastPushFrame,
    deserializeWebSocketMessage
} from '@/index';
import fixtureData from '../fixtures/power-ups/messages.json';

const METHOD = 'WebcastLinkMicBattleItemCard';
const ROOM_ID = '7123456789012345004';
const originalConfig = { ...WebcastDeserializeConfig };

type UseField = Extract<keyof WebcastLinkMicBattleItemCard, `use${string}Card`>;
type Fixture = {
    name: string;
    base64: string;
    expected: {
        battleId: string;
        msgType: number;
        useField?: UseField;
        anchorId?: string;
        targetId?: string;
        senderId?: string;
    };
};
const fixtures = fixtureData.fixtures as Fixture[];

class ModernReplayClient extends TikTokLiveConnection {
    replay(response: ProtoMessageFetchResult) {
        return this.processProtoMessageFetchResult(response);
    }
}

function message(method: string, payload: Uint8Array): BaseProtoMessage {
    return { ...BaseProtoMessage.decode(new Uint8Array()), method, payload: Buffer.from(payload) };
}

async function frame(messages: BaseProtoMessage[], compressed = true) {
    const response = { ...ProtoMessageFetchResult.decode(new Uint8Array()), messages };
    const payload = Buffer.from(ProtoMessageFetchResult.encode(response).finish());
    const decoded = await deserializeWebSocketMessage(createBaseWebcastPushFrame({
        payload: compressed ? gzipSync(payload) : payload
    }).finish());
    expect(decoded.protoMessageFetchResult).toBeDefined();
    return decoded.protoMessageFetchResult!;
}

afterEach(() => {
    Object.assign(WebcastDeserializeConfig, originalConfig);
});

describe('Power-Up events', () => {
    it.each(fixtures)('decodes and emits the Python $name fixture once', async fixture => {
        const client = new ModernReplayClient('fixture_host', {});
        const onCard = vi.fn();
        const onDecoded = vi.fn();
        const onError = vi.fn();
        client.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, onCard);
        client.on(ControlEvent.DECODED_DATA, onDecoded);
        client.on(ControlEvent.ERROR, onError);

        const payload = Buffer.from(fixture.base64, 'base64');
        await client.replay(await frame([message(METHOD, payload)]));

        expect(onError).not.toHaveBeenCalled();
        expect(onCard).toHaveBeenCalledTimes(1);
        expect(onDecoded).toHaveBeenCalledTimes(1);
        const event = onCard.mock.calls[0][0] as WebcastLinkMicBattleItemCard;
        expect(event.battleId).toBe(fixture.expected.battleId);
        expect(event.msgType).toBe(fixture.expected.msgType);

        expect(event.common?.roomId).toBe(ROOM_ID);

        const { useField, anchorId, targetId, senderId } = fixture.expected;
        if (useField) {
            const use = event[useField];
            expect(use?.anchorId).toBe(anchorId);
            const card = use?.cardInfo;
            const info = card && ('common' in card ? card.common : card);
            expect(info?.toAnchorId).toBe(targetId);
            expect(info?.sendUser?.user).toMatchObject({
                userId: senderId, displayId: 'fixture_sender', nickName: 'Fixture Sender'
            });
            expect(info?.sendTimeSec).toBe('1789080000');
            expect(info?.effectTimeSec).toBe('1789080001');
            expect(info?.effectLastDuration).toBe('30');
            if (info && 'toAnchorIdStr' in info) expect(info.toAnchorIdStr).toBe(targetId);
        }

        if (fixture.name === 'special_effect') {
            expect(event.useSpecialEffectCard?.affectedAnchorPairs).toEqual([
                { sourceAnchorId: anchorId, targetAnchorId: targetId },
                { sourceAnchorId: anchorId, targetAnchorId: '7123456789012345012' }
            ]);
        }
        if (fixture.name === 'guide') expect(event.cardObtainGuide?.notInUse).toBe(1);
        if (fixture.name === 'award') {
            expect(event.awardCardNotice?.awardedUsers[0]?.user?.userId).toBe('7123456789012345003');
        }
        if (fixture.name === 'notice') {
            expect(event.specialEffectNotice).toMatchObject({
                fromUserId: '7123456789012345003', toAnchorId: '7123456789012345002', score: '100'
            });
        }
        if (fixture.name === 'missing_sender') {
            expect(event.useCriticalStrikeCard?.cardInfo?.sendUser).toBeUndefined();
        }
        if (fixture.name === 'missing_card_info') {
            expect(event.useCriticalStrikeCard?.cardInfo).toBeUndefined();
        }
        if (fixture.name === 'missing_use_payload') expect(event.useCriticalStrikeCard).toBeUndefined();
    });

    it.each([
        { name: 'skip', include: null, skip: [METHOD], count: 0 },
        { name: 'include another message', include: ['WebcastLikeMessage'], skip: [], count: 0 },
        { name: 'include takes precedence', include: [METHOD], skip: [METHOD], count: 1 }
    ] as const)('respects $name filters', async ({ include, skip, count }) => {
        WebcastDeserializeConfig.includeMessageTypes = include && [...include];
        WebcastDeserializeConfig.skipMessageTypes = [...skip];
        const client = new ModernReplayClient('fixture_host', {});
        const onCard = vi.fn();
        client.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, onCard);
        const response = await frame([message(METHOD, Buffer.from(fixtures[0].base64, 'base64'))]);
        await client.replay(response);
        expect(onCard).toHaveBeenCalledTimes(count);
    });

    it('does not emit a card event after a decode failure', async () => {
        const client = new ModernReplayClient('fixture_host', {});
        const onCard = vi.fn();
        client.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, onCard);
        const response = await frame([message(METHOD, new Uint8Array([0x2a, 0xff]))]);
        expect(response.messages[0].decodeError).toBeDefined();
        await client.replay(response);
        expect(onCard).not.toHaveBeenCalled();
    });

    it('preserves other events in an uncompressed batch', async () => {
        const client = new ModernReplayClient('fixture_host', {});
        const onCard = vi.fn();
        const onLike = vi.fn();
        client.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, onCard);
        client.on(WebcastEvent.LIKE, onLike);
        const like = { ...WebcastLikeMessage.decode(new Uint8Array()), count: 3 };
        await client.replay(await frame([
            message(METHOD, Buffer.from(fixtures[0].base64, 'base64')),
            message('WebcastLikeMessage', WebcastLikeMessage.encode(like).finish())
        ], false));
        expect(onCard).toHaveBeenCalledTimes(1);
        expect(onLike).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ count: 3 }));
    });
});
