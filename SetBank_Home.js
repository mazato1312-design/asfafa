const client = require('../index');
const { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const EmbedSetBank_Home = () => {
    const embed = new EmbedBuilder()
        .setColor(0x66FF00)
        .setTitle(`[\`\`💰\`\`] จัดการตั้งค่าบัญชีรับเงินของเรา`)
        .setImage('https://s14.gifyu.com/images/bKduF.png')

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_promtpay')
                .setLabel('🏛️︲ตั้งค่าการรับเงินธนาคาร︲')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_angpao')
                .setLabel('🧧︲รับเงินวอเลตซองอังเปา︲')
                .setStyle(ButtonStyle.Success)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_wallet_phone')
                .setLabel('📞︲ตั้งค่าทรูวอเลตแบบเบอร์︲')
                .setStyle(ButtonStyle.Primary)
        ) 
        .addComponents(
            new ButtonBuilder()
                .setCustomId('channel_topup')
                .setLabel('📢︲ตั้งค่าช่องการเติมเงิน︲')
                .setStyle(ButtonStyle.Primary)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setrole_topup')
                .setLabel('👑︲ตั้งค่าไอดียศการเติมเงิน︲')
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('open_menubank')
                .setLabel('👛︲เปิด︲ปิด เมนูเติมเงิน︲')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embed, row1, row2, row3 };
};

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId === 'setmoney_home') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const { embed, row1, row2, row3 } = EmbedSetBank_Home();
            await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });
        }
    } catch (error) {
        console.error('Error A_CHII UPDATE SetBank_Home', error);
    }
});


