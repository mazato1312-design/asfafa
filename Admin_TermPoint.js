
const fs = require('fs');
const path = require('path');
const client = require('../index');
const { GetBalance, LoadBalances, AddBalance, DeductBalance } = require('./BankBase');
const { EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputStyle, TextInputBuilder, ButtonStyle, ButtonBuilder, UserSelectMenuBuilder, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

const LoadConnetData = () => {
    const Message_Path = path.join(__dirname, '../A_CHII_ConnetData.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

const LoadMessageUpdate = () => {
    const Message_Path = path.join(__dirname, '../A_CHII LONG/Message_Update.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand && interaction.commandName === 'add_point') {
            const ConnetPath = LoadConnetData();
            const DataUPDATE = LoadDataUPDATE();
            const UserADMIN = ConnetPath?.AdminID || ['NULL'];
            const Assistant = DataUPDATE?.Assistant || ['NULL'];

            const AllowedUser = [UserADMIN, ...Assistant];
            if (!AllowedUser.includes(interaction.user.id)) {
                const embed_error = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` คุณไม่ได้รับอนุญาติสิทธิ์ใช้คำสั่งนี้!!')
                    .setDescription('\`\`\`คำสั่งสำหรับแอดมินผู้ที่มีสิทธิ์เท่านั้น...\`\`\`')
                    .setThumbnail(interaction.user.displayAvatarURL());
                return await interaction.reply({ embeds: [embed_error], flags: MessageFlags.Ephemeral });
            };

            const embed = new EmbedBuilder()
                .setColor(0x33CC00)
                .setTitle('[\`\`🍀\`\`] ตั้งค่าการเงินให้ลูกค้า [ ระบบแอดมิน ]')
                .setImage('https://s14.gifyu.com/images/bKE5T.png')

            const select = new ActionRowBuilder()
                .addComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId('select_user')
                        .setPlaceholder('|︲เลือกลูกค้า หรือ พิมพ์ชื่อสำหรับเติมเงิน︲|')
                        .setMinValues(1)
                        .setMaxValues(1)
                );
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('check_point')
                        .setLabel('💹︲เช็คยอดเงินลูกค้า︲')
                        .setStyle(ButtonStyle.Success)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('delete_amount')
                        .setLabel('⛔︲ลดยอดเงินลูกค้า︲')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({ embeds: [embed], components: [select, row], flags: MessageFlags.Ephemeral });
        }

    } catch (error) {
        console.error('Admin_TermPoint COMMAND ERROR', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isUserSelectMenu() && interaction.customId === 'select_user') {
        const selectedUserId = interaction.values[0];
        const modal = new ModalBuilder()
            .setCustomId(`submituser_modals?${selectedUserId}`)
            .setTitle('︲เติมเงินให้กับลูกค้าของเรา︲')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('message_price')
                        .setLabel('[ 💰จำนวนเงินที่ต้องการเติม ]')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('ตัวเลขตัวอย่าง 10.00')
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    try {
    if (interaction.isModalSubmit() && interaction.customId.startsWith('submituser_modals?')) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const AmountString = interaction.fields.getTextInputValue('message_price');
        const SelectedUserId = interaction.customId.split('?')[1];
        const amount = parseFloat(AmountString);
        const amountFormatted = amount.toFixed(2);
        const DataUPDATE = LoadDataUPDATE();
        const Message_Update = LoadMessageUpdate();
        const user = await client.users.fetch(SelectedUserId);

        if (!/^\d+(\.\d{1,2})?$/.test(AmountString)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` กรุณาระบุจำนวนเงินเป็นตัวเลขเท่านั้น!!')
                .setDescription('\`\`\`ห้ามป้อนเครื่องหมายที่ไม่ใช่จำนวนตัวเลข\`\`\`')
                .setThumbnail(user.displayAvatarURL());
            return await interaction.editReply({ embeds: [embed] });
        }

        if (!interaction.guild) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` ไม่สามารถทำรายการนี้ทาง DM ได้')
                .setDescription('\`\`\`กรุณาใช้คำสั่งนี้ที่ร้านเซิร์ฟของคุณเท่านั้น!\`\`\`')
                .setThumbnail(user.displayAvatarURL())
            return await interaction.editReply({ embeds: [embed] });
        }

        const newBalance = AddBalance(SelectedUserId, amountFormatted);
        const embeds_tw1 = new EmbedBuilder()
            .setColor(0x33CC66)
            .setTitle(`เติมเงินสำเร็จโดยแอดมิน [ แอดมินระบบ ]`)
            .setDescription(`**เติมเงินให้ผู้ใช้งาน** <@${SelectedUserId}>`)
            .addFields({ name: `**ได้รับเงินจำนวน**`, value: `\`\`\` ${amountFormatted} บาท \`\`\``, inline: false })
            .addFields({ name: `**ยอดเงินคงเหลือ**`, value: `\`\`\` ${newBalance} บาท \`\`\``, inline: false })
            .setThumbnail(`${user.displayAvatarURL()}`);
        interaction.editReply({ embeds: [embeds_tw1] });

        const Topup_Notify = DataUPDATE?.Channel_Notify_Topup || '';

        const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
        const [date, time] = thailandTime.split(', ');
        const formattedDate = date.replace(/\//g, '-');

        const channelID = interaction.guild.channels.cache.get(Topup_Notify);
        if (channelID) {
            const Channel_Notify = new EmbedBuilder()
                .setColor(0x33CC66)
                .setTitle("เติมเงินสำเร็จ [ ผ่านแอดมิน ]")
                .setDescription([
                    `**ผู้ใช้ :** <@${SelectedUserId}>`,
                    `**จำนวนเงิน :** \`\` ${amountFormatted} บาท \`\``,
                    `**ผ่านแอดมิน :** \`\` แอดมินระบบ \`\``,
                    `**ชำระโดย :** \`\` ${user.username.split('_').map(word => word.toUpperCase()).join('_').slice(0, 10)} \`\``
                ].join('\n'))
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
            await channelID.send({ embeds: [Channel_Notify] });
        }

        const embed_user = new EmbedBuilder()
            .setColor(0x33CC66)
            .setTitle('<a:UNIVERSE70_1377536445073330196:1396667226345443508> เติมเงินสำเร็จ [ ผ่านแอดมิน ]')
            .setDescription([
                `**ผู้ใช้ :** <@${SelectedUserId}>`,
                `**จำนวนเงิน :** \`\` ${amountFormatted} บาท \`\``,
                `**ยอดเงินคงเหลือ : **\`\` ${newBalance} บาท \`\``,
                `**ผ่านแอดมิน :** \`\` แอดมินระบบ \`\``,
                `**ชำระโดย :** \`\` ${user.username.split('_').map(word => word.toUpperCase()).join('_').slice(0, 10)} \`\``
            ].join('\n'))
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
        await user.send({ embeds: [embed_user] }).catch(() => null);

        const Role_Success = DataUPDATE?.Role_Topup_ID;
        const GuildId = Message_Update?.Servers_ID || interaction.guild.id;
        let guild = client.guilds.cache.get(GuildId);
        if (!guild) return;
        const member = await guild.members.fetch(user.id);
        if (!member) return;
        const role = guild.roles.cache.get(Role_Success);
        try {
            if (role) {
                await member.roles.add(role).catch(() => null);
            }
        } catch (error) {
            if (error.code === 50013) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('\`\`❌\`\` เติมเงินสำเร็จแต่ยศไม่ถูกเพิ่ม')
                    .setDescription('\`\`\`ไม่สามารถให้ยศหลังเติมเงินได้ กรุณาปรับบอทให้สูงกว่ายศนี้ก่อน!\`\`\`')
                    .setThumbnail(user.displayAvatarURL())
                await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else {
                console.error('Error ADD Role isModalSubmit Admin_TermPoint', error);
            }
        }
    }
    } catch (error){
        console.error(' Error Admin_TermPoint Admin Topup Submodals', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton() && interaction.customId === 'check_point') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const embed = new EmbedBuilder()
            .setColor(0x33CC00)
            .setTitle('\`\`💹\`\` เช็คยอดเงินคงเหลือ [ ระบบแอดมิน ]')
            .setImage('https://s14.gifyu.com/images/bKhKu.png')

        const row = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('select_user_point')
                    .setPlaceholder('|︲เลือกลูกค้า หรือ พิมพ์ชื่อสำหรับเช็คยอดเงิน︲|')
                    .setMinValues(1)
                    .setMaxValues(1)
            );
        await interaction.editReply({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isUserSelectMenu() && interaction.customId === 'select_user_point') {
        await LoadBalances();
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const SelectedUserId = interaction.values[0];
        const user = await client.users.fetch(SelectedUserId).catch(() => null);
        const balance = GetBalance(SelectedUserId);
        const formattedBalance = parseFloat(balance || '0.00').toFixed(2);
        const updatedEmbed = new EmbedBuilder()
            .setColor(0x33FF00)
            .setAuthor({ name: `${user.username.split('_').map(word => word.toUpperCase()).join('_')}︲เช็คยอดเงิน`, iconURL: `${user.displayAvatarURL()}` })
            .setDescription(`\`\`\`ยอดเงินคงเหลือ ${formattedBalance} บาท \`\`\``)
            .setThumbnail(`${user.displayAvatarURL()}`)
            .setImage('https://www.animatedimages.org/data/media/562/animated-line-image-0124.gif');
        await interaction.editReply({ embeds: [updatedEmbed] });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton() && interaction.customId === 'delete_amount') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const embed = new EmbedBuilder()
            .setColor(0x33CC00)
            .setTitle('[\`\`⛔\`\`] ลดยอดเงินให้กับลูกค้า [ ระบบแอดมิน ]')
            .setImage('https://s14.gifyu.com/images/bKh9k.png')
        const row = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('select_delete_amount')
                    .setPlaceholder('|︲เลือกผู้ใช้ หรือ พิมพ์ชื่อสำหรับลดยอดเงิน︲|')
                    .setMinValues(1)
                    .setMaxValues(1)
            );
        await interaction.editReply({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isUserSelectMenu() && interaction.customId === 'select_delete_amount') {
        const selectedUserId = interaction.values[0];
        const balance = GetBalance(selectedUserId);
        const formattedBalance = parseFloat(balance || '0.00').toFixed(2);
        const modal = new ModalBuilder()
            .setCustomId(`submitdelete_modals:${selectedUserId}`)
            .setTitle('ระบบลดยอดเงินผู้ใช้งาน')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('message_delete')
                        .setLabel('[ 💰จำนวนเงินที่ต้องการลด ]')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('ตัวอย่าง 10.00')
                        .setValue(formattedBalance)
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId.startsWith('submitdelete_modals:')) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const SelectedUserId = interaction.customId.split(':')[1];
        const Deduct_Amount = interaction.fields.getTextInputValue("message_delete");
        const DataUPDATE = LoadDataUPDATE();
        const amount = parseFloat(Deduct_Amount);
        const amountFormatted = amount.toFixed(2);

        const user = await client.users.fetch(SelectedUserId).catch(() => null);

        if (!/^\d+(\.\d{1,2})?$/.test(Deduct_Amount)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` กรุณาระบุจำนวนเงินเป็นตัวเลขเท่านั้น!!')
                .setDescription('\`\`\`ห้ามป้อนเครื่องหมายที่ไม่ใช่จำนวนตัวเลข\`\`\`')
                .setThumbnail(user.displayAvatarURL());
            return await interaction.editReply({ embeds: [embed] });
        }

        const Balance = parseFloat(GetBalance(SelectedUserId));
        const price = parseFloat(amountFormatted);
        const formattedBalance = parseFloat(Balance - price).toFixed(2);
        const success = DeductBalance(SelectedUserId, price);

        if (isNaN(Balance)) {
            const embed = new EmbedBuilder()
                .setColor(0x33FF00)
                .setTitle(`\`\`❌\`\` เกิดข้อผิดพลาดสำหรับลดยอดเงิน`)
                .setDescription('\`\`\`ลูกค้ารายนี้ต้องเติมเงินเพื่อเปิดบัญชีก่อน\`\`\`')
                .setThumbnail(user.displayAvatarURL())
            return await interaction.editReply({ embeds: [embed] });
        }

        if (!success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF3300)
                .setTitle(`\`\`❌\`\` กรุณาหลีกเลี่ยงทำให้จำนวนเงินติดลบ`)
                .setDescription('\`\`\`หากลดยอดเงินเกินจำนวนในบัญชีที่มีอยู่ระวังยอดเงินติดลบ\`\`\`')
                .setThumbnail(user.displayAvatarURL())
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(Deduct_Amount) || parseFloat(Deduct_Amount) <= 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFF3300)
                .setTitle(`\`\`❌\`\` กรุณาลดยอดเงินผู้ใช้งานให้มากกว่าที่กำหนด`)
                .setDescription(`\`\`\`กรุณาระบุจำนวนเงินให้ถูกต้อง และต้องมากกว่า 0.00\`\`\``)
                .setThumbnail(user.displayAvatarURL());
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!interaction.guild) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` ไม่สามารถทำรายการนี้ทาง DM ได้')
                .setDescription('\`\`\`กรุณาใช้คำสั่งนี้ที่ร้านเซิร์ฟของคุณเท่านั้น!\`\`\`')
                .setThumbnail(user.displayAvatarURL())
            return await interaction.editReply({ embeds: [embed] });
        }

        const embeds_user = new EmbedBuilder()
            .setColor(0x33CC66)
            .setTitle(`ลดยอดเงินสำเร็จ [ ระบบแอดมิน ]`)
            .addFields({ name: "จำนวนเงินที่ลดลง", value: `\`\`\` ${amountFormatted} / ${formattedBalance} \`\`\``, inline: false })
            .addFields({ name: "ยอดเงินคงเหลือ", value: `\`\`\` ${formattedBalance} บาท \`\`\``, inline: false })
            .setThumbnail(user.displayAvatarURL());
        await interaction.editReply({ embeds: [embeds_user] });

        const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
        const [date, time] = thailandTime.split(', ');
        const formattedDate = date.replace(/\//g, '-');

        const embeds_send = new EmbedBuilder()
            .setColor(0x33CC66)
            .setTitle(`หักยอดเงินแล้ว [ โดยแอดมิน ]`)
            .addFields({ name: "จำนวนเงินที่ลดลง", value: `\`\`\` ${amountFormatted} / ${formattedBalance} \`\`\``, inline: false })
            .addFields({ name: "ยอดเงินคงเหลือ", value: `\`\`\` ${formattedBalance} บาท \`\`\``, inline: false })
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
        await interaction.editReply({ embeds: [embeds_user] });

        await user.send({ embeds: [embeds_send] }).catch(() => null);

        const Topup_Notify = DataUPDATE?.Channel_Notify_Topup || '';
        const channelID = interaction.guild.channels.cache.get(Topup_Notify);
        if (channelID) {
            const Channel_Notify = new EmbedBuilder()
                .setColor(0x33CC66)
                .setTitle("หักยอดเงินสำเร็จ [ โดยแอดมิน ]")
                .setDescription([`**ผู้ใช้ :** <@${SelectedUserId}>`,
                    `**จำนวนเงิน :** \`\` ${amountFormatted} บาท \`\``,
                    `**ผ่านแอดมิน :** \`\` แอดมินระบบ \`\``,
                    `**ชำระโดย :** \`\` ${user.username.split('_').map(word => word.toUpperCase()).join('_').slice(0, 10)} \`\``
                ].join('\n'))
                .setThumbnail(`${user.displayAvatarURL()}`)
                .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
            await channelID.send({ embeds: [Channel_Notify] });
        }
    }
});