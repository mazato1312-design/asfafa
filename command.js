

const fs = require('fs');
const path = require('path');
const client = require('../index');
const {  EmbedBuilder, MessageFlags } = require('discord.js');
const { EmbedHome, EmbedSelect, EmbedButton } = require('../A_CHII EMBED/EmbedHome');

const LoadMessageUpdate = () => {
    const Message_Path = path.join(__dirname, '../A_CHII LONG/Message_Update.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

const LoadSaveMessage = (Message_Update) => {
    const Message_Path = path.join(__dirname, '../A_CHII LONG/Message_Update.json');
    fs.writeFileSync(Message_Path, JSON.stringify(Message_Update, null, 2), 'utf8');
};

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
};

const LoadConnetData = () => {
    const Message_Path = path.join(__dirname, '../A_CHII_ConnetData.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isCommand() && interaction.commandName === 'application') {

            const ConnetPath = LoadConnetData();
            const DataUPDATE = LoadDataUPDATE();
            const Message_Update = LoadMessageUpdate();

            const UserADMIN = ConnetPath?.AdminID || ['NULL'];
            const Assistant = DataUPDATE?.Assistant || ['NULL'];

            const AllowedUser = [UserADMIN, ...Assistant];
            if (!AllowedUser.includes(interaction.user.id)) {
                const embed_error = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` การเปิดหน้าร้านบูสต์เกิดข้อผิดพลาด!!')
                    .setDescription('\`\`\`คำสั่งสำหรับแอดมินผู้ที่มีสิทธิ์เท่านั้น...\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed_error], flags: MessageFlags.Ephemeral });
            };

            const Channels = interaction.options.getChannel('channel');
            if (!Channels) {
                const embed_error = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` การเปิดหน้าร้านเกิดข้อผิดพลาด!!')
                    .setDescription('\`\`\`กรุณาส่งหน้าร้านระบุช่องให้ถูกต้อง...\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed_error], flags: MessageFlags.Ephemeral });
            }

            const emebd = EmbedHome();
            const rows = EmbedButton();
            const select = await EmbedSelect(interaction);
        
            const message = await Channels.send({ embeds: [emebd], components: [...select, rows] });
            Message_Update['Channel_ID'] = Channels.id;
            Message_Update['Message_ID'] = message.id;
            Message_Update['Servers_ID'] = Channels.guildId;
            LoadSaveMessage(Message_Update);

            const embed_notify = new EmbedBuilder()
                .setColor(0x33FF00)
                .setTitle('\`\`🍓\`\` คุณสร้างหน้าร้านแล้วนะ')
                .setDescription(`\`\`🍓\`\`**หน้าร้านของคุณอยู่ที่นี่** ${Channels}`)
                .setDescription('\`\`\`สามารถเข้าเยี่ยมชมหน้าร้านค้าได้แล้ว...\`\`\`')
                .setThumbnail(interaction.user.displayAvatarURL());
            await interaction.reply({ embeds: [embed_notify], flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.error('Error A_CHII COMMAND / Command', error);
    }
});