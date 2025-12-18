
const fs = require('fs');
const path = require('path');
const client = require('../index');
const { GET_PRODUCT } = require('../Utils/GET_PRODUCT');
const { isValidEmoji } = require('../Utils/isValidEmoji');
const { TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, MessageFlags, StringSelectMenuBuilder } = require('discord.js');

function CalculateProfit(costPrice, sellPrice) {
    return (sellPrice - costPrice).toFixed(2);
}

const LoadAppRateData = () => {
    const filePath = path.join(__dirname, '../app_ratedata.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
};

const SaveAppRateData = (data) => {
    const filePath = path.join(__dirname, '../app_ratedata.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};


const EmbedMenu = () => {
    const embed = new EmbedBuilder()
    .setColor(0x99FF00)
    .setTitle('\`\`💰\`\` ตั้งเรทราคาขายแอพ')
    .setImage('https://img5.pic.in.th/file/secure-sv1/rate6e7ea33380add079.png')
    return embed;
}

const SelectMenu = async (interaction) => {
    await GET_PRODUCT();
    let products = LoadAppRateData();
    const isProduct100Enabled = false;
    products = products.filter(p => {
        if (!isProduct100Enabled) {
            if (p.id === "100" || p.name === "TEST API") {
                return false;
            }
        }
        return true;
    });

    const MAX_OPTIONS = 8;
    const chunks = [];
    for (let i = 0; i < products.length; i += MAX_OPTIONS) {
        const chunk = products.slice(i, i + MAX_OPTIONS);
        chunks.push(chunk);
    }

    const select = chunks.map((chunk, index) => {
        const options = chunk.map(product => {
            const CalculateBath = CalculateProfit(parseFloat(product?.price), parseFloat(product.price_me));
            const emoji = product.emoji ? product.emoji.trim() : null;
            const option = {
                label: product.name.slice(0, 100),
                value: product.id,
                description: `ต้นทุน ${product.price}︲ขาย ${product.price_me}︲กำไร ${CalculateBath}`,
            };
            if (emoji && isValidEmoji(emoji, interaction.guild)) {
                option.emoji = emoji;
            }
            return option;
        });

        options.push({
            label: 'ล้างตัวเลือกใหม่',
            value: 'clear_selection_rate',
            emoji: '<a:48084loadingcircle:1403567384111091722>',
        });

        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`select_setrate_${index + 1}`)
                    .setPlaceholder(`🎬 เลือกแอพที่ต้องการตั้งเรทราคา ${index + 1}︲|`)
                    .addOptions(options)
            );
    });

    return select;
};

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId == "setrate_app") {
        const embed = EmbedMenu();
        const select = await SelectMenu(interaction);
        await interaction.reply({ embeds: [embed], components: [...select], flags: MessageFlags.Ephemeral });
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith('select_setrate_')) return;
        const selectedId = interaction.values[0];

        if (selectedId === 'clear_selection_rate') {
            const select = await SelectMenu(interaction);
            await interaction.update({ components: [...select], flags: MessageFlags.Ephemeral });
            return;
        }

        const products = LoadAppRateData();
        const product = products.find(p => p.id === selectedId);
        const modal = new ModalBuilder()
            .setCustomId(`rate_modal_app?${selectedId}`)
            .setTitle('[💰] ตั้งค่าเรทขายแอพ')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('price_app')
                        .setLabel('︲[💸] ราคาต้นทุน (ห้ามแก้ไข)︲')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('เป็นตัวเลขสำหรับโชว์')
                        .setRequired(false)
                        .setValue(product?.price || '0.00')
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('rate_app')
                        .setLabel('︲[💰] ราคาขาย (แก้ไขได้)︲')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('ตัวเลขเท่านั้น 0.00')
                        .setRequired(false)
                        .setValue(product?.price_me || '0.00')
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('emoji_app')
                        .setLabel('︲[🍊] ตั้งค่าอิโมจิตัวเลือก (แก้ไขได้)︲')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('<a:emoji:9999>')
                        .setRequired(false)
                        .setValue(product?.emoji || '🍊')
                )
            );

        await interaction.showModal(modal);
    } catch (error) {
        console.error('Error ModalBuilder SetRate A_CHII UPDATE', error);
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isModalSubmit() && interaction.customId.startsWith("rate_modal_app?")) {
            const selectedId = interaction.customId.split('?')[1];
            const products = LoadAppRateData();

            const product = products.find(p => p.id === selectedId);

            const price_app = interaction.fields.getTextInputValue('price_app');
            const rate_app = interaction.fields.getTextInputValue('rate_app');
            const emoji_app = interaction.fields.getTextInputValue('emoji_app');


            if (product) {
                product.price_me = rate_app;
                product.emoji = emoji_app;
                SaveAppRateData(products);
            }

            const embed = EmbedMenu();
            const select = await SelectMenu(interaction);
            await interaction.update({ embeds: [embed], components: [...select], flags: MessageFlags.Ephemeral });
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