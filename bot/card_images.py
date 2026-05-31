from io import BytesIO
from pathlib import Path

import discord
from PIL import Image, ImageDraw, ImageFont

from bot.embeds import edition_label, server_address


BG = (12, 16, 21)
PANEL = (18, 23, 30)
PANEL_2 = (22, 28, 36)
BORDER = (54, 63, 74)
TEXT = (235, 239, 245)
MUTED = (168, 176, 188)
GREEN = (117, 213, 48)
BLUE = (84, 142, 255)
RED = (239, 68, 68)
YELLOW = (245, 196, 60)


def _font(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    family = "DejaVuSansMono" if mono else "DejaVuSans"
    suffix = "-Bold" if bold else ""
    candidates = [
        f"/usr/share/fonts/truetype/dejavu/{family}{suffix}.ttf",
        f"/usr/share/fonts/dejavu/{family}{suffix}.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


TITLE = _font(36, True)
SUBTITLE = _font(22)
HEADING = _font(25, True)
BODY = _font(22)
BODY_BOLD = _font(22, True)
MONO = _font(23, mono=True)
SMALL = _font(18)
SMALL_BOLD = _font(18, True)


def _measure(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def _card_canvas(width: int, height: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (width, height), (5, 8, 12))
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            edge = int(22 * (1 - min(x / width, 1)))
            top_glow = int(18 * (1 - min(y / height, 1)))
            green_glow = int(18 * max(0, 1 - ((x - 90) ** 2 + (y - 80) ** 2) / 42000))
            pixels[x, y] = (5 + edge, 8 + top_glow + green_glow // 3, 12 + top_glow)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, width - 1, height - 1), radius=18, outline=BORDER, width=1)
    draw.rounded_rectangle((0, 0, 9, height), radius=18, fill=GREEN)
    return img, draw


def _copy_icon(draw: ImageDraw.ImageDraw, x: int, y: int, color=MUTED):
    draw.rounded_rectangle((x + 7, y, x + 23, y + 22), radius=3, outline=color, width=2)
    draw.rounded_rectangle((x, y + 7, x + 16, y + 29), radius=3, outline=color, width=2)


def _address_box(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], address: str):
    draw.rounded_rectangle(box, radius=10, fill=(11, 14, 20), outline=BORDER, width=1)
    draw.text((box[0] + 18, box[1] + 15), address, font=MONO, fill=(160, 237, 90))
    _copy_icon(draw, box[2] - 45, box[1] + 16)


def _icon_badge(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], label: str, fill=(31, 48, 26)):
    draw.rounded_rectangle(box, radius=14, fill=fill, outline=(84, 150, 42), width=2)
    w, h = _measure(draw, label, TITLE)
    draw.text(
        (box[0] + ((box[2] - box[0]) - w) / 2, box[1] + ((box[3] - box[1]) - h) / 2 - 3),
        label,
        font=TITLE,
        fill=TEXT,
    )


def _header(draw: ImageDraw.ImageDraw, width: int, title: str, subtitle: str, icon_text: str):
    _icon_badge(draw, (44, 32, 102, 90), icon_text)
    draw.text((126, 36), title, font=TITLE, fill=TEXT)
    draw.text((126, 78), subtitle, font=SUBTITLE, fill=MUTED)
    draw.line((42, 125, width - 42, 125), fill=(42, 49, 58), width=1)


def render_connect_card(servers: list[dict]) -> discord.File:
    width = 930
    height = 295 if len(servers) <= 2 else 295 + ((len(servers) - 1) // 2) * 145
    img, draw = _card_canvas(width, height)
    _header(draw, width, "AmzCraft Connect", "Choose your edition and copy the matching address.", "A")

    start_x = 42
    start_y = 145
    card_w = 410
    card_h = 105
    gap = 28

    for index, server in enumerate(servers):
        col = index % 2
        row = index // 2
        x = start_x + col * (card_w + gap)
        y = start_y + row * (card_h + 34)
        label = edition_label(server.get("type", "java"))
        icon = "☕" if server.get("type") == "java" else "▣"

        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=12, fill=PANEL, outline=BORDER, width=1)
        draw.rounded_rectangle((x + 18, y + 18, x + 60, y + 60), radius=9, fill=(35, 45, 37), outline=(66, 100, 44), width=1)
        draw.text((x + 27, y + 25), icon, font=BODY_BOLD, fill=TEXT)
        draw.text((x + 78, y + 20), label, font=HEADING, fill=TEXT)
        _address_box(draw, (x + 18, y + 66, x + card_w - 18, y + 102), server_address(server))

    footer_y = height - 42
    draw.text((48, footer_y), "ⓘ", font=BODY, fill=MUTED)
    draw.text((82, footer_y + 2), "Long-press or right-click an address to copy it.", font=SMALL, fill=MUTED)
    return _to_file(img, "amzcraft-connect.png")


def render_status_card(items: list[dict]) -> discord.File:
    width = 930
    height = 365 if len(items) <= 2 else 365 + ((len(items) - 1) // 2) * 190
    img, draw = _card_canvas(width, height)
    _header(draw, width, "AmzCraft Status", "Live health for the configured Minecraft gateways.", "✓")
    draw.rounded_rectangle((775, 36, 885, 76), radius=12, outline=(91, 156, 47), width=2)
    draw.text((800, 45), "⌁ LIVE", font=SMALL_BOLD, fill=(160, 237, 90))

    start_x = 34
    start_y = 145
    card_w = 420
    card_h = 155
    gap = 24

    for index, item in enumerate(items):
        server = item["server"]
        data = item["status"]
        col = index % 2
        row = index // 2
        x = start_x + col * (card_w + gap)
        y = start_y + row * (card_h + 28)
        online = bool(data.get("online"))
        status_color = GREEN if online else RED

        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=12, fill=PANEL, outline=BORDER, width=1)
        icon = "☕" if server.get("type") == "java" else "▣"
        draw.text((x + 20, y + 17), icon, font=BODY_BOLD, fill=TEXT)
        draw.text((x + 55, y + 17), edition_label(server.get("type", "java")), font=HEADING, fill=TEXT)
        draw.ellipse((x + 22, y + 56, x + 39, y + 73), fill=status_color)
        draw.text((x + 50, y + 51), "Online" if online else "Offline", font=BODY, fill=status_color)
        _address_box(draw, (x + 18, y + 86, x + card_w - 18, y + 124), item["address"])

        players = data.get("players", {}) or {}
        version = data.get("version") or "Unknown"
        draw.text((x + 22, y + 133), "Players", font=SMALL, fill=MUTED)
        draw.text((x + 135, y + 133), f"{players.get('online', 0)} / {players.get('max', 0)}", font=SMALL, fill=TEXT)
        draw.text((x + 258, y + 133), "Version", font=SMALL, fill=MUTED)
        draw.text((x + 342, y + 133), str(version), font=SMALL, fill=TEXT)

    footer_y = height - 42
    draw.text((48, footer_y), "⌁", font=BODY, fill=MUTED)
    draw.text((82, footer_y + 2), "Updated from the live status API", font=SMALL, fill=MUTED)
    return _to_file(img, "amzcraft-status.png")


def render_vote_card(links: list[dict]) -> discord.File:
    width = 820
    height = 270 + max(0, len(links) - 1) * 84
    img, draw = _card_canvas(width, height)
    _header(draw, width, "Vote for AmzCraft", "Support the server and claim your reward.", "★")

    y = 150
    for index, link in enumerate(links, 1):
        draw.rounded_rectangle((42, y, 470, y + 72), radius=12, fill=PANEL, outline=BORDER, width=1)
        draw.text((66, y + 18), f"{index}. {link['site_name']}", font=HEADING, fill=(160, 237, 90))
        draw.text((66, y + 47), "Open voting page", font=SMALL, fill=MUTED)

        if link.get("rewards"):
            draw.rounded_rectangle((505, y, 748, y + 72), radius=12, fill=(25, 37, 20), outline=(89, 151, 42), width=1)
            draw.text((535, y + 15), "Reward", font=SMALL, fill=(160, 237, 90))
            draw.text((535, y + 38), str(link["rewards"]), font=HEADING, fill=TEXT)
        y += 86

    footer_y = height - 42
    site_word = "site" if len(links) == 1 else "sites"
    draw.text((48, footer_y), "●", font=SMALL, fill=MUTED)
    draw.text((82, footer_y - 1), f"{len(links)} voting {site_word} available", font=SMALL, fill=MUTED)
    return _to_file(img, "amzcraft-vote.png")


def _to_file(img: Image.Image, filename: str) -> discord.File:
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return discord.File(buffer, filename=filename)
