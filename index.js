const log4js = require("log4js");
log4js.configure({
  appenders: { console: { type: 'console'},
  log: { type: "file", filename: "simple.log" } },
  categories: { default: { appenders: ["log","console"], level: "trace" } }
});

const fs = require("fs");
 
const logger = log4js.getLogger("log");

function GetSteamId(){
    path = 'steamID.txt';
    if (fs.existsSync(path)) {
        return fs.readFileSync(path).toString();
    }
    return "";
}


function readCode(){
    
    var path = require('path');    
    var botModules = {};
    var botPath = './tutorial_1_bot';
    var array = fs.readdirSync(botPath).filter(function(file) {
        return path.extname(file).toLowerCase() === '.js';
    });
    
    array.forEach((el, index) => botModules[path.parse(el).name] = fs.readFileSync(botPath+"/"+el).toString());    
    return botModules;    
}

async function createBot(server, roomName){
    
    var botModules = readCode();    
    return await server.world.addBot({ steamId:GetSteamId(), username: 'Test1', room: roomName, x: 26, y: 10, modules:botModules });
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

    logger.info("--------------------------------------------");
    logger.info("started");
    
    try{
        var serverPath = 'C:/Program Files (x86)/Steam/steamapps/common/Screeps/server';
        const server = new ScreepsServer({path:serverPath, useAssets:false});
        var targetDb = serverPath+'/db.json';
        
        //copyFileSync(__dirname+'/assets/db small program.json', serverPath+'/db.json');
        //copyFileSync(__dirname+'/assets/db W1N4 base.json', serverPath+'/db.json');
        copyFileSync(__dirname+'/assets/db-clean.json', targetDb);
        
        let roomName = 'W1N4';
        let debugTicks = false;
        let debugMemory = false;
        
        await server.start();
        
        const { db, env } = await server.world.load();
        
        
        //db['users.code'].insert({ user: user._id, branch: 'default', modules, activeWorld: true }),
        
        var bot = '';
        
        controller = (await db['rooms.objects'].find({room: roomName,  type: 'controller'}))[0];
        var user_id = controller.user;
        if(user_id ){
            throw new Error(`room ${roomName} already in use`);
        }else{
            bot = await createBot(server, roomName);
        }
        
        var currentTick = await server.world.gameTime;
        // Print console logs every tick
        bot.on('console', (logs, results, userid, username) => {
            _.each(logs, line => logger.info(`[console|${username}|${currentTick}]`, line));
        });
        
        const stats = fs.statSync(targetDb).mtimeMs;
        
        
        controller = (await db['rooms.objects'].find({room: roomName,  type: 'controller'}))[0];
        for (let i = 0; i < 2000 && controller.level<2; i++)
        {
            currentTick = await server.world.gameTime;
            if(debugTicks) {
                logger.info('[tick]', currentTick,' ', controller.level);
            }
            _.each(await bot.newNotifications, ({ message, type }) => logger.info('[notification]', message));
            if(debugMemory){
                logger.info('[memory]', await bot.memory);
            }
            
            await server.tick();
            controller = (await db['rooms.objects'].find({room: roomName,  type: 'controller'}))[0];
        }        
        
        lastModifiedDB = fs.statSync(targetDb).mtimeMs;
        logger.info('ticks finished. tick tooken : '+currentTick);
        _.each(await bot.notifications, ({ message, type }) => logger.info('[notification]', message));
        
        
        logger.info('waiting for database synch');
        while(fs.statSync(targetDb).mtimeMs==lastModifiedDB)
          sleep(2000);
        
        //logger.info(server.config.common.storage);
        //db.saveDatabase();
        server.stop();
        logger.info("finished");
    } catch (err) {
        logger.error(err);
        console.error(err);
    } finally {
        process.exit();
    }
}());
