const fs = require('fs');
const path = require('path');
const client = require('../index');
const { EmbedBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isButton() && interaction.customId.startsWith('oderid_history?')) {
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
                    .setTitle('\`\`❌\`\` ไม่พบข้อมูลการสั่งซื้อ!')
                    .setDescription('\`\`\`กรุณาซื้อสินค้าก่อนเพื่อดูรายการสั่งซื้อ\`\`\`')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
                return await interaction.editReply({ embeds: [embed] });
            }

            const localImagePath = path.join(ProductData?.icon);
            const attachment = new AttachmentBuilder(localImagePath);

             let detailsLines = [
                `อีเมล์: ${ProductData.email}`,
                `รหัสผ่าน: ${ProductData.password}`,
                `วันหมดอายุ: ${ProductData.expiry}`
            ];

            // ใส่เฉพาะเมื่อมีข้อมูลจริง
            if (ProductData.screen) detailsLines.splice(2, 0, `หน้าจอ: ${ProductData.screen}`);
            if (ProductData.pin) detailsLines.splice(3, 0, `PIN: ${ProductData.pin}`);

            const lines = [
                    '## ประวัติสั่งซื้อแอพ',
                    `**ผู้ใช้ :** <@${UserID}>`,
                    `**รหัสสินค้า : \`\` ${ProductData?.oder_id || 'XXXXX'} \`\`**`,
                    `**ชื่อสินค้า : \`\` ${ProductData?.name?.toUpperCase() || '-'} \`\`**\n`,
                    `**สินค้าที่ได้รับ**`,
                    `**\`\`\`${detailsLines.join('\n')}\`\`\`**`
                ];

             if (ProductData.link && ProductData.link.length > 0) {
                lines.push('## <a:er:1405305743481241712> ลิงก์สำคัญ');
                ProductData.link.forEach(links => {
                    lines.push(`- **[${links.text}](${links.href})**`);
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x33CC00)
                .setDescription(lines.join('\n'))
                .setFooter({ text: `TXD : ${OderID} ${ProductData?.name}`, iconURL: `attachment://${path.basename(localImagePath)}` });

            embed.setThumbnail(`attachment://${path.basename(localImagePath)}`)
                .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        }
    } catch (error) {
        console.error('❌ ERROR | A_CHII COMMAND GET HISTORY USER', error);
        const embed = new EmbedBuilder()
            .setColor(0xFF0033)
            .setTitle('\`\`❌\`\` เกิดข้อผิดพลาดการดึงข้อมูล!')
            .setDescription('\`\`\`ระบบดึงข้อมูลขัดข้องกรุณาลองใหม่อีกครั้ง\`\`\`')
            .setThumbnail(client.user.displayAvatarURL())
            .setImage('https://img2.pic.in.th/pic/_Maloby_025003a4edd606cc3487adbf1f3256dc6d.png');
        return await interaction.editReply({ embeds: [embed] });
    }
});
