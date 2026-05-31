from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import os

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

async def generate_welcome_card(member_name: str, member_avatar_url: str, member_count: int, welcome_text: str = None, banner_path: str = None, server_ip: str = "AMZCRAFT.TOP:25565"):
    width, height = 450, 200
    img = Image.new('RGB', (width, height), (47, 49, 54))
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
        text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        footer_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
        footer_small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    except:
        title_font = text_font = footer_font = footer_small_font = ImageFont.load_default()
    
    # Avatar (top-right)
    try:
        response = requests.get(member_avatar_url, timeout=5)
        avatar = Image.open(BytesIO(response.content)).resize((80, 80))
        mask = Image.new('L', (80, 80), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 80, 80), fill=255)
        img.paste(avatar, (width - 100, 15), mask)
    except:
        pass
    
    # Title
    draw.text((20, 15), "Welcome to AmzCraft!", fill=(255, 255, 255), font=title_font)
    
    # Welcome text
    if welcome_text:
        y_pos = 45
        for line in welcome_text.split('\n')[:3]:
            if line.strip():
                draw.text((20, y_pos), line, fill=(185, 187, 190), font=text_font)
                y_pos += 22
    
    # Footer banner
    footer_y = height - 60
    draw.rectangle([(0, footer_y), (width, height)], fill=(255, 255, 255))
    
    # Red diagonal stripe
    draw.polygon([(200, footer_y), (240, footer_y), (180, height), (140, height)], fill=(220, 53, 69))
    
    # Footer text
    draw.text((30, footer_y + 8), "AMZCRAFT", fill=(30, 30, 30), font=footer_font)
    draw.text((30, footer_y + 30), server_ip, fill=(82, 153, 31), font=footer_small_font)
    draw.text((width - 120, footer_y + 20), f"Member #{member_count}", fill=(100, 100, 100), font=footer_small_font)
    
    output = BytesIO()
    img.save(output, format='PNG', optimize=True)
    output.seek(0)
    return output
