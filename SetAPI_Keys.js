
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
        if (interaction.isButton() && interaction.customId == "keys_api_byshop") {
            const DataUPDATE = LoadDataUPDATE();
            const modal = new ModalBuilder()
                .setCustomId('apibyshop_modal')
                .setTitle('[🔏] ตั้งค่า API BYSHOP')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('api_keys_byshop')
                                .setLabel('︲[🔏] กรอกคีย์ API BYSHOP︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('BYShop-xxxxxxxxxxx')
                                .setRequired(true)
                                .setValue(DataUPDATE?.ByShop_APIkey || '0')
                        )
                );
            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Error ModalBuilder SetAPI KEY BYSHOP A_CHII UPDATE', error);
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isModalSubmit() && interaction.customId == "apibyshop_modal") {
            const ByShop_APIkey = interaction.fields.getTextInputValue("api_keys_byshop");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['ByShop_APIkey'] = ByShop_APIkey;
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });
        }
    } catch (error) {
        console.error('Error isModalSubmit SetAPI KEY BYSHOP A_CHII UPDATE', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
            .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
            .setThumbnail(interaction.user.displayAvatarURL());
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});