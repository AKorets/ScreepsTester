
    const { copyFileSync, constants } = require('fs');
    var serverPath = 'C:/Program Files (x86)/Steam/steamapps/common/Screeps/server';
    copyFileSync(serverPath+'/db.json', __dirname+'/assets/db.json');