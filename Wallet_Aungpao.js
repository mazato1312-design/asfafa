const fs = require('fs');
const path = require('path');
const client = require('../index');
const { AddBalance } = require('./BankBase');
const { PAPIKACHII_VOUCHER } = require('papika-fetcher');
const { TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, MessageFlags } = require('discord.js');

const LoadDataUPDATE = () => {
    const Message_Path = path.join(__dirname, '../A_CHII UPDATE/LogDataBase.json');
    const MessageData = JSON.parse(fs.readFileSync(Message_Path, 'utf8'));
    return MessageData;
}

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'teram_topup') {
            const selectedValue = interaction.values[0];
            if (selectedValue === 'เติมวอเลต') {
                const modal_wallet = new ModalBuilder()
                    .setCustomId('wallet_modal')
                    .setTitle('🧧 เติมผ่านทรูมันนี่อั่งเปา')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('codeInput')
                                .setLabel('[ 🧧 กรอกลิงค์ซองอังเปา ]')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('https://gift.truemoney.com/campaign/?v=xxxxxxxxxxxxxxx')
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal_wallet);
            }
        }
    } catch (error) {
        console.error('ERROR Wallet_Aungpao', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit() && interaction.customId === 'wallet_modal') {
        const codeInput = interaction.fields.getTextInputValue('codeInput');

        if (!codeInput.startsWith('https://gift.truemoney.com/campaign')) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('\`\`❌\`\` กรุณากรอกลิงค์ที่อยู่ซองอั่งเปาให้ถูกต้อง!!')
                .setDescription(`\`\`\`${codeInput}\`\`\``)
                .setThumbnail(interaction.user.displayAvatarURL())
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const DATE_BASE = LoadDataUPDATE();
        const PHONE_WALLET = DATE_BASE?.PhoneTrue_Wallet || 'รอเพิ่ม';
        const Topup_Notify = DATE_BASE?.Channel_Notify_Topup || '';
        const Role_success = DATE_BASE?.Role_Topup_ID || 'รอเพิ่ม';

        const Cover_Link = codeInput.split('v=').pop();
        const WalletPath = `https://gift.truemoney.com/campaign/?v=${Cover_Link}`

        async function GetWallet_AUNPAO(WalletPath) {
            try {
                const res = await PAPIKACHII_VOUCHER(WalletPath, `${PHONE_WALLET}`);
                if (res?.ok) {
                    switch (res.ok) {
                        case 'success':
                            const userId = interaction.user.id;
                            const amountToAdd = res.amount;
                            const newBalance = AddBalance(userId, amountToAdd);

                            const embeds_tw1 = new EmbedBuilder()
                                .setColor(0x33CC66)
                                .setTitle('คุณเติมเงินสำเร็จ [ ซองอั่งเปา ]')
                                .addFields({ name: '**คุณได้เติมเงิน**', value: `\`\`\` ${amountToAdd} บาท \`\`\``, inline: false })
                                .addFields({ name: '**ยอดเงินคงเหลือ**', value: `\`\`\` ${newBalance} บาท \`\`\``, inline: false })
                                .setThumbnail(`${interaction.user.displayAvatarURL()}`);

                            interaction.reply({ embeds: [embeds_tw1], flags: MessageFlags.Ephemeral });
                            const role = interaction.guild.roles.cache.get(Role_success);

                            if (role) {
                                await interaction.member.roles.add(role).catch(() => null);
                            }

                            const thailandTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
                            const [date, time] = thailandTime.split(', ');
                            const formattedDate = date.replace(/\//g, '-');

                            const normalizeName = name => name.replace(/^(Mr|Ms|Mrs|Dr|นาย|นางสาว|นาง|น.ส.|ด.ช.|ด.ญ.|สาว)\s*/i, '').trim();
                            const cleanedName = `${normalizeName(res.name_owner || 'ด.ช. ไม่พบชื่อ'.split(' ')[0])}`;

                            const channelID = interaction.guild.channels.cache.get(Topup_Notify);
                            if (channelID) {
                                const Channel_donate = new EmbedBuilder()
                                    .setColor(0x33CC66)
                                    .setTitle("เติมเงินสำเร็จ [ ซองอั่งเปา ]")
                                    .setDescription([`**คุณลูกค้า :** <@${userId}>`,
                                        `**จำนวนเงิน :** \`\` ${amountToAdd} บาท \`\``,
                                        `**ผ่านวอเลต :** \`\` ซองอั่งเปา \`\``,
                                        `**ชำระโดย :** \`\` ${cleanedName} \`\``
                                    ].join('\n'))
                                    .setThumbnail(`${interaction.user.displayAvatarURL()}`)
                                    .setFooter({ text: `[🕐] เวลาทำรายการ : ${time} ${formattedDate}` });
                                await channelID.send({ embeds: [Channel_donate] });
                            }
                            break;

                        default:
                            const embeds_error = new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle(`\`\`❌\`\` เกิดข้อผิดพลาดคำขอที่ไม่รู้จัก`)
                            interaction.reply({ embeds: [embeds_error], flags: MessageFlags.Ephemeral });
                            break;
                    }
                } else if (res?.errorData) {
                    let embed = new EmbedBuilder().setColor(0xFF0000);
                    embed.setTitle(`\`\`❌\`\` เกิดข้อผิดพลาดที่ไม่รู้จัก`);
                    const errorMessages = {
                        1000: res.mes_err,
                        1001: res.mes_err,
                        1002: res.mes_err,
                        1003: res.mes_err,
                        1004: res.mes_err,
                        1005: res.mes_err,
                        1006: res.mes_err,
                    };
                    if (errorMessages[res.errorData]) {
                        embed.setTitle(`\`\`❌\`\` ${errorMessages[res.errorData]}`);
                    }
                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
            } catch (error) {
                console.error('Error API Wallet_Aungpao', error);
            }
        }
        GetWallet_AUNPAO(WalletPath);
    }
});

