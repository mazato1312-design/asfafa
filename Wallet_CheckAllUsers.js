const fs = require('fs');
const path = require('path');
const axios = require("axios");
const client = require('../index');
const { AddBalance } = require('./BankBase');
const { EmbedBuilder } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

const USER_ID_FILE = path.join(__dirname, './Wallet_UserID.txt');
function removeUserIdFromFile(userId) {
    let userIds = ReadUserIds();
    userIds = userIds.filter(id => id !== userId);
    fs.writeFileSync(USER_ID_FILE, userIds.join('\n'), 'utf8');
};

function isMoreThan5Minutes(compareTime) {
    const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
    const [date, time] = thailandTime.split(', ');

    function timeToSeconds(t) {
        const [h, m, s] = t.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    }

    const currentSeconds = timeToSeconds(time);
    const compareSeconds = timeToSeconds(compareTime);

    if (currentSeconds > compareSeconds) {
        return { message: "เกิน 5 นาที" };
    } else {
        return { message: "ยังไม่เกิน 5 นาที" };
    }
};

async function sendEmbedToChannel(userId, amount, name_owner, ServerID) {
    const LoadUpdate = LoadDataUPDATE();
    const Topup_Notify = LoadUpdate?.Channel_Notify_Topup || '';

    const channel = await client.channels.fetch(Topup_Notify).catch(() => null);
    if (!channel) return;

    const user = await client.users.fetch(userId).catch(() => null);
    const avatarURL = user ? user.displayAvatarURL() : null;

    const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
    const [date, time] = thailandTime.split(', ');
    const formattedDate = date.replace(/\//g, '-');

    const normalizeName = name => name.replace(/^(Mr|Ms|Mrs|Dr|นาย|นางสาว|นาง|น.ส.|ด.ช.|ด.ญ.|สาว)\s*/i, '').trim();
    const cleanedName = `${normalizeName(name_owner || 'ด.ช. ไม่ทราบชื่อ'.split(' ')[0])}`;

    const newBalance = AddBalance(userId, amount);
    const embed = new EmbedBuilder()
        .setColor(0x33CC66)
        .setTitle("เติมเงินสำเร็จ [ ผ่านวอเลท ]")
        .setDescription([
                `**ผู้ใช้ :** <@${userId}>`,
                `**จำนวนเงิน :** \`\` ${amount} บาท \`\``,
                `**ผ่านวอเลต :** \`\` ระบบอัตโนมัติ \`\``,
                `**ชำระโดย :** \`\` ${cleanedName} \`\`
            `].join('\n'))
        .setThumbnail(avatarURL)
        .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
    await channel.send({ embeds: [embed] });

    const embed_user = new EmbedBuilder()
        .setColor(0x33CC66)
        .setTitle('คุณเติมเงินสำเร็จ [ ผ่านวอเลท ]')
        .setDescription([
            `**ผู้ใช้ :** <@${userId}>`,
            `**จำนวนเงิน :** \`\` ${amount} บาท \`\``,
            `**ยอดเงินคงเหลือ :** \`\` ${newBalance} บาท \`\``,
            `**ผ่านวอเลต :** \`\` ระบบอัตโนมัติ \`\``,
            `**ชำระโดย :** \`\` ${cleanedName} \`\``,
        ].join('\n'))
        .setThumbnail(avatarURL)
        .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
    await user.send({ embeds: [embed_user] }).catch(() => null);

    const Role_Success = LoadUpdate?.Role_Topup_ID || null;
    const guild = await client.guilds.fetch(ServerID).catch(() => null);
    const member = await guild.members.fetch(user.id).catch(() => null);
    const role = guild.roles.cache.get(Role_Success);
    if (role) {
        await member.roles.add(role).catch(() => null);
    }
};

async function Update_Bank(userId) {
    const LoadUpdate = LoadDataUPDATE();
    const Keys_API_WalletWebhook = LoadUpdate?.keys_Wallet_Webhook || '';
    const [id, ServerID, phone, time, type] = userId.split('?=');
    await new Promise(resolve => setTimeout(resolve, 4000));
    try {
        let Type_M;
        if (type === 'phone') {
            Type_M = phone;
        }
        if (type === 'user') {
            Type_M = id;
        }
        const response = await axios.post('https://chii-bio.shop/getbank', {
            TypeLog: true,
            KeysApi: Keys_API_WalletWebhook,
            TypeCheck: type,
            CustomerID: Type_M
        });
        const transactions = response.data?.data;
        let Amount_Tool = 0;
        let Status = true;
        let name_owner = '';
        if (Array.isArray(transactions)) {
            transactions.forEach(tx => {
                if (tx.success === false) {
                    Amount_Tool += parseFloat(tx.amount);
                    Status = tx.success;
                    name_owner = tx.sender_name;
                }
            });

            if (Status === false) {
                sendEmbedToChannel(id, Amount_Tool.toFixed(2), name_owner, ServerID);
                removeUserIdFromFile(userId);
            }
            const time_t = isMoreThan5Minutes(time);
            if (time_t.message === "เกิน 5 นาที") {
                removeUserIdFromFile(userId);
            }
        }
    } catch (error) {
        const Error_Data = error.response;
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.error(`ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ API (${error.hostname || 'unknown host'}) ได้:`, error.code);
            return;
        }
        if (Error_Data && Error_Data.data && Error_Data.data.message === 'ไม่พบรายการสำหรับคำร้องขอของคุณ หากทำรายการแล้วกรุณารอ 5 - 10 นาที') {
            const time_t = isMoreThan5Minutes(time);
            if (time_t.message === "เกิน 5 นาที") {
                removeUserIdFromFile(userId);
            }
        } else if (Error_Data && Error_Data.data && Error_Data.data.message === 'KeysAPI ไม่ถูกต้อง! 401: Unauthorized') {
            console.log(`เกิดข้อผิดพลาด KeysAPI ไม่ถูกต้อง! 401 Wallet_CheckAllUsers:`, Error_Data.data.message);
        } else if (error?.status === 502) {
            removeUserIdFromFile(userId);
            const user = await client.users.fetch(id).catch(() => null);
            if (user) {
                const avatarURL = user ? user.displayAvatarURL() : null;
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` ระบบเติมเงินนี้เกิดขัดข้อง!!')
                    .setDescription('\`\`\`กรุณาใช้งานระบบอื่นแทนทางเราต้องขออภัยอย่างยิ่ง\`\`\`')
                    .setThumbnail(avatarURL);
                await user.send({ embeds: [embed] }).catch(() => null);
            }
        } else {
            console.error(`เกิดข้อผิดพลาดในการเติมเงิน Wallet_CheckAllUsers`, error);
        }
    }
};

let intervalId = null;
function ReadUserIds() {
    if (!fs.existsSync(USER_ID_FILE)) {
        return [];
    }
    const content = fs.readFileSync(USER_ID_FILE, 'utf8');
    return content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
};

async function CheckAllUsers() {
    const UserIds = ReadUserIds();
    if (UserIds.length === 0) {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        return;
    }

    for (const UserId of UserIds) {
        await Update_Bank(UserId);
    }
};

setInterval(() => {
    const users = ReadUserIds();
    if (users.length > 0 && intervalId === null) {
        intervalId = setInterval(CheckAllUsers, 6000);
    }
}, 6000);