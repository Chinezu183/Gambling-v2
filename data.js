import fs from "fs"

export const USERS_FILE = "./users.json"

// Lista admini
export const ADMINS = ["admin", "root", "ivan"]

// Load users
export function load_users() {
  if (!fs.existsSync(USERS_FILE)) return {}
  return JSON.parse(fs.readFileSync(USERS_FILE))
}

// Save users
export function save_users(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// Get user, creează dacă nu există
export function get_user(users, name) {
  if (!users[name]) {
    users[name] = {
      balance: Math.floor(Math.random() * 500 + 300),
      xp: 0,
      level: 1,
      daily: 0,
      work: 0,
      antifaliment: 0,
      luck_boost: 0,
      money_boost: 1,
      temp_boost_end: 0
    }
  }
  return users[name]
}
