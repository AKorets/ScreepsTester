(async function () {
    
    const { copyFileSync, constants } = require('fs');
    const { ScreepsServer, TerrainMatrix } = require('temp-screeps-server-mockup');
    const fs = require("fs");
    var path = require('path');
    // Load the full build.
    var _ = require('lodash');
    
    const log4js = require("log4js");
    log4js.configure({
      appenders: { console: { type: 'console'},
      log: { type: "file", filename: "simple.log" } },
      categories: { default: { appenders: ["log","console"], level: "trace" } }
    });
     
    const logger = log4js.getLogger("log");

    logger.info("--------------------------------------------");
    logger.info("started");
    
    try{
        var serverPath = 'C:/Program Files (x86)/Steam/steamapps/common/Screeps/server';
        const server = new ScreepsServer({path:serverPath, useAssets:false});
        
        logger.info("finished");
    } catch (err) {
        logger.error(err);
        console.error(err);
    } finally {
        process.exit();
    }
}());
