"""Generate synthetic wire fixtures with TikTokLiveProto==0.2.2 (Python 3.10+)."""

import base64
import json
from importlib.metadata import version
from pathlib import Path

from TikTokLiveProto.v3.webcast.im import BattleCardMsgType
from TikTokLiveProto.v3.webcast.model import message as messages
from TikTokLiveProto.v3.webcast.model.live import match
from TikTokLiveProto.v3.webcast.shared.message import CommonMessageData

assert version("TikTokLiveProto") == "0.2.2", "Use the pinned schema version."

BATTLE_ID = 7123456789012345678
ANCHOR_ID = 7123456789012345001
TARGET_ID = 7123456789012345002
SENDER_ID = 7123456789012345003
ROOM_ID = 7123456789012345004
COMMON = CommonMessageData(room_id=ROOM_ID, msg_id=7123456789012345005)
SENDER = match.BattleUserInfo(user=match.BattleBaseUserInfo(
    user_id=SENDER_ID, display_id="fixture_sender", nick_name="Fixture Sender"
))
fixtures = []


def add(name, action, payload=None, **expected):
    event = messages.WebcastLinkMicBattleItemCard(
        common=COMMON, battle_id=BATTLE_ID,
        msg_type=BattleCardMsgType(action), **(payload or {})
    )
    fixtures.append({
        "name": name,
        "base64": base64.b64encode(bytes(event)).decode(),
        "expected": {"battleId": str(BATTLE_ID), "msgType": action, **expected},
    })


for field, action, class_name in [
    ("critical_strike", 2, "CriticalStrike"),
    ("smoke", 3, "Smoke"),
    ("extra_time", 5, "ExtraTime"),
    ("special_effect", 6, "SpecialEffect"),
    ("potion", 7, "Potion"),
    ("wave", 8, "Wave"),
    ("top2", 10, "Top2"),
    ("top3", 11, "Top3"),
    ("vault_glove", 12, "VaultGlove"),
]:
    info = dict(
        card_name_key="fixture_" + field, send_time_sec=1789080000,
        send_user=SENDER, effect_last_duration=30,
        effect_time_sec=1789080001, to_anchor_id=TARGET_ID,
    )
    if class_name not in ("Potion", "Wave"):
        info["to_anchor_id_str"] = str(TARGET_ID)
    if class_name in ("Top2", "Top3", "VaultGlove"):
        info = {"common": match.CommonCardInfo(**info)}
    use = dict(
        anchor_id=ANCHOR_ID,
        card_info=getattr(match, class_name + "CardInfo")(**info),
    )
    if class_name == "SpecialEffect":
        use["affected_anchor_pairs"] = [
            messages.AnchorPair(source_anchor_id=ANCHOR_ID, target_anchor_id=TARGET_ID),
            messages.AnchorPair(source_anchor_id=ANCHOR_ID, target_anchor_id=TARGET_ID + 10),
        ]
        use["effect_type"] = 2
    add(field, action, {
        "use_" + field + "_card": getattr(messages, "Use" + class_name + "Card")(**use)
    }, useField="use" + class_name + "Card", anchorId=str(ANCHOR_ID),
        targetId=str(TARGET_ID), senderId=str(SENDER_ID))

add("guide", 1, {"card_obtain_guide": messages.CardObtainGuide(not_in_use=1)})
add("award", 4, {"award_card_notice": messages.AwardCardNotice(awarded_users=[SENDER])})
add("notice", 9, {"special_effect_notice": messages.SpecialEffectNotice(
    from_user_id=SENDER_ID, to_anchor_id=TARGET_ID, score=100
)})
add("unknown", 0)
add("future", 99)
add("missing_sender", 2, {"use_critical_strike_card": messages.UseCriticalStrikeCard(
    anchor_id=ANCHOR_ID, card_info=match.CriticalStrikeCardInfo(to_anchor_id=TARGET_ID)
)})
add("missing_card_info", 2, {"use_critical_strike_card": messages.UseCriticalStrikeCard(
    anchor_id=ANCHOR_ID
)})
add("missing_use_payload", 2)

# Future length-delimited field 127: the Node decoder should skip it and retain known fields.
future_field = dict(fixtures[0], name="unknown_field")
future_field["base64"] = base64.b64encode(
    base64.b64decode(future_field["base64"]) + b"\xfa\x07\x04test"
).decode()
fixtures.append(future_field)

Path(__file__).with_name("messages.json").write_text(json.dumps({
    "schema": "TikTokLiveProto==0.2.2 / v3",
    "synthetic": True,
    "fixtures": fixtures,
}, indent=2) + "\n")
