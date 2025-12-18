const fs = require('fs');
const path = require('path');
const client = require('../index');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags } = require("discord.js");

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

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId === 'channel_topup') {
            const DataUPDATE = LoadDataUPDATE();

            const modal = new ModalBuilder()
                .setCustomId('channel_modals_bank')
                .setTitle('[📢] ตั้งค่าช่องการเติมเงิน')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel_notify_value')
                                .setLabel('︲[🔔] ช่องแจ้งเตือนเติมเงิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('<id:123456789>')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Channel_Notify_Topup || '0'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel_checkslip_value')
                                .setLabel('︲[🏛️] ช่องเช็คสลิปธนาคาร︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('<id:123456789>')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Channel_SendSlip || '0'}`)
                        )
                );
            await interaction.showModal(modal);
        }

    } catch (error) {
        console.error('Error A_CHII ModalBuilder Modals_Channel_Topup', error);
    }
});


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'channel_modals_bank') {
        try {
            const Channel_Notify = interaction.fields.getTextInputValue("channel_notify_value");
            const Channel_CheckSlip = interaction.fields.getTextInputValue("channel_checkslip_value");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['Channel_Notify_Topup'] = Channel_Notify;
            DataUPDATE['Channel_SendSlip'] = Channel_CheckSlip;
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });

        } catch (error) {
            console.error('Error A_CHII Modals_Channel_Topup isModalSubmit', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
                .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});