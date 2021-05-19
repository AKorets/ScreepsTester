(async function () {
    
    const { copyFileSync, constants } = require('fs');
    
    const log4js = require("log4js");
    log4js.configure({
      appenders: { console: {
      type: 'console'
    },log: { type: "file", filename: "simple.log" } },
      categories: { default: { appenders: ["log","console"], level: "trace" } }
    });
     
    const logger = log4js.getLogger("log");

    logger.info("--------------------------------------------");
    logger.info("started");
}());
