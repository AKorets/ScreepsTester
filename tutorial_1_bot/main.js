var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
    }else {
         var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
         if(upgraders.length < 2){
         var newName = 'Upgrader' + Game.time;
         console.log('Spawning new upgrader: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
                        {memory: {role: 'upgrader'}});
        }
    }

    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
    
    var controller = Game.spawns['Spawn1'].room.controller;
    controller.room.visual.text('Tick '+Game.time+'\nLevel'+(controller.level+1)+' '+(controller.progress*100/controller.progressTotal)+'% Complete',
            controller.pos.x + 1,
            controller.pos.y,
            {align: 'left', opacity: 0.8});
}