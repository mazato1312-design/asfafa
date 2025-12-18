const fs = require('fs');
const path = require('path');
const { GET_PRODUCT } = require('../Utils/GET_PRODUCT');
const { isValidEmoji } = require('../Utils/isValidEmoji');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');

const LoadAppRateData = () => {
    const filePath = path.join(__dirname, '../app_ratedata.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
};


const LoadUpdateData = () => {
    const filePath = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
};

const EmbedHome = () => {

    let products = LoadAppRateData();
    const filteredProducts = products.filter(p => !(p.id === "100" || p.name === "TEST API"));
    const totalStock = filteredProducts.reduce((sum, product) => {
        const stock = parseInt(product.stock, 10);
        return sum + (isNaN(stock) ? 0 : stock);
    }, 0);


    return new EmbedBuilder()
        .setColor(0x01e7ff)
        .setDescription([
            '## <a:A_sp_moon_DONOTSTEAL:1406955479434792960> บริการแอพพรีเมียมราคาถูก',
            `\`\`\`มีสินค้า ${totalStock} ชิ้น พร้อมจำหน่าย\`\`\``,
        ].join('\n'))
        .setImage('https://img2.pic.in.th/pic/melody---03_.png')
        .setFooter({ text: '© Melody Shop , All Rights Reserved', iconURL: 'https://img5.pic.in.th/file/secure-sv1/output-onlinegiftools_1ff8879b4568ce9bd.gif' })
}

const EmbedSelect = async (interaction) => {
    await GET_PRODUCT();
    const DBUpdate = LoadUpdateData();

    let products = LoadAppRateData();
    if (!products || products.length === 0) {
        return;
    }

    const isProduct100Enabled = DBUpdate?.TESTAPI || false;
    products = products.filter(p => {
        if (!isProduct100Enabled) {
            if (p.id === "100" || p.name === "TEST API") {
                return false;
            }
        }
        return true;
    });

    products.sort((a, b) => {
        const stockA = parseInt(a.stock) || 0;
        const stockB = parseInt(b.stock) || 0;
        return stockB - stockA;
    });

    const MAX_OPTIONS = 14;

    const chunks = [];
    for (let i = 0; i < products.length; i += MAX_OPTIONS) {
        const chunk = products.slice(i, i + MAX_OPTIONS);
        chunks.push(chunk);
    }

    const select = chunks.map((chunk, index) => {
        const options = chunk.map(product => {
            const emoji = product.emoji ? product.emoji.trim() : null;
            const status_emoji = product.stock > 0 ? `🟢` : '🔴';
            const option = {
                label: product.name.slice(0, 100),
                value: product.id,
                description: `💰 ราคา ${product.price_me} บาท ${status_emoji} คงเหลือ ${product.stock} ชิ้น`,
            };
            if (emoji && isValidEmoji(emoji, interaction.guild)) {
                option.emoji = emoji;
            }
            return option;
        });

        options.push({
            label: 'ล้างตัวเลือกใหม่',
            value: 'clear_selection',
            emoji: '<a:48084loadingcircle:1403567384111091722>',
        });


        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`select_product_${index + 1}`)
                    .setPlaceholder(`🎬 เลือกแอพที่ต้องการ หมวดหมู่ ${index + 1}`)
                    .addOptions(options)
            );
    });
    return select;
}

const EmbedButton = () => {
    const DBUpdate = LoadUpdateData();
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('buy_topup')
                .setLabel('เติมเงิน')
                .setEmoji('<:money6:1396667379139870810>')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('chack_topup')
                .setLabel('เช็คยอดเงิน')
                .setEmoji('<a:money2:1396667444965146686>')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('clear_selection')
                .setLabel('อัพเดทรายการสินค้า')
                .setEmoji('<a:w_lines01:1413912052581535866>')
                .setStyle(ButtonStyle.Secondary)
        
        );
}

module.exports = { EmbedHome, EmbedSelect, EmbedButton };