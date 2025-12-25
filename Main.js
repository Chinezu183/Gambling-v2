from data import load_users, save_users, get_user, ADMINS, antifaliment, check_boost
from games import coinflip, dice, slots, blackjack
import time
import random

# -----------------------------
# Fake WhatsApp connect
# -----------------------------
print("📱 Connecting to WhatsApp...")
time.sleep(1)
print("✅ Conectat!")

# -----------------------------
# Load users
# -----------------------------
users = load_users()
name = input("👤 Nume jucător: ")
user = get_user(users, name)

# -----------------------------
# Daily
# -----------------------------
def daily(user):
    now = int(time.time())
    if now - user["daily"] >= 86400:
        user["balance"] += 500
        user["daily"] = now
        return "🎁 Daily bonus: +500 monede"
    return "⏳ Daily deja luat"

# -----------------------------
# Work
# -----------------------------
def work(user):
    now = int(time.time())
    if now - user["work"] >= 60:
        earn = random.randint(50, 150)
        earn = int(earn * user.get("money_boost", 1))
        user["balance"] += earn
        user["work"] = now
        return f"💼 Ai lucrat și ai câștigat {earn} monede"
    else:
        return "⏳ Work încă în cooldown"

# -----------------------------
# Admin menu
# -----------------------------
def admin_menu(users):
    while True:
        print("""
👮‍♂️ ADMIN PANEL
1️⃣ Oferă monede
2
