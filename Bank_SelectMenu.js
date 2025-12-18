const fs = require('fs');
const path = require('path');
const client = require('../index');
const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId === 'buy_topup') {
            const DATE_BASE = LoadDataUPDATE();

            const promptpay_turn = DATE_BASE?.promptpay_turn || false;
            const aungpao_turn = DATE_BASE?.aungpao_turn || false;
            const wallet_turn = DATE_BASE?.wallet_turn || false;

            const topupOptions = [
                {
                    label: 'พร้อมเพย์ธนาคาร',
                    emoji: '<:pp:1396667960625463408>',
                    description: promptpay_turn ? '❌รายการนี้ปิดใช้งานอยู่ในขณะนี้' : 'เติมแบบสแกน QR เช็คสลิป',
                    value: promptpay_turn ? 'turn_off' : 'เติมสแกนจ่าย',
                    disabled: promptpay_turn
                },
                {
                    label: 'ซองอั่งเปาวอเลท',
                    emoji: '<:Wallet:1396668089403179099>',
                    description: aungpao_turn ? '❌รายการนี้ปิดใช้งานอยู่ในขณะนี้' : 'เติมแบบซองอั่งเปาวอเลต',
                    value: aungpao_turn ? 'turn_aungpao' : 'เติมวอเลต',
                    disabled: aungpao_turn
                },
                {
                    label: 'เติมผ่านทรูมันนี่วอเลท',
                    emoji: '<:emoji_99:1395398692537761924>',
                    description: wallet_turn ? '❌รายการนี้ปิดใช้งานอยู่ในขณะนี้' : 'ชำระเข้าระบบทันทีไม่ต้องรอ',
                    value: wallet_turn ? 'turn_wallet' : 'เติมเบอร์ทรูมันนี่',
                    disabled: wallet_turn
                }
            ];

            const resetOption = {
                label: 'ล้างตัวเลือกใหม่',
                emoji: '<a:48084loadingcircle:1403567384111091722>',
                value: 'reset_memubank'
            };

            const sortedOptions = [
                ...topupOptions.filter(opt => !opt.disabled),
                ...topupOptions.filter(opt => opt.disabled),
                resetOption
            ];

            const embed = new EmbedBuilder()
                .setColor(0x01e7ff)
                .setTitle(`เติมเงินผ่านระบบอัตโนมัติ`)
                .setImage('https://img2.pic.in.th/pic/Se991.webp');

            const select = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('teram_topup')
                        .setPlaceholder('กรุณาเลือกช่องทางการเติมเงิน')
                        .addOptions(sortedOptions)
                );

            await interaction.reply({ embeds: [embed], components: [select], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.error('Error Bank_SelectMenu', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'teram_topup') {
            const selectedValue = interaction.values[0];
            if (selectedValue === 'turn_off' || selectedValue === 'turn_aungpao' || selectedValue === 'turn_wallet') {
                const embed = new EmbedBuilder()
                    .setColor(0x01e7ff)
                    .setTitle('\`\`❌\`\` ขออภัยระบบการชำระเงินนี้ปิดอยู่!!')
                    .setDescription('\`\`\`กรุณาเลือกรายการอื่นที่รองรับอยู่\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');

                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        }
    } catch (error) {
        console.error('Error isStringSelectMenu Turn_OFF Bank_SelectMenu', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});