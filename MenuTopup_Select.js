const fs = require('fs');
const path = require('path');
const client = require('../index');
const { ActionRowBuilder, EmbedBuilder, MessageFlags, StringSelectMenuBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");

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
};

const EmbedMenuTopup_Select = () => {
    const DATE_BASE = LoadDataUPDATE();
    const promptpay_turn = DATE_BASE?.promptpay_turn || false;
    const aungpao_turn = DATE_BASE?.aungpao_turn || false;
    const wallet_turn = DATE_BASE?.wallet_turn || false;

    const embed = new EmbedBuilder()
        .setColor(0x66FF00)
        .setTitle(`[\`\`👛\`\`] จัดการเมนูระบบเติมเงิน`)
        .setDescription(`
            **[\`\`🏛️\`\`] พ้อมเพย์ธนาคาร \`\`${promptpay_turn ? '🔴︲รายการนี้ปิดใช้งานอยู่ในขณะนี้' : '🟢︲ระบบนี้เปิดใช้งานอยู่ขณะนี้'} \`\`**
            **[\`\`🧧\`\`] ซองอั่งเปาวอเลต \`\`${aungpao_turn ? '🔴︲รายการนี้ปิดใช้งานอยู่ในขณะนี้' : '🟢︲ระบบนี้เปิดใช้งานอยู่ขณะนี้'} \`\`**
            **[\`\`👛\`\`] ทรูวอเลตแบบเบอร์ \`\`${wallet_turn ? '🔴︲รายการนี้ปิดใช้งานอยู่ในขณะนี้' : '🟢︲ระบบนี้เปิดใช้งานอยู่ขณะนี้'} \`\`**
            
            `)
        .setImage('https://s14.gifyu.com/images/bKnV0.png')

    const topupOptions = [
        {
            label: '🏛️︲พ้อมเพย์ธนาคาร︲',
            description: promptpay_turn ? '🔴︲ปิดใช้งานอยู่' : '🟢︲เปิดใช้งานอยู่ขณะนี้',
            value: promptpay_turn ? 'turn_off_select' : 'promtpay_select',
            disabled: promptpay_turn
        },
        {
            label: '🧧︲ซองอั่งเปาวอเลต︲',
            description: aungpao_turn ? '🔴︲ปิดใช้งานอยู่' : '🟢︲เปิดใช้งานอยู่ขณะนี้',
            value: aungpao_turn ? 'turn_aungpao_select' : 'angpao_select',
            disabled: aungpao_turn
        },
        {
            label: '👛︲ทรูมันนี่วอเลตแบบเบอร์︲',
            description: wallet_turn ? '🔴︲ปิดใช้งานอยู่' : '🟢︲เปิดใช้งานอยู่ขณะนี้',
            value: wallet_turn ? 'turn_wallet_select' : 'wallet_select',
            disabled: wallet_turn
        }
    ];

    const resetOption = {
        label: '>>︲รีเฟชรตัวเลือกใหม่︲<<',
        value: 'select_menubank_value'
    };

    const sortedOptions = [
        ...topupOptions.filter(opt => !opt.disabled),
        ...topupOptions.filter(opt => opt.disabled),
        resetOption
    ];

    const select = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('reselect_menubank')
                .setPlaceholder('|︲🥟 ดูตัวอย่างเมนูเติมเงิน ︲|')
                .addOptions(sortedOptions)
        );

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setmenu_bank')
                .setLabel('🏛️︲เปิด - ปิดเมนูธนาคาร︲')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setmenu_angpao')
                .setLabel('🧧︲เปิด - ปิดเมนูซองอั่งเปา︲')
                .setStyle(ButtonStyle.Success)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setmenu_wallet_phone')
                .setLabel('📞︲เปิด - ปิดทรูวอเลตเบอร์︲')
                .setStyle(ButtonStyle.Success)
        );
    return { embed, select, row1, row2 };
};

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId === 'open_menubank') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const { embed, select, row1, row2 } = EmbedMenuTopup_Select()
            await interaction.editReply({ embeds: [embed], components: [select, row1, row2] })
        }
    } catch (error) {
        console.log('Error MenuTopup_Select isButton  open_menubank', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดในการตั้งค่าเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.editReply({ embeds: [embed] });
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId === 'setmenu_bank') {

            const DataUPDATE = LoadDataUPDATE();
            if (typeof DataUPDATE['promptpay_turn'] !== 'boolean') {
                DataUPDATE['promptpay_turn'] = false;
            }
            DataUPDATE['promptpay_turn'] = !DataUPDATE['promptpay_turn'];
            SaveDataUPDATE(DataUPDATE);
            const { embed, select, row1, row2 } = EmbedMenuTopup_Select()
            await interaction.update({ embeds: [embed], components: [select, row1, row2], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.log('Error MenuTopup_Select isButton  setmenu_bank', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId === 'setmenu_angpao') {
            const DataUPDATE = LoadDataUPDATE();
            if (typeof DataUPDATE['aungpao_turn'] !== 'boolean') {
                DataUPDATE['aungpao_turn'] = false;
            }
            DataUPDATE['aungpao_turn'] = !DataUPDATE['aungpao_turn'];
            SaveDataUPDATE(DataUPDATE);
            const { embed, select, row1, row2 } = EmbedMenuTopup_Select()
            await interaction.update({ embeds: [embed], components: [select, row1, row2], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.log('Error MenuTopup_Select isButton  setmenu_angpao', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});


client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId === 'setmenu_wallet_phone') {

            const DataUPDATE = LoadDataUPDATE();
            if (typeof DataUPDATE['wallet_turn'] !== 'boolean') {
                DataUPDATE['wallet_turn'] = false;
            }
            DataUPDATE['wallet_turn'] = !DataUPDATE['wallet_turn'];
            SaveDataUPDATE(DataUPDATE);
            const { embed, select, row1, row2 } = EmbedMenuTopup_Select()
            await interaction.update({ embeds: [embed], components: [select, row1, row2], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.log('Error MenuTopup_Select isButton  setmenu_wallet_phone', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'reselect_menubank') {
            const selectedValue = interaction.values[0];
            if (selectedValue === 'select_menubank_value') {
                const { embed, select, row1, row2 } = EmbedMenuTopup_Select()
                return await interaction.update({ embeds: [embed], components: [select, row1, row2], flags: MessageFlags.Ephemeral });
            }
            if (selectedValue === 'turn_off_select' || selectedValue === 'turn_aungpao_select' || selectedValue === 'turn_wallet_select') {
                const embed = new EmbedBuilder()
                    .setColor(0x01e7ff)
                    .setTitle('\`\`❌\`\` ขออภัยระบบการชำระเงินนี้ปิดอยู่!!')
                    .setDescription('\`\`\`[💰] ตัวอย่างเมื่อระบบเมนูเติมเงินปิดใช้งาน\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if (selectedValue === 'promtpay_select' || selectedValue === 'wallet_select' || selectedValue === 'angpao_select') {
                const embed = new EmbedBuilder()
                    .setColor(0x66FF00)
                    .setTitle('[\`\`👛\`\`] ตัวอย่างเมนูเติมเงินที่เลือก!!')
                    .setDescription('\`\`\`[💰] ระบบใช้งานได้ผ่านการเปิดให้ใช้งานแล้ว\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        }
    } catch (error) {
        console.error('Error A_CHII UPDATE MenuTopup_Select isStringSelectMenu', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการเลือกเมนู')
            .setDescription('\`\`\`กรุณาลองทำรายการนี้ใหม่อีกครั้ง!\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});