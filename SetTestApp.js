


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
        if (interaction.isButton() && interaction.customId === 'settest_app') {
            const DataUPDATE = LoadDataUPDATE();

            if (typeof DataUPDATE['TESTAPI'] !== 'boolean') {
                DataUPDATE['TESTAPI'] = false;
            }

            DataUPDATE['TESTAPI'] = !DataUPDATE['TESTAPI'];
            SaveDataUPDATE(DataUPDATE);

            const isEnabled = DataUPDATE['TESTAPI'];
            const embed = new EmbedBuilder()
                .setColor(isEnabled ? 0x66FF00 : 0xFF0000)
                .setTitle('[\`\`🎬\`\`] เมนูเทสระบบซื้อแอพพรีเมียม')
                .setDescription(`**\`\`\`${isEnabled ? '✅สถานะ : เปิดใช้งานแล้ว' : '❌สถานะ : ปิดใช้งานแล้ว'}\`\`\`**`
                )
                .setThumbnail('https://img5.pic.in.th/file/secure-sv1/te7f2da96de7a24f8c.png');

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.log('Error MenuTopup_Select isButton setmenu_angpao', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL());
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});
