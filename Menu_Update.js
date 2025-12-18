const fs = require('fs');
const path = require('path');
const client = require('../index');
const { EmbedHome, EmbedSelect, EmbedButton } = require('../A_CHII EMBED/EmbedHome');

const LoadMessageUpdate = () => {
    const Message_Path = path.join(__dirname, './Message_Update.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

async function UpdateHome(interaction) {
    try {
        const Message_Update = LoadMessageUpdate();
        const channel = await client.channels.fetch(Message_Update?.Channel_ID);
        const message = await channel.messages.fetch(Message_Update?.Message_ID);
        await message.edit({ embeds: [EmbedHome()], components: [...await EmbedSelect(interaction), EmbedButton()] });
        
    } catch (error) {
        console.error('Error A_CHII LONG / Menu_Update', error);
    }
}

module.exports = { UpdateHome };