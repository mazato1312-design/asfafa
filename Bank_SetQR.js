const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const client = require('../index');
const moment = require('moment-timezone');
const generatePayload = require('promptpay-qr');
const { TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

const QR_FOLDER = path.join(__dirname, 'A_A Uploads');
client.on('interactionCreate', async interaction => {
    try {
        const Price_Min = LoadDataUPDATE()?.Topup_RimitMin || '5';
        if (interaction.isStringSelectMenu() && interaction.customId === 'teram_topup') {
            const selectedValue = interaction.values[0];

            if (selectedValue === 'reset_memubank') {
                await interaction.update({ withResponse: true });
                return;
            }

            if (selectedValue === 'เติมสแกนจ่าย') {
                const modal_promtpay = new ModalBuilder()
                    .setCustomId('promptpay_modal')
                    .setTitle('เติมเงินผ่านพร้อมเพย์')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('promptpay')
                                .setLabel('จำนวนเงินที่ต้องการเติม')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(`เติมเงินขั้นต่ำ ${Price_Min} บาท`)
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal_promtpay);
            }
        }
    } catch (error) {
        console.error('Modals Bank Error Bank_SetQR', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'promptpay_modal') {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const DATE_BASE = LoadDataUPDATE();
            const Price_Min = DATE_BASE?.Topup_RimitMin || '5';
            const amountString = interaction.fields.getTextInputValue('promptpay');
            const amount = parseFloat(amountString);

            if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กรุณาระบุจำนวนเงินเป็นตัวเลขเท่านั้น!!')
                    .setDescription('\`\`\`ห้ามป้อนเครื่องหมายที่ไม่ใช่จำนวนตัวเลข\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.editReply({ embeds: [embed] });
            }

            if (amount < Price_Min) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF3300)
                    .setTitle(`\`\`❌\`\` กรุณาระบุจำนวนเงินตามที่กำหนด`)
                    .setDescription(`\`\`\`เรามีการกำหนดเติมเงินขั้นต่ำ ${Price_Min} บาท\`\`\``)
                    .setThumbnail(interaction.user.displayAvatarURL());
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const serverID = interaction.guild.id;
            const Phone_Number = DATE_BASE?.Phone_Promtpay || '4';
            const Channel_check = DATE_BASE?.Channel_SendSlip || 'รอเพิ่ม';

            const payload = generatePayload(Phone_Number, { amount });
            const qrImagePath = path.join(QR_FOLDER, `qr_${interaction.user.id}.png`);
            await QRCode.toFile(qrImagePath, payload);

            const UnixTime = DATE_BASE?.Time_CheckSlip || '5';
            const Role_checkTimeID = DATE_BASE?.Role_CheckSlip;

            if (!Role_checkTimeID) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กรุณาเพิ่ม ID ยศสำหรับเช็คสลิปก่อน!!')
                    .setDescription('\`\`\`จะสามารถทำรายการนี้ได้ในต่อเมื่อเพิ่มยศ\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.editReply({ embeds: [embed] });
            }

            const CountdownDuration = UnixTime * 60;
            const CurrentUnixTime = moment().tz('Asia/Bangkok').unix();
            const TargetTime = CurrentUnixTime + CountdownDuration;

            const role = interaction.guild.roles.cache.get(Role_checkTimeID);
            try {
                if (role) {
                    await interaction.member.roles.add(role);
                }
            } catch (error) {
                if (error.code === 50013) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` ตอนนี้ไม่สามารถทำรายการนี้ได้!!')
                        .setDescription('\`\`\`กรุณาปรับบทบาทบอทให้สูงกว่ายศเช็คสลิปก่อน!\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    return await interaction.editReply({ embeds: [embed] });
                } else {
                    console.error('Add ROLE ERROR Bank_SetQR', error);
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` กรุณาเพิ่ม ID ยศสำหรับเช็คสลิปให้ถูกต้อง!!')
                        .setDescription('\`\`\`จะสามารถทำรายการนี้ได้ในต่อเมื่อยศเช็คสลิปถูกต้อง\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    return await interaction.editReply({ embeds: [embed] });
                }
            }
            const bgWidth = 1000;
            const bgHeight = 800;
            const qrSize = 500;

            const qrRawBuffer = await QRCode.toBuffer(payload, {
                color: {
                    dark: '#000000',
                    light: '#0000'
                },
                width: 500
            });

            const resizedQRBuffer = await sharp(qrRawBuffer)
                .resize(qrSize, qrSize)
                .toBuffer();

            const BackgroundPath = path.join(__dirname, './A_A Uploads/QrCode_Background.png');
            const ResizedImagePath = path.join(QR_FOLDER, `qr_${interaction.user.id}.png`);

            await sharp(BackgroundPath)
                .resize(bgWidth, bgHeight)
                .composite([
                    {
                        input: resizedQRBuffer,
                        top: Math.floor((bgHeight - qrSize) / 2),
                        left: Math.floor((bgWidth - qrSize) / 2)
                    }
                ])
                .png()
                .toFile(ResizedImagePath);

            const attachment = new AttachmentBuilder(ResizedImagePath);
            const embed = new EmbedBuilder()
                .setColor(0x01e7ff)
                .setTitle("เติมเงินผ่านพ้อมเพย์ธนาคาร")
                .addFields({ name: `กรุณาชำระภายใน ${UnixTime} นาที`, value: `_ _` })
                .addFields({ name: `เหลือเวลาอีก...`, value: `_ _` })
                .addFields({ name: "จำนวนเงินที่ต้องชำระ", value: `\`\`\` ${amount}.00 บาท \`\`\`` })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage(`attachment://${path.basename(ResizedImagePath)}`)
                .setFooter({ text: "สแกนคิวอาร์โค้ด・บันทึกรูปภาพไปสแกน" })

            const selectprompay = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${serverID}/${Channel_check}`)
                        .setLabel('✅ โอนแล้วกรุณาแนบสลิปที่นี่')
                        .setStyle(ButtonStyle.Link)
                );
            await interaction.editReply({ embeds: [embed], components: [selectprompay], files: [attachment] });
            fs.unlinkSync(ResizedImagePath);

            const interval = setInterval(async () => {
                const now = moment().tz('Asia/Bangkok').unix();
                const timeLeftInSeconds = TargetTime - now;
                if (timeLeftInSeconds <= 0) {
                    clearInterval(interval);
                    interaction.member.roles.remove(role).catch(err => { });
                    await interaction.deleteReply();
                    return;
                }

                const minutes = Math.floor(timeLeftInSeconds / 60);
                const seconds = timeLeftInSeconds % 60;
                const updatedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(1, 1, { name: `เหลือเวลาอีก ${minutes} นาที ${seconds < 10 ? '0' : ''}${seconds} วินาที`, value: `_ _` });
                interaction.editReply({ embeds: [updatedEmbed] })
                    .catch(err => {
                        clearInterval(interval);
                    });
            }, 1000);

        } catch (error) {
            console.error('Error isModalSubmit Bank_SetQR', error);
        }
    }
});