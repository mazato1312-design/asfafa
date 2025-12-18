const fs = require('fs');
const path = require('path');
const axios = require('axios');
const client = require('../index');
const { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, './LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

const LoadConnetData = () => {
    const Message_Path = path.join(__dirname, '../A_CHII_ConnetData.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

const EmbedHome_Update = async () => {

    const DataUPDATE = LoadDataUPDATE();
    const ConnetPath = LoadConnetData();

    let BankAmount = "0.00";
    const APIKEY = DataUPDATE?.ByShop_APIkey;
    if (APIKEY) {
        try {
            const formData = new URLSearchParams();
            formData.append('keyapi', DataUPDATE?.ByShop_APIkey);
            const response = await axios.post('https://byshop.me/api/money', formData);
            BankAmount = response.data.money;
        } catch (_) {
            BankAmount = "0.00";
        }
    }


    const embed = new EmbedBuilder()
        .setColor(0x66FF00)
        .setTitle(`[\`\`🏡\`\`] จัดการข้อมูลระบบหลังบ้าน`)
        .setDescription([
                    `**[\`\`📢\`\`] ช่องแจ้งเตือนซื้อสินค้า**\n\`\`\`${DataUPDATE?.Channels_Oder || 'รอเพิ่ม'}\`\`\``,
                    `**[\`\`📢\`\`] ช่องแจ้งเตือนออเดอร์แอดมิน**\n\`\`\`${DataUPDATE?.Channels_OderAdmin || 'รอเพิ่ม'}\`\`\``,
                    `**[\`\`💰\`\`] ยอดเงินใน API คงเหลือ**\n\`\`\`${BankAmount || '0.00'} บาท\`\`\``
                    ].join('\n'))
        .setImage('https://s14.gifyu.com/images/bKdks.png')

    const UserADMIN = ConnetPath?.AdminID || 'ยังไม่มีแอดมินในระบบ';
    const AssistantList = (DataUPDATE?.Assistant || []).map(id => `**[\`\`💥\`\`]** <@${id}>`).join('\n') || '**[\`\`💥\`\`] ยังไม่มีแอดมินที่ถูกเพิ่ม**';

    embed.addFields(
        {
            name: `[\`\`👑\`\`] แอดมินหลักดูแลระบบ`,
            value: `**[\`\`👑\`\`]** <@${UserADMIN}>`,
            inline: true
        },
        {
            name: `[\`\`🍟\`\`] แอดมินผู้ช่วยดูแลระบบ`,
            value: AssistantList,
            inline: true
        }
    );

    const select = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('reselect_home')
                .setPlaceholder('|︲🥟 รีเฟชรเพื่อดูการอัปเดต ︲|')
                .addOptions({
                    label: '>>︲รีเฟชรดูการอัปเดตใหม่︲<<',
                    value: 'select_home_value'
                })
        );

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setmoney_home')
                .setLabel('🧧︲ตั้งค่ารับเงินเรา︲')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setchannel_home')
                .setLabel('🚀︲จัดการช่องสินค้า︲')
                .setStyle(ButtonStyle.Success)
        )
         .addComponents(
            new ButtonBuilder()
                .setCustomId('setadmin_home')
                .setLabel('👑︲ตั้งค่าแอดมิน︲')
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('keys_api_byshop')
                .setLabel('🔏︲ตั้งค่าคีย์API︲')
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('settest_app')
                .setLabel('🍀︲ตั้งค่าเทสสินค้า︲')
                .setStyle(ButtonStyle.Secondary)
        )
         .addComponents(
            new ButtonBuilder()
                .setCustomId('setrate_app')
                .setLabel('⭐︲ตั้งค่าเรทขาย︲')
                .setStyle(ButtonStyle.Secondary)
        )

    return { embed, select, row1, row2 };
};

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand() && interaction.commandName === 'setup_home') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const ConnetPath = LoadConnetData();
            const DataUPDATE = LoadDataUPDATE();
            const UserADMIN = ConnetPath?.AdminID || ['NULL'];
            const Assistant = DataUPDATE?.Assistant || ['NULL'];

            const AllowedUser = [UserADMIN, ...Assistant];
            if (!AllowedUser.includes(interaction.user.id)) {
                const embed_error = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` คุณไม่ได้รับอนุญาติสิทธิ์ใช้คำสั่งนี้!!')
                    .setDescription('\`\`\`คำสั่งสำหรับแอดมินผู้ที่มีสิทธิ์เท่านั้น...\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.editReply({ embeds: [embed_error] });
            };

            const { embed, select, row1, row2 } = await EmbedHome_Update();
            await interaction.editReply({ embeds: [embed], components: [select, row1, row2] });
        }
    } catch (error) {
        console.error('Error A_CHII UPDATE Home_Update', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'reselect_home') {
            const selectedValue = interaction.values[0];
            if (selectedValue === 'select_home_value') {
                const { embed, select, row1, row2 } = await EmbedHome_Update();
                await interaction.update({ embeds: [embed], components: [select, row1, row2], flags: MessageFlags.Ephemeral });
            }
        }
    } catch (error) {
        console.error('Error A_CHII UPDATE Home_Update isStringSelectMenu', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดในการรีเฟชร')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});