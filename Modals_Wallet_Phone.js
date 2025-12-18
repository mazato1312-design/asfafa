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
        if (interaction.isButton() && interaction.customId === 'set_wallet_phone') {
            const DataUPDATE = LoadDataUPDATE();

            const modal = new ModalBuilder()
                .setCustomId('wallet_modals_bank')
                .setTitle('[📞] ตั้งค่ารับเงินวอเลตแบบเบอร์')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('wallet_value_phone')
                                .setLabel('︲[📞] เบอร์รับเงินวอเลต︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('064XXXXXXX')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Phone_Wallet_Webhook || '064XXXXXXX'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('keys_wallet_webhook')
                                .setLabel('︲[🔔] คีย์ API ตรวจสอบรับเงิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('576a86043******')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.keys_Wallet_Webhook || '576a86043******'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('keys_wallet_link')
                                .setLabel('︲[🔗] คีย์ API สร้างลิงค์รับเงิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('29e54116b366******')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Keys_CreateLink_Wallet || '29e54116b366******'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('wallet_remit_amount')
                                .setLabel('︲[💰] ปรับเติมเงินต่ำ︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('10')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Wallet_remit_amount || '10'}`)
                        )
                );
            await interaction.showModal(modal);
        }

    } catch (error) {
        console.error('Error A_CHII ModalBuilder Modals_Wallet_Phone', error);
    }
});


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'wallet_modals_bank') {
        try {
            const PhoneWallet = interaction.fields.getTextInputValue("wallet_value_phone");
            const Keys_WebHook = interaction.fields.getTextInputValue("keys_wallet_webhook");
            const Keys_CreateLink = interaction.fields.getTextInputValue("keys_wallet_link");
            const Wallet_remit_amount = interaction.fields.getTextInputValue("wallet_remit_amount");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['Phone_Wallet_Webhook'] = PhoneWallet;
            DataUPDATE['keys_Wallet_Webhook'] = Keys_WebHook;
            DataUPDATE['Keys_CreateLink_Wallet'] = Keys_CreateLink;
            DataUPDATE['wallet_remit_amount'] = Wallet_remit_amount;
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });

        } catch (error) {
            console.error('Error A_CHII Modals_Wallet_Phone isModalSubmit', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
                .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});