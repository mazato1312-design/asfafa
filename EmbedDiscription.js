const path = require('path');
const { CleanHtmlToText } = require('../Utils/CleanHtmlToText');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');


const EmbedDiscription = async (product, localImagePath) => {

    // อิโมจิหน้าคำว่า เว็ปไซต์ แอพพรีเมียม
    const emoji_view_web = "🌎";
    const cleanDescription = CleanHtmlToText(product.product_info, emoji_view_web);

    // ตั้งค่าอิโมจิ
    const status_emoji = product.stock > 0
        ? '\`\`✔️\`\`' // มีสินค้า
        : '\`\`❌\`\`'; // ไม่มีสินค้า

    const embed = new EmbedBuilder()
        .setColor(0x33CC00)
        .setDescription(`## ${product.emoji} ${product.name}\n${cleanDescription || 'ไม่มีรายละเอียดเพิ่มเติม'}`)
        .addFields(
            { name: 'ราคาสินค้า', value: `**\`\`\`${product.price_me} บาท\`\`\`**`, inline: true },
            { name: `${status_emoji} สต็อกคงเหลือ`, value: `**\`\`\`${product.stock} ชิ้น\`\`\`**`, inline: true }
        )
        .setFooter({ text: `หมวดหมู่สินค้า ${product.category || 'ไม่ระบุ'}︲${product.name}`, iconURL: 'https://cdn.discordapp.com/emojis/1395518108223017110.webp' });
    embed.setThumbnail(`attachment://${path.basename(localImagePath)}`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`confrim_app?${product.id}`)
                .setLabel('✅ ยืนยันสั่งซื้อแอพ')
                .setDisabled(product.stock > 0 ? false : true)
                .setStyle(ButtonStyle.Success)
        )

    return { embed, row };
}

module.exports = { EmbedDiscription };
