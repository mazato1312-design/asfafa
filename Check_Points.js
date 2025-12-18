const client = require('../index');
const { GetBalance, LoadBalances } = require('./BankBase');
const { EmbedBuilder, MessageFlags } = require('discord.js');

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId === 'chack_topup') {
            await LoadBalances();
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const userId = interaction.user.id;
            const balance = GetBalance(userId);
            const formattedBalance = parseFloat(balance || '0.00').toFixed(2);
            const updatedEmbed = new EmbedBuilder()
                .setColor(0x01e7ff)
                .setAuthor({
                    name: `${interaction.user.username.split('_').map(word => word.toUpperCase()).join('_')}`,
                    iconURL: `${interaction.user.displayAvatarURL()}`
                })
                .setDescription(`\`\`\` ยอดเงินคงเหลือ ${formattedBalance} บาท \`\`\``)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');

            await interaction.editReply({ embeds: [updatedEmbed] });
        }

    } catch (error) {
        console.error('Check_Points Error', error);
    }
});