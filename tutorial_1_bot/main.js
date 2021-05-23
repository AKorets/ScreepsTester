
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleStaticUpgrader = require('role.staticUpgrader');

role = {'harvester':roleHarvester,'upgrader':roleUpgrader,'staticUpgrader':roleStaticUpgrader,
            'feeder':require('role.feeder')
}


var BODYPART_COST = {
  "move": 50,
  "carry": 50,
  "work": 20,
  "heal": 200,
  "tough": 20,
  "attack": 80,
  "ranged_attack": 150
}; 

function bodyCost (body) {
    //console.log(JSON.stringify(BODYPART_COST));
    var cost = 0;
    _.forEach(body, function(part) { 
                cost += BODYPART_COST[part]; //console.log('bodyCost cost:'+cost+' after part:'+part); 
                });
    return cost;
}

function createCreep(gameSpawner, newName, role, body){
    //let expectedCost = bodyCost(body);
    let preResult = gameSpawner.spawnCreep(body, newName, {dryRun:true});
    
    if(preResult == OK){
        console.log('Spawning ' + newName);
        let result = gameSpawner.spawnCreep(body, newName, {memory: {role:role}});
    }
}

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    var gameSpawner = Game.spawns['Spawn1'];
    if(!gameSpawner.memory.sources){
        var sources = gameSpawner.room.find(FIND_SOURCES);
        console.log('searching sources '+sources.length);
        gameSpawner.memory.sources = []
        gameSpawner.memory.closestSource = sources[0].id
        gameSpawner.memory.closestSourceRange = gameSpawner.pos.getRangeTo(gameSpawner.memory.closestSource)
        for(var source in sources){
            gameSpawner.memory.sources.push(sources[source].id);
            let closestSourceRange = gameSpawner.pos.getRangeTo(sources[source]);
            if(closestSourceRange < gameSpawner.memory.closestSourceRange){
                gameSpawner.memory.closestSource = sources[source].id
                gameSpawner.memory.closestSourceRange = gameSpawner.pos.getRangeTo(gameSpawner.memory.closestSource)
            }
            //console.log('range from game spawner to '+sources[source].id+' is '+closestSourceRange)
        }
        console.log(`sources found in the room ${gameSpawner.room.name} : ${gameSpawner.memory.sources}, range to closest to spawner `+gameSpawner.pos.getRangeTo(Game.getObjectById(gameSpawner.memory.closestSource)));
    }      

    if(gameSpawner.spawning) {
        var spawningCreep = Game.creeps[gameSpawner.spawning.name];
        gameSpawner.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            gameSpawner.pos.x + 1,
            gameSpawner.pos.y,
            {align: 'left', opacity: 0.8});
    }else{
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        if(harvesters.length < 2) {
            createCreep(gameSpawner, 'Harvester'+ Game.time, 'harvester', [WORK,WORK,CARRY,MOVE]);
        }else {
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            if(upgraders.length < 0){//don't create upgraders
                createCreep(gameSpawner, 'Upgrader' + Game.time, 'upgrader', [WORK,CARRY,MOVE]);
            }else if(_.filter(Game.creeps, (creep) => creep.memory.role == 'staticUpgrader').length<1){
                createCreep(gameSpawner, 'SUpgrader' + Game.time, 'staticUpgrader', [WORK,WORK,CARRY,MOVE]);
            }else if(_.filter(Game.creeps, (creep) => creep.memory.role == 'feeder').length<2){
                createCreep(gameSpawner, 'Feeder' + Game.time, 'feeder', [WORK,CARRY,MOVE,MOVE]);
            }
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        role[creep.memory.role].run(creep);
    }
    
    var controller = gameSpawner.room.controller;
    
    let progress = (controller.progress*100/controller.progressTotal).toFixed(0);
    if(progress!=Memory.controllerLastProgress){
        let p = controller.level==1?10:1;
        if(progress%p==0){
            var tickDistance;
            if( progress != 0 ){
                tickDistance = Game.time - Memory.controllerPrintedProgressTick;
                console.log(progress+'% of controller level '+(controller.level+1)+' tickDistance : '+tickDistance+' progress : '+(controller.progress - Memory.controllerPrintedProgress));
            }else {
                tickDistance = 0;
                console.log(progress+'% of controller level '+(controller.level+1));
            }
            Memory.controllerPrintedProgressTick = Game.time;
            Memory.controllerPrintedProgress = controller.progress;
        }
        Memory.controllerLastProgress = progress; 
    }
    controller.room.visual.text('Tick '+Game.time+'\nLevel'+(controller.level+1)+' '+progress+'% Complete',
            controller.pos.x + 1,
            controller.pos.y,
            {align: 'left', opacity: 0.8});
}