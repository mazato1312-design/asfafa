
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
        if (interaction.isButton() && interaction.customId == "setadmin_home") {
            const DataUPDATE = LoadDataUPDATE();
            const modal = new ModalBuilder()
                .setCustomId('admin_modal_home')
                .setTitle('[👑] ตั้งค่าผู้ดูแลระบบ')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('admin_assistant')
                                .setLabel('︲[👑] ตั้งค่าไอดีแอดมินผู้ดูแล︲')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('<id:123456789>\n<id:123456789>\n<id:123456789>')
                                .setRequired(false)
                                .setValue((DataUPDATE?.Assistant || []).join('\n'))
                        )
                );
            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Error ModalBuilder SetUp_Admin A_CHII UPDATE', error);
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isModalSubmit() && interaction.customId == "admin_modal_home") {
            const DataUPDATE = LoadDataUPDATE();
            const RawInput = interaction.fields.getTextInputValue('admin_assistant');
            const AssistantIDs = RawInput
                .split('\n')
                .map(id => id.trim())
                .filter(id => id !== '');

            const isInteger = (val) => /^\d+$/.test(val);
            if (!AssistantIDs.every(isInteger)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` กรุณากรอกไอดีแอดมินเป็นตัวเลขเท่านั้น!!')
                    .setDescription('\`\`\`ต้องเป็นตัวเลข ห้ามมีอักษรหรือสัญลักษณ์อื่นๆ\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            if (AssistantIDs.length === 0) {
                DataUPDATE['Assistant'] = [];
            } else {
                DataUPDATE['Assistant'] = AssistantIDs;
            }
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });
        }
    } catch (error) {
        console.error('Error isModalSubmit SetUp_Admin A_CHII UPDATE', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
            .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
            .setThumbnail(interaction.user.displayAvatarURL());
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});