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
        if (interaction.isButton() && interaction.customId === 'set_promtpay') {
            const DataUPDATE = LoadDataUPDATE();

            const modal = new ModalBuilder()
                .setCustomId('promtpay_modals_bank')
                .setTitle('[🏛️] ตั้งค่ารับเงินธนาคาร')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('slipok_url')
                                .setLabel('︲[🔗] ลิงค์ URL SLIPOK︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('https://api.slipok.com/api/line/apikey/12345')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Url_Api_SlipOK || 'https://api.slipok.com/api/line/apikey/12345'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('slipok_keys')
                                .setLabel('︲[⭐] คีย์ API SLIPOK︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตัวอย่าง SLIPXXXXXXX')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Api_Keys_Token || 'SLIPXXXXXXX'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('promtpay_number')
                                .setLabel('︲[📲] หมายเลขพ้อมเพย์ธนาคาร︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('064XXXXXXX')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Phone_Promtpay || '064XXXXXXX'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('topup_min_number')
                                .setLabel('︲[💰] เติมเงินขั้นต่ำธนาคาร︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตัวอย่าง 5 บาทป้อนเป็นตัวเลข')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Topup_RimitMin || '5'}`)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('topup_time_number')
                                .setLabel('︲[🕒] กำหนดเวลาเติมเงิน︲')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ตัวอย่าง 5 นาทีป้อนเป็นตัวเลข')
                                .setRequired(false)
                                .setValue(`${DataUPDATE?.Time_CheckSlip || '5'}`)
                        ),
                );
            await interaction.showModal(modal);
        }

    } catch (error) {
        console.error('Error A_CHII ModalBuilder Modals_Bank', error);
    }
});


client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'promtpay_modals_bank') {
        try {
            const Slipok_Url = interaction.fields.getTextInputValue("slipok_url");
            const Slipok_Keys = interaction.fields.getTextInputValue("slipok_keys");
            const PromtPay_Number = interaction.fields.getTextInputValue("promtpay_number");
            const Topup_Min_Number = interaction.fields.getTextInputValue("topup_min_number");
            const Topup_Time_Number = interaction.fields.getTextInputValue("topup_time_number");

            const DataUPDATE = LoadDataUPDATE();
            DataUPDATE['Url_Api_SlipOK'] = Slipok_Url;
            DataUPDATE['Api_Keys_Token'] = Slipok_Keys;
            DataUPDATE['Phone_Promtpay'] = PromtPay_Number;
            DataUPDATE['Topup_RimitMin'] = Topup_Min_Number || '5';
            DataUPDATE['Time_CheckSlip'] = Topup_Time_Number || '5';
            SaveDataUPDATE(DataUPDATE);
            await interaction.update({ withResponse: true });

        } catch (error) {
            console.error('Error A_CHII Modals_Bank isModalSubmit', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดบางอย่าง!!')
                .setDescription('\`\`\`พบข้อผิดพลาดในการเพิ่มข้อมูลกรุณาลองใหม่ภายหลัง\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
});