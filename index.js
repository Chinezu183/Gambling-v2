import makeWASocket,{useMultiFileAuthState,DisconnectReason} from "@whiskeysockets/baileys"
import pino from "pino"
import readline from "readline"
import {load_users, save_users, get_user, ADMINS} from "./data.js"
import {coinflip,dice,slots,blackjack,daily,work,antifaliment,add_xp} from "./games.js"

const PREFIX = "."
const rl = readline.createInterface({input:process.stdin,output:process.stdout})
let askedNumber = false
let users = load_users()

async function startBot(){
  console.log("📱 Pornire bot WhatsApp...")
  const {state, saveCreds} = await useMultiFileAuthState("./auth")
  const sock = makeWASocket({auth:state,logger:pino({level:"silent"}),printQRInTerminal:false})
  sock.ev.on("creds.update",saveCreds)

  if(!state.creds.registered && !askedNumber){
    askedNumber = true
    rl.question("📱 Număr WhatsApp (ex: 40xxxxxxxxx): ",async (num)=>{
      try{
        const code = await sock.requestPairingCode(num.trim())
        console.log("\n🔑 COD DE CONECTARE:",code)
        console.log("👉 WhatsApp → Setări → Dispozitive conectate → Conectare cu cod\n")
      }catch(e){console.log("❌ Eroare pairing:",e.message)}
    })
  }

  sock.ev.on("connection.update",({connection,lastDisconnect})=>{
    if(connection==="open"){console.log("✅ BOT CONECTAT CU SUCCES LA WHATSAPP")}
    if(connection==="close"){
      const reason=lastDisconnect?.error?.output?.statusCode
      if(reason===DisconnectReason.loggedOut){
        console.log("❌ LOGOUT – șterge folderul auth și reconectează manual")
      }else{console.log("⚠️ Conexiune pierdută...")}
    }
  })

  sock.ev.on("messages.upsert",async ({messages})=>{
    const msg=messages[0]
    if(!msg?.message || msg.key.fromMe)return
    const jid=msg.key.remoteJid
    const text=msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    if(!text.startsWith(PREFIX))return
    const cmd=text.slice(1).toLowerCase()

    const user=get_user(users,msg.pushName || jid)

    // ---------------- COMENZI GAMBLING ----------------
    if(cmd.startsWith("coinflip")){
      let parts=text.split(" ")
      let bet=parseInt(parts[1])
      let choice=parts[2]
      await sock.sendMessage(jid,{text:coinflip(user,bet,choice)})
    }
    if(cmd.startsWith("dice")){
      let parts=text.split(" ")
      let bet=parseInt(parts[1])
      let number=parseInt(parts[2])
      await sock.sendMessage(jid,{text:dice(user,bet,number)})
    }
    if(cmd.startsWith("slots")){
      let parts=text.split(" ")
      let bet=parseInt(parts[1])
      await sock.sendMessage(jid,{text:slots(user,bet)})
    }
    if(cmd.startsWith("blackjack")){
      let parts=text.split(" ")
      let bet=parseInt(parts[1])
      await sock.sendMessage(jid,{text:blackjack(user,bet)})
    }
    if(cmd.startsWith("daily")) await sock.sendMessage(jid,{text:daily(user)})
    if(cmd.startsWith("work")) await sock.sendMessage(jid,{text:work(user)})
    let af=antifaliment(user)
    if(af) await sock.sendMessage(jid,{text:af})

    // ---------------- TEST / MENU ----------------
    if(cmd==="ping") await sock.sendMessage(jid,{text:"🏓 Pong! Bot online."})
    if(cmd==="menu") await sock.sendMessage(jid,{
      text:`🎰 FAKE GAMBLING BOT
• .coinflip [bet] [cap/pajura]
• .dice [bet] [1-6]
• .slots [bet]
• .blackjack [bet]
• .daily
• .work
• Admin și boosts integrate`
    })

    save_users(users)
  })
}

startBot()
