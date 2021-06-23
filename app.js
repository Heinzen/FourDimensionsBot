const Discord = require('discord.js');
const EmbedMessage = require('./EmbedMessage');
const {prefix, token, this_bot_id, roomcall_message_id, armor_stack_message_id} = require('./config.json');
const CONSTANTS = require('./Strings_en');
const JsonUtils = require('./JsonUtils.js');
const SheetUtils = require('./SheetUtils.js');

const discordClient = new Discord.Client();

discordClient.login(token)

discordClient.once('ready', () => {
    console.log('Ready')
})

discordClient.on('message', async message => {
    if (isValidMessage(message)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase()

        if (command === 'newrun' && message.member.hasPermission("ADMINISTRATOR")) {
            message.delete();
            console.log("Sending embed messages.")
            let nextFriday = getDateByWeekday(5);
            nextFriday = "**" + ((nextFriday.getDate())) + "/" + (nextFriday.getMonth() + 1) + "/" + nextFriday.getFullYear() + " 21:45 BRT**";
            message.channel.send('@everyone');
            EmbedMessage.sendPanels(message, nextFriday);
        }

        if(command === 'collect' && message.member.hasPermission("ADMINISTRATOR")) {
            message.delete();
            console.log("Collecting funnel responses");
            collectAndSendFunnelResponses(message);
        }

        if(command === 'setmessageids' && message.member.hasPermission("ADMINISTRATOR")) {
            if(!args.length) {
                return message.channel.send(`${message.author} you missed some arguments.`);
            }
            if(args.length > 2) { 
                return message.channel.send(`${message.author} too many arguments.`);
            }
            JsonUtils.updateMessageIds(args[0], args[1]);
            return message.channel.send(`${message.author} updated message IDs to: ${args[0]}, ${args[1]}.`);
        }

        if(command === 'setbalancesheet' && message.member.hasPermission("ADMINISTRATOR")) {
            if(!args.length) {
                return message.channel.send(`${message.author} you missed some arguments.`);
            }
            if(args.length > 1) { 
                return message.channel.send(`${message.author} too many arguments.`);
            }
            JsonUtils.updateBalanceSheet(args[0]);
            return message.channel.send(`${message.author} updated balance sheet to: ${args[0]}.`);
        }

        if(command === 'balance') {
            if(!args.length) {
                return message.channel.send(`${message.author} por favor indique o nome do jogador à pesquisar "!balance <nickname>"`);
            }
            if(args.length > 1) { 
                return message.channel.send(`${message.author} você deve indicar apenas um jogador por vez.`);
            }
            console.log(`${message.author.username} requested balance for ${args[0]}.`)
            const balance = await SheetUtils.getBalanceByPlayerName(args[0]);

            if(balance === null) {
                const panel = EmbedMessage.createEmbed(CONSTANTS.TITLE,
                    `${message.author} solicitou saldo de ${args[0]}, porém \n`+CONSTANTS.DESCRIPTION_BALANCE_PLAYER_NOT_FOUND,
                    CONSTANTS.THUMBNAIL,
                    CONSTANTS.FOOTER);
                message.channel.send(panel);
                return;
            }
            const panel = EmbedMessage.createEmbed(CONSTANTS.TITLE,
                `${message.author} solicitou saldo de ${args[0]}\n`,
                CONSTANTS.THUMBNAIL,
                CONSTANTS.FOOTER);
            panel.addField("Jogador", args[0], true);
            panel.addField("Saldo", balance, true);
            message.channel.send(panel);
        }

        if(command === 'jogadores') {
            console.log(`${message.author} requested the list of players.`);
            const players = (await SheetUtils.getListOfPlayers()).toString();
            let aux = players.replace(/,/g, '\n');

            const panel = EmbedMessage.createEmbed(CONSTANTS.TITLE,
                `Lista de jogadores registrados nas tabelas de vendas:`,
                CONSTANTS.THUMBNAIL,
                CONSTANTS.FOOTER);
            panel.addField("Jogador", aux, true);
            message.channel.send(panel);

        }

        if(command === 'samba' && (message.member.hasPermission("ADMINISTRATOR") || message.member.id === "244977302109159425")) {
            const user = await discordClient.users.fetch("244977302109159425");
            message.channel.send(`<@${user.id}> Ó O NEGÃO Ó O NEGÃO Ó O NEGÃO Ó O NEGÃO `);
        }
    }
})

const getDateByWeekday = (dayOfWeek) => {
    /*
    0 = Sunday
    6 = Saturday
    */
    let date = new Date();
    date.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay())%7);
    return date;
}

const collectAndSendFunnelResponses = async (message) => {
    const guildEmojiCache = message.guild.emojis.cache;
    const userToReactionMap = new Map();
    let fetchedMessage = await findMessageById(message.channel, armor_stack_message_id);
    const reactionIds = await getReactionIdsFromMessage(fetchedMessage);
    
    for(id of reactionIds) { 
        const reactions = await getReactionsFromMessageById(fetchedMessage, id);
        const usersWhoReacted = await getMapOfUsersWhoReacted(reactions);
        userToReactionMap.set(guildEmojiCache.find(emoji => emoji.id === id).name, usersWhoReacted);
    }

    fetchedMessage = await findMessageById(message.channel, roomcall_message_id);
    const checkReactions = await getReactionsFromMessageById(fetchedMessage, CONSTANTS.CHECK_EMOJI_ID);
    const confirmedPlayers = await getMapOfUsersWhoReacted(checkReactions);

    const fields = createFieldsByUserMap(userToReactionMap, confirmedPlayers)
    EmbedMessage.sendFunnelResponsePanel(message, fields);
}

const createFieldsByUserMap = (map, confirmedPlayers) => {
    let tempArray = []
    let playerString = '\u200B';
    for(key of map.keys()) { 
        const players = Array.from(map.get(key));
        for (player of players){ 
            //ignore if response is sent by the bot
            if(player === this_bot_id) 
                continue;
            //ignore if player has not confirmed taking part in the run
            if(!confirmedPlayers.includes(player))
                continue;
            playerString += ('<@'+player+'>\n');
        }
        tempArray.push(EmbedMessage.buildEmbedField(key, playerString, true));
        playerString = '\u200B';
    }
    return tempArray;
}

const findMessageById = (channel, messageId) => {
    //Selects message the specific message by ID
    let promise = new Promise(async function(resolve, reject){
        try{ 
            await channel.messages.fetch(messageId, true).then(message => {
                console.log(`Successfully retrieved message of ID: ${messageId}`);
                resolve(message);
            })
        } catch(err) {
            console.log(err);
            reject(new Error(err));
        }
    });
    //After the promise is resolved, return the message or error
    promise.then(
        result => { return result },
        error => { console.log(error) }
    )
    return promise;
}

const getMapOfUsersWhoReacted = async (reactionCollection) => {
    const results = []
    for (const reaction of reactionCollection.array()) {
        results.push(...(await reaction.users.fetch()).keys())
    }
    return results;
}

const getReactionIdsFromMessage = async(message) => {
    let reactionIds = []
    message.reactions.cache.forEach(reaction => reactionIds.push(reaction.emoji.id));
    return reactionIds;
}

const getReactionsFromMessageById = async (message, reactionId) => {
    //Get all reactions in a given message
    console.log(`Attempting to collect reactions of ID ${reactionId} from message ${message.id}.`);
    let reactionCollection = message.reactions.cache.filter(reaction => reaction.emoji.id === reactionId);

    return reactionCollection;
}

const isValidMessage = (message) => {
    return (message.content.startsWith(prefix) || !message.author.bot)
}