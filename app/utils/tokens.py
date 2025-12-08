import re
from jinja2 import Template, Environment, select_autoescape

def render_template(text: str, user_mention: str = "", user_name: str = "", guild_name: str = "", channels: dict = None, everyone: bool = False, here: bool = False):
    """Replace tokens in text: {user_mention}, {user_name}, {guild_name}, {channel:#rules}, {everyone}, {here}"""
    if not text:
        return text
    
    # Simple token replacement for safety
    text = text.replace("{user_mention}", user_mention)
    text = text.replace("{user_name}", user_name)
    text = text.replace("{guild_name}", guild_name)
    text = text.replace("{everyone}", "@everyone" if everyone else "")
    text = text.replace("{here}", "@here" if here else "")
    
    if channels:
        for name, mention in channels.items():
            text = text.replace(f"{{channel:{name}}}", mention)
    
    return text

def render_jinja_template(template_str: str, context: dict) -> str:
    """Advanced Jinja2 templating with safe environment"""
    env = Environment(autoescape=select_autoescape())
    template = env.from_string(template_str)
    return template.render(**context)
