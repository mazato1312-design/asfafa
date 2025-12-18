const fs = require('fs');
const path = require('path');
const axios = require("axios");
const client = require('../index');
const { TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

function SaveUserIDToFile(filename, UserID) {
    const [id, ServerID, phone, time, type] = UserID.split('?=');
    const filePath = path.join(__dirname, filename);
    let fileContent = '';
    if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
    }
    const UserIDs = fileContent.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    let updated = false;
    const newUserIDs = UserIDs.map(line => {
        const [existingId, existingTime] = line.split('?=');
        if (existingId === id) {
            updated = true;
            return `${id}?=${ServerID}?=${phone}?=${time}?=${type}`
        }
        return line;
    });

    if (!updated) {
        newUserIDs.push(UserID);
    }
    fs.writeFileSync(filePath, newUserIDs.join('\n') + '\n', 'utf8');
}

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'teram_topup') {
            const DataUPDATE = LoadDataUPDATE();
            const selectedValue = interaction.values[0];
            if (selectedValue === 'เติมเบอร์ทรูมันนี่') {
                await axios.get('https://chii-bio.shop/');
                const modal_promtpay = new ModalBuilder()
                    .setCustomId('truewallet_modal')
                    .setTitle('เติมผ่านทรูมันนี่วอเลต')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('truewallet_amount')
                                .setLabel('จำนวนเงินที่ต้องการเติม')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(`เติมเงินขั้นต่ำ ${DataUPDATE?.wallet_remit_amount || "5"} บาท`)
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal_promtpay);
            }
        }
    } catch (error) {
        if (error?.status === 502) {
            const embed4 = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` ระบบเติมเงินนี้เกิดขัดข้อง!!')
                .setDescription('\`\`\`กรุณาใช้งานระบบอื่นแทนทางเราต้องขออภัยอย่างยิ่ง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed4], flags: MessageFlags.Ephemeral });
        } else {
            console.error('Modals Error Wallet_Webhook', error);
        }
    }
});

const Embed_Webhook = (interaction, amountFormatted, DataWallet) => {
    const embed = new EmbedBuilder()
        .setColor(0x01e7ff)
        .setTitle("เติมผ่านทรูมันนี่วอเลต [ แบบลิงค์ ]")
        .setDescription(`\`\`\`🕒 กรุณาชำระเงินภายใน 5 นาที\`\`\``)
        .addFields({ name: "จำนวนเงินที่ต้องชำระ", value: `\`\`\` ${amountFormatted} บาท \`\`\`` })
        .addFields({ name: `กดที่ปุ่มลิงค์เพื่อชำระได้เลย`, value: `\`\`\`โอนแล้วยอดเงินจะเข้าระบบทันที\`\`\`` })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setImage(`https://s14.gifyu.com/images/bK98c.png`)
        .setFooter({ text: "[💬] ชำระเงิน・กดที่ปุ่มลิงค์ด้านล่าง" })

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setURL(`${DataWallet || 'https://discord.com'}`)
                .setLabel('🍀︲ลิงค์ชำระเงินรวดเร็ว︲')
                .setStyle(ButtonStyle.Link)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`phonesend_wallet?${amountFormatted}`)
                .setLabel('📞︲เลือกใช้เบอร์ชำระเงินแทน︲')
                .setStyle(ButtonStyle.Success)
        );

    return { embed, row };
}


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'truewallet_modal') {
        const LoadUpdate = LoadDataUPDATE();
        const Phone_Wallet_Webhook = LoadUpdate?.Phone_Wallet_Webhook || '0123';
        const Keys_CreateLink_Wallet = LoadUpdate?.Keys_CreateLink_Wallet || '123456';
        const Wallet_remit_amount = LoadUpdate?.wallet_remit_amount || "5";

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const AmountString = interaction.fields.getTextInputValue('truewallet_amount');
        try {
            await axios.get('https://chii-bio.shop/');
        } catch (err) {
                const embed4 = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` ระบบเติมเงินนี้เกิดขัดข้อง!!')
                    .setDescription('\`\`\`กรุณาใช้งานระบบอื่นแทนทางเราต้องขออภัยอย่างยิ่ง\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.editReply({ embeds: [embed4] });
        }
        try {
            const amount = parseFloat(AmountString);
            const amountFormatted = amount.toFixed(2);
            if (!/^\d+(\.\d{1,2})?$/.test(AmountString)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กรุณาระบุจำนวนเงินเป็นตัวเลขเท่านั้น!!')
                    .setDescription('\`\`\`ห้ามป้อนเครื่องหมายที่ไม่ใช่จำนวนตัวเลข\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.editReply({ embeds: [embed] });
            }

            if (amount < Wallet_remit_amount) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF3300)
                    .setTitle(`\`\`❌\`\` กรุณาระบุจำนวนเงินตามที่กำหนด`)
                    .setDescription(`\`\`\`เรามีการกำหนดเติมเงินขั้นต่ำ ${Wallet_remit_amount} บาท\`\`\``)
                    .setThumbnail(interaction.user.displayAvatarURL());
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const response = await axios.post(
                'https://apis.truemoneyservices.com/utils/v1/transfer-link-generator',
                {
                    mobile_number: Phone_Wallet_Webhook,
                    amount: amountFormatted,
                    message: interaction.user.id
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Keys_CreateLink_Wallet}`
                    }
                }
            );
            const DataWallet = response?.data?.data?.url;
            const now = new Date();
            const thailandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
            thailandTime.setMinutes(thailandTime.getMinutes() + 3);
            const formattedThailandTime = thailandTime.toLocaleString('en-GB', { hour12: false });
            const [date, time] = formattedThailandTime.split(', ');

            const { embed, row } = Embed_Webhook(interaction, amountFormatted, DataWallet);
            await interaction.editReply({ embeds: [embed], components: [row] });
            SaveUserIDToFile('Wallet_UserID.txt', `${interaction.user.id}?=${interaction.guild.id}?=X000000000?=${time}?=user`);

        } catch (error) {
            const StatusCode = error.response?.status;
            const ApiError = error.response?.data;

            switch (StatusCode) {
                case 400:
                    if (ApiError?.err?.includes("Invalid mobile number format. It should be in 10 digits.")) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('\`\`❌\`\` กรุณาระบุเบอร์โทรรันเงินให้ถูกต้อง!!')
                            .setDescription('\`\`\`เบอร์โทเค็นผู้รับเงินทรูวอเลตต้องเป็นตัวเลข 10 หลักเท่านั้น\`\`\`')
                            .setThumbnail(interaction.user.displayAvatarURL());
                        return await interaction.editReply({ embeds: [embed] });
                    } else if (ApiError?.err?.includes("amount")) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('\`\`❌\`\` ป้อนจำนวนเงินที่ชำระไม่ถูกต้อง!!')
                            .setDescription('\`\`\`ต้องเป็นตัวเลขเท่านั้น เติมสูงสุดไม่เกิน 5 หมื่นบาท\`\`\`')
                            .setThumbnail(interaction.user.displayAvatarURL());
                        return await interaction.editReply({ embeds: [embed] });
                    } else if (ApiError?.err?.includes("Text out of range. It should be less than or equal to 140 characters.")) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('\`\`❌\`\` กำหนดข้อความชำระเงินผิดพลาด!!')
                            .setDescription('\`\`\`ข้อความชำระเงินต้องไม่เกิน 140 ตัวอักษรเท่านั้น\`\`\`')
                            .setThumbnail(interaction.user.displayAvatarURL());
                        return await interaction.editReply({ embeds: [embed] });
                    } else {
                        console.error("Error isModalSubmit Wallet_Webhook", error);
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดทางระบบ!!')
                            .setDescription('\`\`\`ระบบชำระเงินเกิดขัดข้องกรุณาลองใหม่ภายหลัง\`\`\`')
                            .setThumbnail(interaction.user.displayAvatarURL());
                        await interaction.editReply({ embeds: [embed] });
                    }
                    break;

                case 401:
                    const embed1 = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการระบุโทเค็น!!')
                        .setDescription('\`\`\`กรุณาป้อนโทเค็นชำระเงินทรูมันนี่วอเลตให้ถูกต้อง\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    await interaction.editReply({ embeds: [embed1] });
                    break;

                case 403:
                    const embed2 = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการใช้ API!!')
                        .setDescription('\`\`\`คุณยังไม่ได้รับอนุญาตให้ใช้งาน API นี้\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    await interaction.editReply({ embeds: [embed2] });
                    break;

                case 429:
                    const embed3 = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` การชำระเงินผิดพลาด!!')
                        .setDescription('\`\`\`คุณเรียกใช้งานระบบเติมเงินบ่อยเกินไปกรุณารอสักครู่\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    await interaction.editReply({ embeds: [embed3] });
                    break;

                case 500:
                    const embed4 = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดทางระบบ!!')
                        .setDescription('\`\`\`ระบบชำระเงินขาดการเชื่อมต่อกรุณาลองใหม่ภายหลัง\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    await interaction.editReply({ embeds: [embed4] });
                    break;

                default:
                    const embed5 = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดไม่รู้สาเหตุ!!')
                        .setDescription('\`\`\`ระบบชำระเงินผิดพลาดเล็กน้อยกรุณาลองใหม่ภายหลัง\`\`\`')
                        .setThumbnail(interaction.user.displayAvatarURL());
                    await interaction.editReply({ embeds: [embed5] });
                    console.error("Error isModalSubmit Wallet_Webhook", error.message || ApiError?.err);
                    break;
            }
            return null;
        }
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId.startsWith('phonesend_wallet?')) {
            const amountFormatted = interaction.customId.split('?')[1];
            const modal_promtpay = new ModalBuilder()
                .setCustomId(`phonew_modal?${amountFormatted}`)
                .setTitle('เติมผ่านทรูมันนี่วอเลตผ่านเบอร์')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('truewallet_phone_amount')
                            .setLabel('[ 📞เบอร์ทรูวอเลตของคุณที่จะใช้ชำระ ]')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(`ตัวอย่าง 0641234567`)
                            .setRequired(true)
                    )
                );
            await interaction.showModal(modal_promtpay);
        }
    } catch (error) {
        console.error('Modals Error Wallet_Webhook', error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isModalSubmit() && interaction.customId.startsWith('phonew_modal?')) {
            const LoadUpdate = LoadDataUPDATE();
            const Phone_send = interaction.fields.getTextInputValue('truewallet_phone_amount');
            const amountFormatted = interaction.customId.split('?')[1];
            const Topup_Notify = LoadUpdate?.Channel_Notify_Topup || '';
            const Phone_Wallet_Webhook = LoadUpdate?.Phone_Wallet_Webhook || 'รอเพิ่ม';

            if (!/^\d+$/.test(Phone_send)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` เบอร์ผู้ชำระต้องเป็นตัวเลขเท่านั้น!!')
                    .setDescription('\`\`\`ตัวอย่าง 0641234567\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            if (!/^\d{10}$/.test(Phone_send)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` เบอร์ผู้ชำระต้อง 10 หลักเท่านั้น!!')
                    .setDescription('\`\`\`ป้อนเบอร์ผู้ชำระให้ถูกต้อง เบอร์จริงต้องมี 10 หลักเท่านั้น\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            const now = new Date();
            const thailandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
            thailandTime.setMinutes(thailandTime.getMinutes() + 5);
            const formattedThailandTime = thailandTime.toLocaleString('en-GB', { hour12: false });
            const [date, time] = formattedThailandTime.split(', ');

            await axios.get('https://chii-bio.shop/');

            const UpdatedEmbed = new EmbedBuilder()
                .setColor(0x01e7ff)
                .setTitle("เติมผ่านทรูมันนี่วอเลต [ แบบเบอร์ ]")
                .setDescription(`\`\`\`🕒 กรุณาชำระเงินภายใน 5 นาที\`\`\``)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage(`https://s14.gifyu.com/images/bK98c.png`)
                .setFooter({ text: "[💬] ชำระเงิน・โอนแล้วยอดเงินจะเข้าระบบทันที" })
                .addFields(
                    { name: `เบอร์ร้านค้าของเรา`, value: `\`\`\`${Phone_Wallet_Webhook}\`\`\`` },
                    { name: "คุณต้องใช้เบอร์นี้ชำระเงิน", value: `\`\`\`${Phone_send}\`\`\`` },
                    { name: "จำนวนเงินที่ต้องชำระ", value: `\`\`\` ${amountFormatted} บาท \`\`\`` },
                    { name: `หมายเหตุการชำระเงิน`, value: `\`\`\`หากเบอร์ลูกค้าที่จะใช้ชำระไม่ตรง\nยอดเงินก็จะไม่เข้าระบบของลูกค้า\nชำระตรงกับเบอร์ยอดเงินจะเข้าทันที\`\`\`` }
                )

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${Topup_Notify}`)
                        .setLabel('🍀︲ดูประวัติเติมเงินที่นี่︲')
                        .setStyle(ButtonStyle.Link)
                )

            await interaction.update({ embeds: [UpdatedEmbed], components: [row] });
            SaveUserIDToFile('Wallet_UserID.txt', `${interaction.user.id}?=${interaction.guild.id}?=${Phone_send}?=${time}?=phone`);
        }
    } catch (error) {
        if (error?.status === 502) {
            const embed4 = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` ระบบเติมเงินนี้เกิดขัดข้อง!!')
                .setDescription('\`\`\`กรุณาใช้งานระบบอื่นแทนทางเราต้องขออภัยอย่างยิ่ง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed4], flags: MessageFlags.Ephemeral });
        } else {
            console.error("Error isModalSubmit Wallet_Webhook Phonew_modal", error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดทางระบบ!!')
                .setDescription('\`\`\`ระบบชำระเงินเกิดขัดข้องกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});