const fs = require('fs');
const path = require('path');
const client = require('../index');
const { DownloadImages } = require('../Utils/DownloadImages');
const { EmbedDiscription } = require('../A_CHII EMBED/EmbedDiscription');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

// 👇 import Embed + UpdateHome
const { EmbedHome, EmbedSelect, EmbedButton } = require('../A_CHII EMBED/EmbedHome');
const { UpdateHome } = require('../A_CHII LONG/Menu_Update');

const LoadAppRateData = () => {
  const filePath = path.join(__dirname, '../app_ratedata.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};

// ---------- ฟังก์ชันรีเซต ----------
async function resetHome(interaction) {
  // รีเฟรชโพสต์ที่ user กำลังกดอยู่
  const home = EmbedHome();
  const selects = await EmbedSelect(interaction);
  const buttons = EmbedButton();

  await interaction.update({
    embeds: [home],
    components: [...selects, buttons],
    files: [],
  });

  // 👇 รีเฟรชโพสต์ Home หลัก (Message_Update.json)
  await UpdateHome(interaction);
}

client.on('interactionCreate', async (interaction) => {
  try {
    // ---------- ปุ่ม "ล้างตัวเลือกใหม่" ----------
    if (interaction.isButton() && interaction.customId === 'clear_selection') {
      return resetHome(interaction);
    }

    // ---------- Select Menu ----------
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('select_product')) return;

    const selectedId = interaction.values[0];

    // กรณี clear_selection จาก dropdown
    if (selectedId === 'clear_selection') {
      return resetHome(interaction);
    }

    // เลือกสินค้า → แสดงรายละเอียด
    await interaction.deferReply({ ephemeral: true });

    const products = LoadAppRateData();
    const product = products.find((p) => p.id === selectedId);

    if (!product) {
      const embed_error = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('``❌`` ไม่พบสินค้าที่คุณเลือก!!')
        .setDescription('```รายการนี้ยังไม่พร้อมจำหน่าย```')
        .setThumbnail(interaction.user.displayAvatarURL());

      return await interaction.editReply({ embeds: [embed_error], components: [] });
    }

    const imageFolder = path.join(__dirname, '../A_CHII ICONAPP');
    const localImagePath = await DownloadImages(product.img, imageFolder);
    const attachment = new AttachmentBuilder(localImagePath);

    const { embed, row } = await EmbedDiscription(product, localImagePath);
    await interaction.editReply({
      embeds: [embed],
      components: [row],
      files: [attachment],
    });

  } catch (error) {
    console.error('Error A_CHII COMMAND / DISCRIPTION', error);
  }
});
