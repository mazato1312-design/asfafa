
const fs = require('fs');
const path = require('path');
const client = require('../index');
const { TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const DataUpdate_Path = path.resolve(__dirname, './LogDataBase.json');
    if (!fs.existsSync(DataUpdate_Path)) {
        fs.writeFileSync(DataUpdate_Path, '{}', 'utf8');
    }
    let fileContent = fs.readFileSync(DataUpdate_Path, 'utf8').trim();
    if (fileContent === '') {
        fs.writeFileSync(DataUpdate_Path, '{}', 'utf8');
        fileContent = '{}';
    }
    const DataUpdateData = JSON.parse(fileContent);
    return DataUpdateData;
};

const SaveDataUPDATE = (Load_Update) => {
    const DataUpdate_Path = path.resolve(__dirname, './LogDataBase.json');
    fs.writeFileSync(DataUpdate_Path, JSON.stringify(Load_Update, null, 2), 'utf8');
}

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId == "setchannel_home") {
            const DataUPDATE = LoadDataUPDATE();
            const modal = new ModalBuilder()
                .setCustomId('channel_modal_home')
                .setTitle('[🚀] ตั้งค่าช่องส่งข้อมูลสินค้า')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel_oder')
                                .setLabel('︲[📢] ช่องแจ้งเตือนประวัติสั่งซื้อ︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตั้งค่าเป็น ID: 123456789')
                                .setRequired(false)
                                .setValue(DataUPDATE?.Channels_Oder || '0')
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel_oders')
                                .setLabel('︲[📢] ช่องส่งออเดอร์ให้แอดมิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตั้งค่าเป็น ID: 123456789')
                                .setRequired(false)
                                .setValue(DataUPDATE?.Channels_OderAdmin || '0')
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel_repost')
                                .setLabel('︲[📢] ลิงค์ช่องแจ้งปัญหาสินค้า︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตั้งค่าเป็นลิงค์ URL')
                                .setRequired(false)
                                .setValue(DataUPDATE?.ReportURL || 'https://discord.com/channels/xxxxx')
                        )
                );
            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Error ModalBuilder Setchannel A_CHII UPDATE', error);
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isModalSubmit() && interaction.customId == "channel_modal_home") {
            const Channel_oder = interaction.fields.getTextInputValue("channel_oder");
            const Channel_Oders = interaction.fields.getTextInputValue("channel_oders");
            const channel_repost = interaction.fields.getTextInputValue("channel_repost");

            if (!channel_repost.startsWith('https://discord.com/channels/')) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กำหนดลิงค์ช่องแจ้งปัญหาไม่ถูกต้อง!!')
                    .setDescription(`\`\`\`กรุณากรอกลิงค์ช่องแจ้งปัญหาสินค้าให้ถูกต้อง\`\`\``)
                    .setThumbnail(interaction.user.displayAvatarURL())
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            const isInteger = (val) => /^\d+$/.test(val);
            if (![Channel_oder, Channel_Oders].every(isInteger)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กรุณากรอกไอดีช่องเป็นตัวเลขเท่านั้น!!')
                    .setDescription('\`\`\`ต้องเป็นตัวเลขห้ามมีอักษรหรือสัญลักษณ์อื่นๆ\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            };

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['Channels_Oder'] = Channel_oder;
            DataUPDATE['Channels_OderAdmin'] = Channel_Oders;
            DataUPDATE['ReportURL'] = channel_repost;
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });
        }
    } catch (error) {
        console.error('Error isModalSubmit Setchannel A_CHII UPDATE', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
            .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
            .setThumbnail(interaction.user.displayAvatarURL());
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});