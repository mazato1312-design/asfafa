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
        if (interaction.isButton() && interaction.customId === 'setrole_topup') {
            const DataUPDATE = LoadDataUPDATE();

            const modal = new ModalBuilder()
                .setCustomId('roles_modals_bank')
                .setTitle('[👑] ตั้งค่ายศการเติมเงิน')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('roles_value_topup')
                                .setLabel('︲[💰] ยศที่ได้รับหลังเติมเงิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('<id:123456789>')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Role_Topup_ID || '0'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('roles_value_checkslip')
                                .setLabel('︲[🏛️] ยศเช็คสลิปธนาคาร︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('<id:123456789>')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Role_CheckSlip || '0'}`)
                        )
                );
            await interaction.showModal(modal);
        }

    } catch (error) {
        console.error('Error A_CHII ModalBuilder Modals_Roles_Topup', error);
    }
});


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'roles_modals_bank') {
        try {
            const RoleTopupID = interaction.fields.getTextInputValue("roles_value_topup");
            const RoleCheckslipID = interaction.fields.getTextInputValue("roles_value_checkslip");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['Role_Topup_ID'] = RoleTopupID || '0';
            DataUPDATE['Role_CheckSlip'] = RoleCheckslipID || '0';
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });

        } catch (error) {
            console.error('Error A_CHII Modals_Roles_Topup isModalSubmit', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
                .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});