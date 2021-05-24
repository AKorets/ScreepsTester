const fs = require("fs");

function readCode(botPath){
    
    var path = require('path');    
    var botModules = {};
    var array = fs.readdirSync(botPath).filter(function(file) {
        return path.extname(file).toLowerCase() === '.js';
    });
    
    array.forEach((el, index) => botModules[path.parse(el).name] = fs.readFileSync(botPath+"/"+el).toString());    
    return botModules;    
}

async function createBot(server, roomName, botPath){
    
    var botModules = readCode(botPath);    
    return await server.world.addBot({ username: 'Test1', room: roomName, x: 26, y: 10, modules:botModules });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

(async function () {
    
    const { copyFileSync, constants } = require('fs');
    const { ScreepsServer, TerrainMatrix, User } = require('temp-screeps-server-mockup');
    
    // Load the full build.
    var _ = require('lodash');

    console.log("--------------------------------------------");
    console.log("started");
    
    try{
        var serverPath = './server';
        const server = new ScreepsServer({path:serverPath, useAssets:false});
        
        var targetDb = serverPath+'/db.json';
        copyFileSync(__dirname+'/assets/db-clean.json', targetDb);
        
        await server.start();    
        
        //create bot at room W1N4 using javascript from folder ./tutorial_1_bot
        let bot = await createBot(server, 'W1N4', './tutorial_1_bot');        
        
        // Print console logs every tick
        bot.on('console', (logs, results, userid, username) => {
            _.each(logs, line => console.log(`[console|${username}|${currentTick}]`, line));
        });
        
        var currentTick;
        const stats = fs.statSync(targetDb).mtimeMs;
        
        for (let i = 0; i < 350; i++)
        {
            currentTick = await server.world.gameTime;        
            await server.tick();
        }        
        
        lastModifiedDB = fs.statSync(targetDb).mtimeMs;
         
        _.each(await bot.notifications, ({ message, type }) => console.log('[notification]', message));
        console.log('ticks finished. tick tooken : '+currentTick);        
        
        console.log('waiting for database synch');
        while(fs.statSync(targetDb).mtimeMs==lastModifiedDB)
          sleep(2000);
      
        server.stop();
        console.log("finished");
    } catch (err) {
        logger.error(err);
        console.error(err);
    } finally {
        process.exit();
    }
}());
