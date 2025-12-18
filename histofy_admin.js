const fs = require('fs');
const path = require('path');
const client = require('../index');
const { EmbedBuilder, MessageFlags } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId.startsWith('oderid_history_admin?')) {
            const OderID = interaction.customId.split('?')[1];
            const UserID = interaction.customId.split('?')[2];
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const dataPath = path.join(__dirname, '../A_CHII ODER/OderUser.json');
            const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

            const userData = jsonData?.[UserID];
            const ProductData = userData?.[OderID];

            if (!ProductData) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0033)
                    .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการดึงข้อมูล!')
                    .setDescription('\`\`\`ไม่พบข้อมูลสั่งซื้อสินค้าของผู้ใช้รายนี้\`\`\`')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
                return await interaction.editReply({ embeds: [embed] });
            }

            const historyFilePath = path.join(__dirname, `../A_CHII ODER/oders_${OderID}.txt`);
            if (!historyFilePath || historyFilePath.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0033)
                    .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการดึงข้อมูล!')
                    .setDescription('\`\`\`ไม่พบข้อมูลสั่งซื้อสินค้าของผู้ใช้รายนี้\`\`\`')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
                return await interaction.editReply({ embeds: [embed] });
            }

            await interaction.editReply({ content: `ผู้ใช้ <@${UserID}> | รหัสสินค้า : \`\`${ProductData?.oder_id || 'XXXXX'}\`\``, files: [historyFilePath] });
        }
    } catch (error) {
        console.error('❌ ERROR | A_CHII COMMAND GET HISTORY ADMIN', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0033)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการดึงข้อมูล!')
            .setDescription('\`\`\`ระบบดึงข้อมูลขัดข้องกรุณาลองใหม่อีกครั้ง\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
            .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
        return await interaction.editReply({ embeds: [embed] });
    }
});