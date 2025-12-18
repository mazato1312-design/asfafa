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
        if (interaction.isButton() && interaction.customId === 'set_angpao') {
            const DataUPDATE = LoadDataUPDATE();

            const modal = new ModalBuilder()
                .setCustomId('angpao_modals_bank')
                .setTitle('[🧧] ตั้งค่ารับเงินซองอั่งเปา')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('angpao_phone')
                                .setLabel('︲[📞] เบอร์รับเงินซองอั่งเปา︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('064XXXXXXX')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.PhoneTrue_Wallet || '064XXXXXXX'}`)
                        )
                );
            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Error A_CHII ModalBuilder Modals_AngPao', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'angpao_modals_bank') {
        try {
            const PhoneWallet = interaction.fields.getTextInputValue("angpao_phone");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['PhoneTrue_Wallet'] = PhoneWallet || '5';
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });

        } catch (error) {
            console.error('Error A_CHII Modals_AngPao isModalSubmit', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
                .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});