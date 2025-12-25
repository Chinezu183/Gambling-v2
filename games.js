import random from "random"
import time from "node:timers/promises"

// ---------------- XP & Level ----------------
export function add_xp(user, amount) {
  user.xp += amount
  if (user.xp >= user.level * 100) {
    user.xp = 0
    user.level += 1
    console.log("🆙 Level up!")
    // Boost permanent la level
    user.money_boost += 0.1
    user.luck_boost += 5
  }
}

// ---------------- AntiFrauda ----------------
export function antifrauda(user, bet) {
  if (bet <= 0) {
    console.log("❌ Bet invalid")
    return false
  }
  if (bet > user.balance) {
    console.log("⛔ Nu ai suficiente monede")
    return false
  }
  return true
}

// ---------------- CoinFlip ----------------
export function coinflip(user, bet, choice) {
  if (!antifrauda(user, bet)) return
  let result = random.choice(["cap", "pajura"])
  let chance = Math.random() * 100
  if (chance < user.luck_boost) result = choice
  if (choice === result) {
    let gain = Math.floor(bet * user.money_boost)
    user.balance += gain
    add_xp(user, 10)
    return `✅ A ieșit ${result}. Ai câștigat ${gain} monede!`
  } else {
    user.balance -= bet
    return `❌ A ieșit ${result}. Ai pierdut!`
  }
}

// ---------------- Dice ----------------
export function dice(user, bet, number) {
  if (!antifrauda(user, bet)) return
  let roll = Math.floor(Math.random() * 6) + 1
  let chance = Math.random() * 100
  if (chance < user.luck_boost) roll = number
  if (roll === number) {
    let gain = Math.floor(bet * 5 * user.money_boost)
    user.balance += gain
    add_xp(user, 25)
    return `🎲 Zar: ${roll}. Jackpot! Ai câștigat ${gain} monede`
  } else {
    user.balance -= bet
    return `🎲 Zar: ${roll}. Ai pierdut!`
  }
}

// ---------------- Slots ----------------
export function slots(user, bet) {
  if (!antifrauda(user, bet)) return
  const symbols = ["🍒", "🍋", "⭐", "💎"]
  const spin = [symbols[Math.floor(Math.random()*4)], symbols[Math.floor(Math.random()*4)], symbols[Math.floor(Math.random()*4)]]
  let chance = Math.random() * 100
  if (chance < user.luck_boost) {
    let s = symbols[Math.floor(Math.random()*4)]
    spin[0] = s; spin[1] = s; spin[2] = s
  }
  if (spin[0] === spin[1] && spin[1] === spin[2]) {
    let gain = Math.floor(bet * 10 * user.money_boost)
    user.balance += gain
    add_xp(user, 50)
    return `${spin} 🎰 MEGA WIN! Ai câștigat ${gain} monede!`
  } else {
    user.balance -= bet
    return `${spin} 🎰 Pierdere!`
  }
}

// ---------------- Blackjack ----------------
const cards = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":10,"Q":10,"K":10,"A":11}

function hand_value(hand){
  let value = hand.reduce((a,c)=>a+cards[c],0)
  let aces = hand.filter(x=>"A"===x).length
  while(value>21 && aces>0){value-=10; aces--}
  return value
}

export function blackjack(user, bet) {
  if (!antifrauda(user, bet)) return
  let deck = Object.keys(cards).flatMap(x=>[x,x,x,x])
  deck.sort(()=>Math.random()-0.5)

  let player = [deck.pop(), deck.pop()]
  let dealer = [deck.pop(), deck.pop()]

  while(true){
    if(hand_value(player)>21){user.balance-=bet; return "❌ Bust! Ai pierdut."}
    break
  }

  while(hand_value(dealer)<17) dealer.push(deck.pop())
  let pv = hand_value(player), dv = hand_value(dealer)
  if(dv>21 || pv>dv){user.balance+=bet; return "✅ Ai câștigat!"}
  else if(pv===dv) return "➖ Egal"
  else{user.balance-=bet; return "❌ Dealerul câștigă."}
}

// ---------------- Daily ----------------
export function daily(user){
  const now = Math.floor(Date.now()/1000)
  if(now - user.daily >= 86400){
    user.balance += 500
    user.daily = now
    return "🎁 Daily bonus: +500 monede"
  }
  return "⏳ Daily deja luat"
}

// ---------------- Work ----------------
export function work(user){
  const now = Math.floor(Date.now()/1000)
  if(now - user.work >= 60){
    let gain = Math.floor(Math.random()*100+50)
    user.balance += gain
    user.work = now
    return `💼 Ai muncit și ai câștigat ${gain} monede`
  }
  return "⏳ Trebuie să aștepți 1 minut între work"
}

// ---------------- Antifaliment ----------------
export function antifaliment(user){
  const now = Math.floor(Date.now()/1000)
  if(user.balance <= 0 && now - user.antifaliment >= 86400){
    user.balance += 300
    user.antifaliment = now
    return "💵 Ai primit +300 monede (antifaliment)"
  }
  return null
}
