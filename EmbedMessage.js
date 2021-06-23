const Discord = require('discord.js');
const CONSTANTS = require('./Strings_en');
const JsonUtils = require('./JsonUtils.js')


const createEmbedWithField = (title, description, thumbnail, footer, fields) => {
	return new Discord.MessageEmbed().setColor("#41C2FF")
									 .setTitle(title)
									 .setDescription(description)
									 .addFields(fields)
									 .setTimestamp()
									 .setFooter(footer)
									 .setThumbnail(thumbnail);

}

const createEmbed = (title, description, thumbnail, footer) => {
	return new Discord.MessageEmbed().setColor("#41C2FF")
									 .setTitle(title)
									 .setDescription(description)
									 .setTimestamp()
									 .setFooter(footer)
									 .setThumbnail(thumbnail);

}

const sendFunnelResponsePanel = (message, fields) => {
    console.log(fields);
    const panel = createEmbed(CONSTANTS.TITLE_FUNNEL, 
        CONSTANTS.DESCRIPTION_FUNNEL_COLLECT, 
        CONSTANTS.THUMBNAIL, 
        CONSTANTS.FOOTER);

    fields.forEach(entry => panel.addField(entry.name, entry.value, entry.inline));

    message.channel.send(panel);
}

const sendPanels = async (message, date) => {
    try {
        let scheduleMessage;
        let armorFunnelMessage;
        let dateField = buildEmbedField('Data', date, false);
        const schedulePanel = createEmbedWithField(CONSTANTS.TITLE, 
            CONSTANTS.DESCRIPTION, 
            CONSTANTS.THUMBNAIL, 
            CONSTANTS.FOOTER,
            dateField);
        scheduleMessage = await message.channel.send(schedulePanel);
        await scheduleMessage.react(CONSTANTS.CHECK_EMOJI_ID);
        await scheduleMessage.react(CONSTANTS.NEGATIVE_EMOJI_ID);

        const funnelPanel = createEmbed(CONSTANTS.TITLE_FUNNEL, 
            CONSTANTS.DESCRIPTION_FUNNEL, 
            CONSTANTS.THUMBNAIL, 
            CONSTANTS.FOOTER);
        armorFunnelMessage = await message.channel.send(funnelPanel);
        await armorFunnelMessage.react(CONSTANTS.CLOTH_EMOJI_ID); 
        await armorFunnelMessage.react(CONSTANTS.LEATHER_EMOJI_ID);
        await armorFunnelMessage.react(CONSTANTS.MAIL_EMOJI_ID);
        await armorFunnelMessage.react(CONSTANTS.PLATE_EMOJI_ID);

        JsonUtils.updateMessageIds(scheduleMessage.id, armorFunnelMessage.id);
    } catch (err) {
        console.error(err);
    }
}

const buildEmbedField = (k, v, i) => {
    return { name: k, value: v, inline: i};
}

exports.createEmbed = createEmbed;
exports.createEmbedWithField = createEmbedWithField;
exports.sendFunnelResponsePanel = sendFunnelResponsePanel;
exports.sendPanels = sendPanels;
exports.buildEmbedField = buildEmbedField;