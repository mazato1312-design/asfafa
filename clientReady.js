const client = require('../index');
const { ApplicationCommandOptionType, ApplicationCommandType } = require('discord.js');

client.once('clientReady', async () => {
    console.log(`\x1b[1m\x1b[32mLOGGED IN AS ${client.user.tag}\x1b[0m`);

    const commands = [
        {
            name: 'application',
            description: '[ 🎬 คำสั่งเปิดหน้าขายแอพพรีเมียม ]',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'channel',
                    description: '[ 💬 ไอดีช่องที่จะเปิดหน้าขายแอพ ]',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                }
            ]
        },
        {
            name: 'setup_home',
            description: '[ 🏡 คำสั่งตั้งค่าระบบหลังบ้าน ]',
            type: ApplicationCommandType.ChatInput,
        },
        {
            name: 'add_point',
            description: '[ 💰 เติมเงิน - เช็คยอดเงิน - ลดเงินลูกค้า ]',
            type: ApplicationCommandType.ChatInput,
        }
    ];

    await client.application.commands.set(commands);
    console.log(`\x1b[34mSUCCESSFULLY!\x1b[0m 彡 INFO :【 STATUS: \x1b[32mLOGIN BOT\x1b[0m, WORKING: \x1b[35mOKAY READY LET'S GO!\x1b[0m 】`);
});