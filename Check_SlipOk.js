const fs = require('fs');
const path = require('path');
const jsQR = require("jsqr");
const axios = require("axios");
const sharp = require("sharp");
const { AddBalance } = require('./BankBase');
const { EmbedBuilder } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

const isImage = (url) => {
    const cleanUrl = url.split("?")[0];
    return /\.(png|jpe?g|gif|bmp|webp|jfif)$/i.test(cleanUrl);
};

const BankCodes = {
    '002': 'กรุงเทพ',
    '004': 'กสิกร',
    '006': 'กรุงไทย',
    '011': 'ธนชาต',
    '014': 'ไทยพาณิชย์',
    '025': 'กรุงศรี',
    '069': 'เกียรติ..',
    '022': 'ซีไอเอ็มบี',
    '067': 'ทิสโก้',
    '024': 'ยูโอบี',
    '071': 'ไทยเครดิต',
    '073': 'แลนด์แอนด์..',
    '070': 'ไอซีบีซี',
    '098': 'พัฒนาวิ..',
    '034': 'การเกษตร',
    '035': 'เพื่อการส่ง..',
    '030': 'ออมสิน',
    '033': 'อาคารสง..'
};

async function SaveQrCode(QrCode) {
    const filePath = path.join(__dirname, 'SlipQR.txt');

    let existingData = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        existingData = fileContent.split('\n').filter(line => line.trim() !== '');
    }

    if (!existingData.includes(QrCode)) {
        fs.appendFileSync(filePath, `${QrCode}\n`, 'utf-8')
        return { status: "success", message: 'บันทึกสลิปใหม่ลงในไฟล์แล้ว' }
    } else {
        return { status: "error", message: 'สลิปนี้เคยส่งเข้ามาในระบบแล้ว' }
    }
};

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (message.author.bot) return;

        const LoadUpdate = LoadDataUPDATE();
        const CHENNEL_CHECKSLIP = LoadUpdate?.Channel_SendSlip || 'รอเพิ่ม';

        if (message.channel.id !== CHENNEL_CHECKSLIP) {
            return;
        }

        if (message.attachments.size === 1) {
            const attachment = message.attachments.first();
            const imageUrl = attachment.url;
            if (!isImage(imageUrl)) return;

            try {
                const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const image = await sharp(response.data)
                    .resize({ width: 800, height: 800, fit: 'inside' })
                    .sharpen(2, 1, 0.5)
                    .ensureAlpha()
                    .raw()
                    .toBuffer({ resolveWithObject: true });

                const { data, info } = image;
                const qrCode = jsQR(new Uint8ClampedArray(data), info.width, info.height);
                if (qrCode) {
                    const resSave = await SaveQrCode(qrCode.data);
                    if (resSave?.status === "success") {
                        await CheckSlip(client, message, qrCode.data);
                        return;
                    };
                    if (resSave?.status === "error") {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('\`\`❌\`\` ชำระเงินไม่สำเร็จ')
                            .setDescription('\`\`\`สลิปซ้ำ! สลิปนี้เคยส่งเข้ามาในระบบแล้วห้ามส่งสลิปซ้ำ\`\`\`')
                            .setThumbnail(message.author.displayAvatarURL())
                        await message.reply({ embeds: [embed] });
                    };
                }
            } catch (err) {
                console.error(`เกิดข้อผิดพลาดในการประมวลผลภาพจาก URL`, err);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดในการประมวณผล')
                    .setDescription('\`\`\`การแนบสลิปไม่สำเร็จกรุณาลองใหม่อีกครั้ง\`\`\`')
                    .setThumbnail(message.author.displayAvatarURL())
                await message.reply({ embeds: [embed] });
            }

        } else if (message.attachments.size > 1) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` กรุณาโปรดแนบสลิปทีละ 1 รูปภาพ')
                .setDescription('\`\`\`กรุณาแนบเพียง 1 รูปภาพ ต่อ 1 สลิปเท่านั้น!!\`\`\`')
                .setThumbnail(message.author.displayAvatarURL())
            await message.reply({ embeds: [embed] });
        }
    }
}

async function CheckSlip(client, message, qrString) {
    try {
        const LoadUpdate = LoadDataUPDATE();
        const branchId = LoadUpdate?.Url_Api_SlipOK;
        const ApiKey = LoadUpdate?.Api_Keys_Token;
        const Role_Success = LoadUpdate?.Role_Topup_ID || 'รอเพิ่ม';
        const Topup_Notify = LoadUpdate?.Channel_Notify_Topup || '';

        const NumberAPI = branchId.split('/').pop();

        const Payload = {
            data: qrString,
            log: true
        };
        const headers = {
            "x-authorization": ApiKey,
        };

        const res = await axios.post(`https://api.slipok.com/api/line/apikey/${NumberAPI}`, Payload, { headers });
        const UserID = message.author.id;
        const slipData = res.data.data;
        const amountToAdd = slipData.amount;
        const newBalance = AddBalance(UserID, amountToAdd);

        const embed = new EmbedBuilder()
            .setColor(0x33CC66)
            .setTitle(`คุณเติมเงินสำเร็จ [ พร้อมเพย์ ]`)
            .addFields({ name: `**คุณได้เติมเงิน**`, value: `\`\`\` ${parseFloat(amountToAdd).toFixed(2)} บาท \`\`\``, inline: false })
            .addFields({ name: `**ยอดเงินคงเหลือ**`, value: `\`\`\` ${newBalance} บาท \`\`\``, inline: false })
            .setThumbnail(`${message.author.displayAvatarURL()}`);
        message.channel.send({ embeds: [embed] });

        const sendingBank = slipData.sendingBank || '002';
        const bankAbbreviation = BankCodes[sendingBank];

        const normalizeName = name => name.replace(/^(Mr|Ms|Mrs|Dr|นาย|นางสาว|นาง|น.ส.|ด.ช.|ด.ญ.|สาว)\s*/i, '').trim();
        const cleanedName = `${normalizeName(slipData?.sender?.displayName ?? 'ด.ช. ไม่พบชื่อ'.split(' ')[1])}`;

        const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
        const [date, time] = thailandTime.split(', ');
        const formattedDate = date.replace(/\//g, '-');

        const channelID = message.guild.channels.cache.get(Topup_Notify);
        if (channelID) {
            const Channel_Topup = new EmbedBuilder()
                .setColor(0x33CC66)
                .setTitle("เติมเงินสำเร็จ [ พร้อมเพย์ ]")
                .setDescription([
                    `**ผู้ใช้ :** <@${UserID}>`,
                    `**จำนวนเงิน :** \`\` ${parseFloat(amountToAdd).toFixed(2)} บาท \`\``,
                    `**ผ่านธนาคาร** : \`\` ${bankAbbreviation} \`\``,
                    `**ชำระโดย :** \`\` ${cleanedName} \`\``
                ].join('\n'))
                .setThumbnail(`${message.author.displayAvatarURL()}`)
                .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
            await channelID.send({ embeds: [Channel_Topup] });
        }

        const role = message.guild.roles.cache.get(Role_Success);
        if (role) {
            await message.member.roles.add(role).catch(() => null);
        }

    } catch (err) {
        if (axios.isAxiosError(err)) {
            const errorData = err.response.data;
            let embed = new EmbedBuilder().setColor(0xFF0000).setThumbnail(message.author.displayAvatarURL());
            switch (errorData.code) {
                case 1000:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`กรุณาติดตั้ง node_modules ให้ครบ\`\`\`')
                    break;
                case 1001:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`ไม่พบข้อมูลสาขา กรุณาตรวจสอบไอดีสาขา\`\`\`')
                    break;
                case 1002:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`คุณกรอกที่อยู่ API เช็คสลิปไม่ถูกต้อง!\`\`\`')
                    break;
                case 1003:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`Package ของคุณหมดอายุแล้วกรุณาต่อแพ็กเก็จ\`\`\`')
                    break;
                case 1005:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`กรุณาอัพโหลดไฟล์ภาพเฉพาะนามสกุล .jpg .jpeg หรือ .png\`\`\`')
                    break;
                case 1006:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`รูปภาพไม่ถูกต้อง\`\`\`')
                    break;
                case 1007:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`รูปภาพไม่มี QR Code กรุณาลองตัดรูปภาพให้เหลือแค่ QR Code\`\`\`')
                    break;
                case 1008:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`QR ดังกล่าวไม่ใช่ QR สำหรับการตรวจสอบการชำระเงิน\`\`\`')
                    break;
                case 1009:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`ขณะนี้ข้อมูลธนาคารเกิดขัดข้องชั่วคราว\`\`\`')
                    break;
                case 1010:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`เนื่องจากเป็นสลิปจากธนาคาร รอการตรวจสอบสลิปหลังการโอน\`\`\`')
                    break;
                case 1011:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`QR Code หมดอายุ หรือ ไม่มีรายการอยู่จริง\`\`\`')
                    break;
                case 1012:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`สลิปซ้ำ สลิปนี้เคยส่งเข้ามาในระบบแล้ว\`\`\`')
                    break;
                case 1013:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`ยอดที่ส่งมาไม่ตรงกับยอดสลิป\`\`\`')
                    break;
                case 1014:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`บัญชีผู้รับไม่ตรงกับบัญชีหลักของเรา\`\`\`')
                    break;
                default:
                    embed.setTitle('\`\`❌\`\` การชำระเงินไม่สำเร็จ!');
                    embed.setDescription('\`\`\`เกิดข้อผิดพลาดบางอย่าง Unknown\`\`\`')
            }
            message.channel.send({ embeds: [embed] });
            return;
        } else {
            console.log('Error Check Slip', err);
        }
    }
};