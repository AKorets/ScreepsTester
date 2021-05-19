const log4js = require("log4js");
log4js.configure({
  appenders: { console: { type: 'console'},
  log: { type: "file", filename: "simple.log" } },
  categories: { default: { appenders: ["log","console"], level: "trace" } }
});
 
const logger = log4js.getLogger("log");

async function createBot(server, roomName){
    const fs = require("fs");
    var path = require('path');
    
    var botModules = {};
    var botPath = './tutorial_1_bot';
    //logger.info('readdirSync',fs.readdirSync(botPath));
    var array = fs.readdirSync(botPath).filter(function(file) {
        return path.extname(file).toLowerCase() === '.js';
    });
    
    //logger.info('array',array);
    
    array.forEach((el, index) => botModules[path.parse(el).name] = fs.readFileSync(botPath+"/"+el).toString());
    //logger.info('botModules',botModules);
    
    return await server.world.addBot({ username: 'Test1', room: roomName, x: 26, y: 10, modules:botModules });
}

(async function () {
    
    const { copyFileSync, constants } = require('fs');
    const { ScreepsServer, TerrainMatrix } = require('temp-screeps-server-mockup');
    
    // Load the full build.
    var _ = require('lodash');

    logger.info("--------------------------------------------");
    logger.info("started");
    
    try{
        var serverPath = 'C:/Program Files (x86)/Steam/steamapps/common/Screeps/server';
        const server = new ScreepsServer({path:serverPath, useAssets:false});
        
        copyFileSync(__dirname+'/assets/db-clean.json', serverPath+'/db.json');
        
        let roomName = 'W1N4';
        
        await server.start();
        
        const { db, env } = await server.world.load();
        
        const bot = await createBot(server, roomName);
        
        // Print console logs every tick
        bot.on('console', (logs, results, userid, username) => {
            _.each(logs, line => logger.info(`[console|${username}]`, line));
        });
        
        controller = (await db['rooms.objects'].find({room: roomName,  type: 'controller'}))[0];
        for (let i = 0; i < 2000 && controller.level<2; i++)
        {
            logger.info('[tick]', await server.world.gameTime,' ', controller.level);
            _.each(await bot.newNotifications, ({ message, type }) => logger.info('[notification]', message));
            logger.info('[memory]', await bot.memory);
            
            await server.tick();
            controller = (await db['rooms.objects'].find({room: roomName,  type: 'controller'}))[0];
            logger.info('controller.level', controller.level);
        }        
        
        logger.info("finished");
    } catch (err) {
        logger.error(err);
        console.error(err);
    } finally {
        process.exit();
    }
}());
