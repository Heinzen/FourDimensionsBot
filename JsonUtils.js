const fs = require('fs');
const fileName = 'config.json';

const updateMessageIds = (roomcallid, lootfunnelid) => {
    try {
        const dataBuffer = fs.readFileSync(fileName);
        const dataJSON = dataBuffer.toString();
        const config = JSON.parse(dataJSON);

        config.roomcall_message_id = roomcallid;
        config.armor_stack_message_id = lootfunnelid;

        const configJSON = JSON.stringify(config);
        fs.writeFileSync(fileName, configJSON);
    } catch(err) {
        console.log(err)
    }
};

const updateBalanceSheet = (balanceSheet) => { 
    try {
        const dataBuffer = fs.readFileSync(fileName);
        const dataJSON = dataBuffer.toString();
        const config = JSON.parse(dataJSON);

        config.balancesheet = balanceSheet;

        const configJSON = JSON.stringify(config);
        fs.writeFileSync(fileName, configJSON);
    } catch(err) {
        console.log(err)
    }
}

const getPlayerBalance = (playerName) => {
    try {
        let dataBuffer = fs.readFileSync(fileName);
        let dataJSON = dataBuffer.toString();
        const config = JSON.parse(dataJSON);
        
        dataBuffer = fs.readFileSync(config.playerbalancefilename);
        dataJSON = dataBuffer.toString();
        const playerbalance = JSON.parse(dataJSON);
        console.log(`Retriving balance of ${playerName}`);
        
        return playerbalance[playerName];
    } catch(err) {
        console.log(err)
    }
}

exports.updateMessageIds = updateMessageIds
exports.updateBalanceSheet = updateBalanceSheet
exports.getPlayerBalance = getPlayerBalance