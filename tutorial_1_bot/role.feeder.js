/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.feeder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = _.filter(Game.creeps, (creep) => creep.memory.needEnerergy == true);
            if(targets.length > 0) {
                var transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
                //console.log(creep.name+' '+transferResult);
                if( transferResult== ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }else{
                 targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }});
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
               //console.log(creep.name+' no targets');
            }
        }
    }
};