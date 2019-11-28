const fs = require('fs');

function _extend() {
    var dst = arguments[0];
    var srcs = Array.prototype.slice.call(arguments, 1);
    srcs.forEach(function(src) {
        for(var i in src) {
            dst[i] = src[i];
        }
    });
    return dst;
}


var _docs = {
    store: {
        store: {
            "!doc": "A Store object that contains cargo of this creep.",
            "!type": "+Store"
        }
    }
};

_extend(_docs, {
    pathfindingOptions:  {
        roomCallback: {
            "!doc": "Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix. If you return false from the callback the requested room will not be searched, and it won't count against maxRooms",
            "!type": "fn(roomName: string) -> +CostMatrix"
        },
        plainCost: {
            "!doc": "Cost for walking on plain positions. The default is 1.",
            "!type": "number"
        },
        swampCost: {
            "!doc": "Cost for walking on swamp positions. The default is 5.",
            "!type": "number"
        },
        flee: {
            "!doc": "Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.",
            "!type": "bool"
        },
        maxOps: {
            "!doc": "The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.",
            "!type": "number"
        },
        maxRooms: {
            "!doc": "The maximum allowed rooms to search. The default is 16, maximum is 64.",
            "!type": "number"
        },
        maxCost: {
            "!doc": "The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to maxCost it will immediately halt the search. The default is Infinity.",
            "!type": "number"
        },
        heuristicWeight: {
            "!doc": "Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.",
            "!type": "number"
        }
    }
});

_extend(_docs, {
    roomFindPathOptions: _extend({}, _docs.pathfindingOptions, {
        ignoreCreeps: {
            "!doc": "Treat squares with creeps as walkable. Can be useful with too many moving creeps around or in some other cases. The default value is false.",
            "!type": "boolean"
        },
        ignoreDestructibleStructures: {
            "!doc": "Treat squares with destructible structures (constructed walls, ramparts, spawns, extensions) as walkable. The default value is false.",
            "!type": "boolean"
        },
        ignoreRoads: {
            "!doc": "Ignore road structures. Enabling this option can speed up the search. The default value is false. This is only used when the new PathFinder is enabled.",
            "!type": "boolean"
        },
        ignore: {
            "!doc": "An array of the room's objects or RoomPosition objects which should be treated as walkable tiles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
            "!type": "[+RoomObject]"
        },
        avoid: {
            "!doc": "An array of the room's objects or RoomPosition objects which should be treated as obstacles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
            "!type": "[+RoomObject]"
        },
        serialize: {
            "!doc": "If true, the result path will be serialized using Room.serializePath. The default is false.",
            "!type": "boolean"
        },
        range: {
            "!doc": "Find a path to a position in specified linear range of target. The default is 0.",
            "!type": "number"
        }
    })
});

_extend(_docs, {
    moveToOptions: _extend({}, _docs.roomFindPathOptions, {
        reusePath: {
            "!doc": "This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.",
            "!type": "boolean"
        },
        serializeMemory: {
            "!doc": "If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.",
            "!type": "boolean"
        },
        noPathFinding: {
            "!doc": "If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.",
            "!type": "boolean"
        },
        visualizePathStyle: {
            "!doc": "Draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.",
            "!type": "object"
        }
    })
});

var def_screeps = {
    "!name": "screeps",
    "!define": {
        object: {},
        BodyPart: {
            type: {
                "!doc": "One of the body part types constants",
                "!type": "string"
            },
            hits: {
                "!doc": "The remaining amount of hit points of this body part.",
                "!type": "number"
            },
            boost: {
                "!doc": "If the body part is boosted, this property specifies the mineral type which is used for boosting. One of the RESOURCE_* constants.",
                "!type": "string"
            }
        },
        PathStep: {
            x: "number",
            y: "number",
            dx: "number",
            dy: "number",
            direction: "number"
        },
        Path: {
            "!type": "[PathStep]"
        },
        PathfindingResult: {
            path: {
                "!doc": "An array of RoomPosition objects.",
                "!type": "[+RoomPosition]"
            },
            ops: {
                "!doc": "Total number of operations performed before this path was calculated.",
                "!type": "number"
            },
            cost: {
                "!doc": "The total cost of the path as derived from plainCost, swampCost and any given CostMatrix instances.",
                "!type": "number"
            },
            incomplete: {
                "!doc": "If the pathfinder fails to find a complete path, this will be true. Note that path will still be populated with a partial path which represents the closest path it could find given the search parameters.",
                "!type": "boolean"
            }
        },
        PathfindingOptions: _docs.pathfindingOptions,
        RoomFindPathOptions: _docs.roomFindPathOptions,
        MoveToOptions: _docs.moveToOptions,
        FindRouteOptions: {
            routeCallback: {
                "!doc": "This callback accepts two arguments: function(roomName, fromRoomName). It can be used to calculate the cost of entering that room. You can use this to do things like prioritize your own rooms, or avoid some rooms. You can return a floating point cost or Infinity to block the room.",
                "!type": "fn(roomName: string, fromRoomName: string) -> number"
            }
        },
        LookItem: {
            type: "string",
            creep: "+Creep",
            structure: "+Structure",
            energy: "+Resource",
            resource: "+Resource",
            flag: "+Flag",
            source: "+Source",
            constructionSite: "+ConstructionSite",
            terrain: "string"
        },
        LookArray: {
            "!type": "[LookItem]"
        },
        LookRowArray: {
            "!type": "[LookArray]"
        },
        LookAreaArray: {
            "!type": "[LookRowArray]"
        },
        MapRouteStep: {
            exit: "number",
            room: "string"
        },
        CostMatrix: {
            "!type": "fn()",
            "!doc": "Container for custom navigation cost data. By default PathFinder will only consider terrain data (plain, swamp, wall) — if you need to route around obstacles such as buildings or creeps you must put them into a CostMatrix. Generally you will create your CostMatrix from within roomCallback. If a non-0 value is found in a room's CostMatrix then that value will be used instead of the default terrain cost. You should avoid using large values in your CostMatrix and terrain cost flags. For example, running PathFinder.search with { plainCost: 1, swampCost: 5 } is faster than running it with {plainCost: 2, swampCost: 10 } even though your paths will be the same.",
            prototype: {
                "set": {
                    "!doc": "Set the cost of a position in this CostMatrix.",
                    "!type": "fn(x: number, y: number, cost: number)"
                },
                "get": {
                    "!doc": "Get the cost of a position in this CostMatrix.",
                    "!type": "fn(x: number, y: number)"
                },
                "clone": {
                    "!doc": "Copy this CostMatrix into a new CostMatrix with the same data.",
                    "!type": "fn() -> +CostMatrix"
                },
                serialize: {
                    "!doc": "Returns a compact representation of this CostMatrix which can be stored via JSON.stringify",
                    "!type": "fn() -> [number]"
                }
            },
            deserialize: {
                "!doc": "Static method which deserializes a new CostMatrix using the return value of `serialize`.",
                "!type": "fn(val: [number]) -> +CostMatrix"
            }
        },
        Transaction: {
            transactionId: "string",
            time: "number",
            sender: {
                username: "string"
            },
            recipient: {
                username: "string"
            },
            resouceType: "string",
            amount: "number",
            from: "string",
            to: "string",
            description: "string",
            order: {
                id: "string",
                type: "string",
                price: "number"
            }
        },
        MarketOrder: {
            id: "string",
            created: "number",
            type: "string",
            resourceType: "string",
            roomName: "string",
            amount: "number",
            remainingAmount: "number",
            price: "number",
            active: "boolean",
            totalAmount: "number"
        },
        MarketHistoryItem: {
            "resourceType": "string",
            "date": "string",
            "transactions": "number",
            "volume": "number",
            "avgPrice": "number",
            "stddevPrice": "number"
        },
        HeapStatistics: {
            "total_heap_size": "number",
            "total_heap_size_executable": "number",
            "total_physical_size": "number",
            "total_available_size": "number",
            "used_heap_size": "number",
            "heap_size_limit": "number",
            "malloced_memory": "number",
            "peak_malloced_memory": "number",
            "does_zap_garbage": "number",
            "externally_allocated_size": "number"
        },
        Effect: {
            effect: {
                "!doc": "Effect ID of the applied effect. Can be either natural effect ID or Power ID.",
                "!type": "number"
            },
            level: {
                "!doc": "Power level of the applied effect. Absent if the effect is not a Power effect.",
                "!type": "number"
            },
            ticksRemaining: {
                "!doc": "How many ticks will the effect last.",
                "!type": "number"
            }
        },
        RoomTerrain: {
            "!type": "fn()",
            "!doc": "An object which provides fast access to room terrain data. These objects can be constructed for any room in the world even if you have no access to it. Technically every Room.Terrain object is a very lightweight adapter to underlying static terrain buffers with corresponding minimal accessors.",
            prototype: {
                get: {
                    "!doc": "Get terrain type at the specified room position by (x,y) coordinates. Unlike the Game.map.getTerrainAt(...) method, this one doesn't perform any string operations and returns integer terrain type values (see below).\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n\nCPU Cost: LOW",
                    "!type": "fn(x: number, y: number) -> number",
                },
                getRawBuffer: {
                    "!doc": "Get copy of underlying static terrain buffer. Current underlying representation is Uint8Array.\n\nArguments:\n* destinationArray (optional) - A typed array view in which terrain will be copied to.\n\nCPU Cost: LOW",
                    "!type": "fn(destinationArray?: bool) -> +Uint8Array"
                },
            },
        },
        StructureSpawnSpawning: {
            "!type": "fn()",
            "!doc": "Details of the creep being spawned currently that can be addressed by the StructureSpawn.spawning property.",
            prototype: {
                name: {
                    "!doc": "The name of a new creep.",
                    "!type": "string"
                },
                needTime: {
                    "!doc": "Time needed in total to complete the spawning.",
                    "!type": "number"
                },
                remainingTime: {
                    "!doc": "Remaining time to go.",
                    "!type": "number"
                },
                directions: {
                    "!doc": "An array with the spawn directions, see StructureSpawn.Spawning.setDirections.",
                    "!type": "[number]"
                },
                spawn: {
                    "!doc": "A link to the spawn.",
                    "!type": "+StructureSpawn"
                },
                cancel: {
                    "!doc": "Cancel spawning immediately. Energy spent on spawning is not returned.",
                    "!type": "fn() -> number"
                },
                setDirections: {
                    "!doc": "Set desired directions where the creep should move when spawned.\n\nArguments:\n* directions - An array with the direction constants as items.\n\nCPU cost: CONST",
                    "!type": "fn(directions: [number]) -> number"
                }
            }
        },
        Power: {
            level: {
                "!doc": "Current level of the power.",
                "!type": "number"
            },
            cooldown: {
                "!doc": "Cooldown ticks remaining, or undefined if the power creep is not spawned in the world.",
                "!type": "number"
            }
        },
        LineStyle: {
            width: {
                "!doc": "Line width, default is 0.1.",
                "!type": "number"
            },
            color: {
                "!doc": "Line color in any web format, default is #ffffff (white).",
                "!type": "string"
            },
            opacity: {
                "!doc": "Opacity value, default is 0.5.",
                "!type": "number"
            },
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        CircleStyle: {
            radius: {
                "!doc": "Circle radius, default is 0.15.",
                "!type": "number"
            },
            fill: {
                "!doc": "Fill color in any web format, default is #ffffff (white).",
                "!type": "string"
            },
            opacity: {
                "!doc": "Opacity value, default is 0.5.",
                "!type": "number"
            },
            stroke: {
                "!doc": "Stroke color in any web format, default is undefined (no stroke).",
                "!type": "string"
            },
            strokeWidth: {
                "!doc": "Stroke line width, default is 0.1.",
                "!type": "number"
            },
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        PolyStyle: {
            fill: {
                "!doc": "Fill color in any web format, default is #ffffff (white).",
                "!type": "string"
            },
            opacity: {
                "!doc": "Opacity value, default is 0.5.",
                "!type": "number"
            },
            stroke: {
                "!doc": "Stroke color in any web format, default is undefined (no stroke).",
                "!type": "string"
            },
            strokeWidth: {
                "!doc": "Stroke line width, default is 0.1.",
                "!type": "number"
            },
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        TextStyle: {
            color: {
                "!doc": "Font color in any web format, default is #ffffff (white).",
                "!type": "string"
            },
            font: {
                "!doc": "Either a number or a string in one of the following forms:\n" +
                    "0.7 - relative size in game coordinates\n" +
                    "20px - absolute size in pixels\n" +
                    "0.7 serif\n" +
                    "bold italic 1.5 Times New Roman"
            },
            stroke: {
                "!doc": "Stroke color in any web format, default is undefined (no stroke).",
                "!type": "string"
            },
            strokeWidth: {
                "!doc": "Stroke line width, default is 0.1.",
                "!type": "number"
            },
            backgroundColor: {
                "!doc": "Background color in any web format, default is undefined (no background). When background is enabled, text vertical align is set to middle (default is baseline).",
                "!type": "string"
            },
            backgroundPadding: {
                "!doc": "Background rectangle padding, default is 0.3.",
                "!type": "number"
            },
            align: {
                "!doc": "Text align, either center, left, or right. Default is center.",
                "!type": "string"
            },
            opacity: {
                "!doc": "Opacity value, default is 1.0.",
                "!type": "number"
            }
        }
    },
    RoomObject: {
        "!type": "fn()",
        "!doc": "Any object with a position in a room. Almost all game objects prototypes are derived from RoomObject.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {
                "!doc": "Applied effects, an array of objects.",
                "!type": "[Effect]"
            }
        }
    },
    Store: {
        "!type": "fn()",
        "!doc": "An object that can contain resources in its cargo.",
        prototype: {
            getCapacity: {
                "!doc": "Returns capacity of this store for the specified resource, or total capacity if resource is undefined.\n\nReturns capacity number, or null in case of a not valid resource for this store type.\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            },
            getFreeCapacity: {
                "!doc": "A shorthand for getCapacity(resource) - getUsedCapacity(resource).\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            },
            getUsedCapacity: {
                "!doc": "Returns the capacity used by the specified resource, or total used capacity for general purpose stores if resource is undefined.\n\nReturns used capacity number, or null in case of a not valid resource for this store type.\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            }
        }
    }
};
_extend(def_screeps, {
    Structure: {
        "!type": "fn()",
        "!doc": "Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            hits: {
                "!doc": "The current amount of hit points of the structure.",
                "!type": "number"
            },
            hitsMax: {
                "!doc": "The total amount of hit points of the structure.",
                "!type": "number"
            },
            structureType: {
                "!doc": "One of the STRUCTURE_* constants.",
                "!type": "string"
            },
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },

        })
    },
});

_extend(def_screeps, {
    OwnedStructure: {
        "!type": "fn()",
        "!doc": "The base prototype for a structure that has an owner. Such structures can be found using FIND_MY_STRUCTURES and FIND_HOSTILE_STRUCTURES constants.",
        prototype: _extend({}, def_screeps.Structure.prototype, {
            my: {
                "!type": "bool",
                "!doc": "Whether it is your own structure."
            },
            owner: {
                "!": "An object with the owner info",
                username: {
                    "!doc": "The name of the owner user.",
                    "!type": "string"
                }
            },
        })
    },
});

_extend(def_screeps, {
    ConstructionSite: {
        "!type": "fn()",
        "!doc": "A site of a structure which is currently under construction. A construction site can be created using the 'Construct' button at the left of the game field or the Room.createConstructionSite() method. Construction sites are visible to their owners only.\n\nTo build a structure on the construction site, give a worker creep some amount of energy and perform Creep.build() action.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            my: {
                "!type": "bool",
                "!doc": "Whether it is your own construction site."
            },
            owner: {
                "!doc": "An object with the owner info",
                username: {
                    "!doc": "The name of the owner user.",
                    "!type": "string"
                }
            },
            progress: {
                "!doc": "The current construction progress.",
                "!type": "number"
            },
            progressTotal: {
                "!doc": "The total construction progress needed for the structure to be built.",
                "!type": "number"
            },
            structureType: {
                "!doc": "One of the STRUCTURE_* constants.",
                "!type": "string"
            },
            remove: {
                "!doc": "Remove the construction site.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            }
        })
    },
    Creep: {
        "!type": "fn()",
        "!doc": "Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.",
        prototype: _extend({}, _docs.store, def_screeps.RoomObject.prototype, {
            body: {
                "!doc": "An array describing the creep’s body.",
                "!type": "[BodyPart]",
                "!url": "http://docs.screeps.com/api/#Creep.body"
            },
            fatigue: {
                "!type": "number",
                "!doc": "The movement fatigue indicator. If it is greater than zero, the creep cannot move.",
            },
            hits: {
                "!type": "number",
                "!doc": "The current amount of hit points of the creep.",
            },
            hitsMax: {
                "!type": "number",
                "!doc": "The maximum amount of hit points of the creep.",
            },
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            memory: {
                "!doc": "A shorthand to `Memory.creeps[creep.name]`. You can use it for quick access the creep’s specific memory data object.",
            },
            my: {
                "!type": "bool",
                "!doc": "Whether it is your creep or foe."
            },
            name: {
                "!doc": "Creep's name. You can choose the name while creating a new creep, and it cannot be changed later. This name is a hash key to access the creep via the `Game.creeps` object.",
                "!type": "string"
            },
            owner: {
                "!doc": "An object with the owner info",
                username: {
                    "!doc": "The name of the owner user.",
                    "!type": "string"
                }
            },
            spawning: {
                "!doc": "Whether this creep is still being spawned.",
                "!type": "bool"
            },
            ticksToLive: {
                "!doc": "The remaining amount of game ticks after which the creep will die.",
                "!type": "number"
            },
            attack: {
                "!type": "fn(target: object) -> number",
                "!doc": "Attack another creep or structure in a short-ranged attack. Requires the ATTACK body part. If the target is inside a rampart, then the rampart is attacked instead. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target object to be attacked.\n\nCPU cost: CONST"
            },
            build: {
                "!doc": "Build a structure at the target construction site using carried energy. Requires WORK and CARRY body parts. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target construction site to be built.\n\nCPU cost:CONST",
                "!type": "fn(target: +ConstructionSite) -> number"
            },
            cancelOrder: {
                "!doc": "Cancel the order given during the current game tick.\n\nArguments:\n* methodName - The name of a creep's method to be cancelled.\n\nCPU cost:NONE",
                "!type": "fn(methodName: string) -> number"
            },
            claimController: {
                "!doc": "Claims a neutral controller under your control. Requires the CLAIM body part. \n\nArguments:\n* target - The target controller object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            attackController: {
                "!doc": "Decreases the controller's downgrade or reservation timer for 1 tick per every 5 CLAIM body parts (so the creep must have at least 5xCLAIM). The controller under attack cannot be upgraded for the next 1,000 ticks. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target controller object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            getActiveBodyparts: {
                "!doc": "Get the quantity of live body parts of the given type. Fully damaged parts do not count.\n\nArguments:\n* type - A body part type, one of the body part constants.\n\nCPU cost: NONE",
                "!type": "fn(type: string) -> number"
            },
            harvest: {
                "!doc": "Harvest energy from the source. Requires the WORK body part. If the creep has an empty CARRY body part, the harvested energy is put into it; otherwise it is dropped on the ground. The target has to be at an adjacent square to the creep. You cannot harvest a source if the room controller is owned or reserved by another player.\n\nArguments:\n* target - The source object to be harvested.\n\nCPU cost: CONST",
                "!type": "fn(target: +Source) -> number"
            },
            heal: {
                "!doc": "Heal self or another creep. It will restore the target creep’s damaged body parts function and increase the hits counter. Requires the HEAL body part. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target creep object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            move: {
                "!doc": "Move the creep one square in the specified direction. Requires the MOVE body part.\n\nArguments:\n* direction - One of the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(direction: number) -> number"
            },
            moveByPath: {
                "!doc": "Move the creep using the specified predefined path. Requires the MOVE body part.\n\nArguments:\n* path - A path value as returned from `Room.findPath`, `RoomPosition.findPathTo`, or `PathFinder.search` methods. Both array form and serialized string form are accepted.\n\nCPU cost: CONST",
                "!type": "fn(path: Path) -> number"
            },
            moveTo: {
                "!doc": "Syntax:\nmoveTo(x, y, [opts])\nmoveTo(target, [opts])\n\nFind the optimal path to the target within the same room and move to it. A shorthand to consequent calls of pos.findPathTo() and move() methods. If the target is in another room, then the corresponding exit will be used as a target. Requires the MOVE body part.\n\nArguments:\n* x - X position of the target in the same room.\n* y - Y position of the target in the same room.\n* target - Can be a RoomPosition object or any object containing RoomPosition. The position doesn't have to be in the same room.\n* opts (optional) - An object containing pathfinding options flags (see Room.findPath for more info) or one of the following:\n  - reusePath - This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.\n  - serializeMemory - If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.\n  - noPathFinding - If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.\n  - visualizePathStyle - draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?) -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the creep is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            pickup: {
                "!doc": "Pick up an item (a dropped piece of energy). Requires the CARRY body part. The target has to be at adjacent square to the creep or at the same square.\n\nArguments:\n* target - The target object to be picked up.\n\nCPU cost: CONST",
                "!type": "fn(target: +Resource) -> number"
            },
            rangedAttack: {
                "!doc": "A ranged attack against another creep or structure. Requires the RANGED_ATTACK body part. If the target is inside a rampart, the rampart is attacked instead. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target object to be attacked.\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            rangedHeal: {
                "!doc": "Heal another creep at a distance. It will restore the target creep’s damaged body parts function and increase the hits counter. Requires the HEAL body part. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target creep object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            rangedMassAttack: {
                "!doc": "A ranged attack against all hostile creeps or structures within 3 squares range. Requires the RANGED_ATTACK body part. The attack power depends on the range to each target. Friendly units are not affected.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            repair: {
                "!doc": "Repair a damaged structure using carried energy. Requires the WORK and CARRY body parts. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target structure to be repaired.\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            reserveController: {
                "!doc": "Temporarily block a neutral controller from claiming by other players. Each tick, this command increases the counter of the period during which the controller is unavailable by 1 tick per each CLAIM body part. The maximum reservation period to maintain is 5,000 ticks. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target controller object to be reserved.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController) -> number"
            },
            signController: {
                "!doc": "Sign a controller with a random text visible to all players. This text will appear in the room UI, in the world map, and can be accessed via the API. You can sign unowned and hostile controllers. The target has to be at adjacent square to the creep. Pass an empty string to remove the sign.\n\nArguments:\n* target - The target controller object to be signed.\n* text - The sign text. The maximum text length is 100 characters.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController, target: string) -> number"
            },
            say: {
                "!doc": "Display a visual speech balloon above the creep with the specified message. The message will be available for one tick. You can read the last message using the `saying` property.\n\nArguments:\n* message - The message to be displayed. Maximum length is 10 characters.\n* public (optional) - Set to true to allow other players to see this message. Default is false.\n\nCPU cost: NONE",
                "!type": "fn(message: string, public?: boolean) -> number"
            },
            saying: {
                "!doc": "The text message that the creep was saying at the last tick.",
                "!type": "string"
            },
            suicide: {
                "!doc": "Kill the creep immediately.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            upgradeController: {
                "!doc": "Upgrade your controller to the next level using carried energy. Upgrading controllers raises your Global Control Level in parallel. Requires WORK and CARRY body parts. The target has to be within 3 squares range of the creep. A fully upgraded level 8 controller can't be upgraded with the power over 15 energy units per tick regardless of creeps power. The cumulative effect of all the creeps performing upgradeController in the current tick is taken into account. This limit can be increased by using ghodium mineral boost.\n\nArguments:\n* target - The target controller object to be upgraded.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            drop: {
                "!doc": "Drop resource on the ground.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resource units to be dropped.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount?: number) -> number"
            },
            transfer: {
                "!doc": "Transfer resource from the creep to another creep, storage, or power spawn. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available carried amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, resourceType: string, amount?: number) -> number"
            },
            dismantle: {
                "!type": "fn(target: +Structure) -> number",
                "!doc": "Dismantles any (even hostile) structure returning 50% of the energy spent on its repair. Requires the WORK body part. If the creep has an empty CARRY body part, the energy is put into it; otherwise it is dropped on the ground. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target structure.\n\nCPU cost: CONST"
            },
            withdraw: {
                "!doc": "Withdraw resources from a structure. The target has to be at adjacent square to the creep. Multiple creeps can withdraw from the same structure in the same tick. Your creeps can withdraw resources from hostile structures as well, in case if there is no hostile rampart on top of it.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure, resourceType: string, amount?: number) -> number"
            },
            generateSafeMode: {
                "!doc": "Add one more available safe mode activation to a room controller. The creep has to be at adjacent square to the target room controller and have 1000 ghodium resource.\n\nArguments:\n* target - The target room controller.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController) -> number"
            }
        })
    },
    PowerCreep: {
        "!type": "fn()",
        "!doc": "Power Creeps are immortal \"heroes\" that are tied to your account and can be respawned in any PowerSpawn after death.",
        prototype: _extend({}, _docs.store, def_screeps.RoomObject.prototype, {
            cancelOrder: {
                "!doc": "Cancel the order given during the current game tick.\n\nArguments:\n* methodName - The name of a power creep's method to be cancelled.\n\nCPU cost:NONE",
                "!type": "fn(methodName: string) -> number"
            },
            className: {
                "!type": "string",
                "!doc": "The power creep's class, one of the POWER_CLASS constants."
            },
            delete: {
                "!doc": "Delete the power creep permanently from your account. It should NOT be spawned in the world. The creep is not deleted immediately, but a 24-hours delete timer is started instead (see deleteTime). You can cancel deletion by calling delete(true).",
                "!type": "fn(cancel?: boolean) -> number"
            },
            deleteTime: {
                "!type": "number",
                "!doc": "A timestamp when this creep is marked to be permanently deleted from the account, or undefined otherwise.",
            },
            drop: {
                "!doc": "Drop resource on the ground.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resource units to be dropped.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount?: number) -> number"
            },
            enableRoom: {
                "!doc": "Enable powers usage in this room.\n\nArguments:\n* controller - The room controller.\n\nCPU cost: CONST",
                "!type": "fn(controller: +StructureController) -> number"
            },
            hits: {
                "!type": "number",
                "!doc": "The current amount of hit points of the power creep.",
            },
            hitsMax: {
                "!type": "number",
                "!doc": "The maximum amount of hit points of the power creep.",
            },
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            level: {
                "!type": "number",
                "!doc": "The power creep's level.",
            },
            memory: {
                "!doc": "A shorthand to `Memory.powerCreeps[creep.name]`. You can use it for quick access the power creep’s specific memory data object.",
            },
            move: {
                "!doc": "Move the power creep one square in the specified direction.\n\nArguments:\n* direction - One of the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(direction: number) -> number"
            },
            moveByPath: {
                "!doc": "Move the power creep using the specified predefined path.\n\nArguments:\n* path - A path value as returned from `Room.findPath`, `RoomPosition.findPathTo`, or `PathFinder.search` methods. Both array form and serialized string form are accepted.\n\nCPU cost: CONST",
                "!type": "fn(path: Path) -> number"
            },
            moveTo: {
                "!doc": "Syntax:\nmoveTo(x, y, [opts])\nmoveTo(target, [opts])\n\nFind the optimal path to the target within the same room and move to it.\n\nArguments:\n* x - X position of the target in the same room.\n* y - Y position of the target in the same room.\n* target - Can be a RoomPosition object or any object containing RoomPosition. The position doesn't have to be in the same room.\n* opts (optional) - An object containing pathfinding options flags (see Room.findPath for more info) or one of the following:\n  - reusePath - This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.\n  - serializeMemory - If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.\n  - noPathFinding - If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.\n  - visualizePathStyle - draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?) -> number"
            },
            my: {
                "!type": "bool",
                "!doc": "Whether it is your power creep or foe."
            },
            name: {
                "!doc": "Power creep's name. You can choose the name while creating a new power creep, and it cannot be changed later. This name is a hash key to access the creep via the `Game.powerCreeps` object.",
                "!type": "string"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the power creep is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            owner: {
                "!doc": "An object with the owner info",
                username: {
                    "!doc": "The name of the owner user.",
                    "!type": "string"
                }
            },
            pickup: {
                "!doc": "Pick up an item (a dropped piece of energy). The target has to be at adjacent square to the creep or at the same square.\n\nArguments:\n* target - The target object to be picked up.\n\nCPU cost: CONST",
                "!type": "fn(target: +Resource) -> number"
            },
            rename: {
                "!doc": "Rename the power creep. It must not be spawned in the world.\n\nArguments:\n* name - The new name of the power creep.\n\nCPU cost: NONE",
                "!type": "fn(name: string) -> number"
            },
            renew: {
                "!doc": "Instantly restore time to live to the maximum using a Power Spawn or a Power Bank nearby.\n\nArguments:\n* target - The target structure\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            powers: {
                "!doc": "Available powers, an object with power ID as a key",
                "!type": "[+Power]"
            },
            say: {
                "!doc": "Display a visual speech balloon above the power creep with the specified message. The message will be available for one tick. You can read the last message using the `saying` property.\n\nArguments:\n* message - The message to be displayed. Maximum length is 10 characters.\n* public (optional) - Set to true to allow other players to see this message. Default is false.\n\nCPU cost: NONE",
                "!type": "fn(message: string, public?: boolean) -> number"
            },
            saying: {
                "!doc": "The text message that the power creep was saying at the last tick.",
                "!type": "string"
            },
            shard: {
                "!doc": "The name of the shard where the power creep is spawned, or undefined.",
                "!type": "string"
            },
            spawn: {
                "!doc": "Spawn this power creep in the specified Power Spawn.\n\nArguments:\n* powerSpawn - Your Power Spawn structure.\n\nCPU cost: CONST",
                "!type": "fn(powerSpawn: +StructurePowerSpawn) -> number"
            },
            spawnCooldownTime: {
                "!doc": "The timestamp when spawning or deleting this creep will become available. Undefined if the power creep is spawned in the world.",
                "!type": "number"
            },
            suicide: {
                "!doc": "Kill the power creep immediately. It will not be destroyed permanently, but will become unspawned, so that you can spawn it again.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            ticksToLive: {
                "!doc": "The remaining amount of game ticks after which the creep will die and become unspawned. Undefined if the creep is not spawned in the world.",
                "!type": "number"
            },
            transfer: {
                "!doc": "Transfer resource from the power creep to another power creep, creep, or structure. The target has to be at adjacent square to the power creep.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available carried amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, resourceType: string, amount?: number) -> number"
            },
            upgrade: {
                "!doc": "Upgrade the creep, adding a new power ability to it or increasing level of the existing power. You need one free Power Level in your account to perform this action.\n\nArguments:\n* power - The power ability to upgrade, one of the PWR_* constants.\n\nCPU cost: CONST",
                "!type": "fn(power: number) -> number"
            },
            usePower: {
                "!doc": "Apply one the creep's powers on the specified target. You can only use powers in rooms either without a controller, or with a power-enabled controller. Only one power can be used during the same tick, each usePower call will override the previous one. If the target has the same effect of a lower or equal level, it is overridden. If the existing effect level is higher, an error is returned.\n\nArguments:\n* power - The power ability to use, one of the PWR_* constants.\n* target - A target object in the room.\n\nCPU cost: CONST",
                "!type": "fn(power: number, target?: +RoomObject) -> number"
            },
            withdraw: {
                "!doc": "Withdraw resources from a structure, tombstone, or ruin. The target has to be at adjacent square to the power creep. Your power creeps can withdraw resources from hostile structures as well, in case if there is no hostile rampart on top of it.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure, resourceType: string, amount?: number) -> number"
            },
        }),
        create: {
            "!doc": "A static method to create new Power Creep instance in your account. It will be added in an unspawned state, use spawn method to spawn it in the world.\nYou need one free Power Level in your account to perform this action.\n\nArguments:\n* name - The name of the new power creep.\n* className - The class of the new power creep, one of the POWER_CLASS constants.\n\nCPU cost: CONST",
            "!type": "fn(name: string, className: string) -> number"
        }
    },
    Resource: {
        "!type": "fn()",
        "!doc": "A dropped pile of resource units, either energy or power. Dropped energy pile decays for `ceil(amount/1000)` units per tick if not picked up.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            amount: {
                "!doc": "The amount of resource units containing.",
                "!type": "number"
            },
            resourceType: {
                "!doc": "One of the RESOURCE_* constants.",
                "!type": "string"
            }
        })
    },
    Flag: {
        "!type": "fn()",
        "!doc": "A flag. Flags can be used to mark particular spots in a room. Flags are visible to their owners only.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            color: {
                "!doc": "Primary color of the flag. One of the COLOR_* constants.",
                "!type": "string"
            },
            secondaryColor: {
                "!doc": "Secondary color of the flag. One of the COLOR_* constants.",
                "!type": "string"
            },
            memory: {
                "!doc": "A shorthand to Memory.flags[flag.name]. You can use it for quick access the flag's specific memory data object."
            },
            name: {
                "!doc": "Flag’s name. You can choose the name while creating a new flag, and it cannot be changed later. This name is a hash key to access the spawn via the Game.flags object.",
                "!type": "string"
            },
            remove: {
                "!doc": "Remove the flag.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            setColor: {
                "!doc": "Set new color of the flag\n\nArguments:\n* color - One of the COLOR_* constants\n* secondaryColor (optional) - One of the COLOR_* constants.\n\nCPU cost: CONST",
                "!type": "fn(color: string, secondaryColor: string) -> number"
            },
            setPosition: {
                "!doc": "Syntax:\nsetPosition(x,y)\nsetPosition(pos)\n\nSet new position of the flag.\n\nArguments:\n* x - The X position in the room.\n* y - The Y position in the room.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            }
        })
    },
    Source: {
        "!type": "fn()",
        "!doc": "An energy source object. Can be harvested by creeps with a WORK body part.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            energy: {
                "!doc": "The remaining amount of energy.",
                "!type": "number"
            },
            energyCapacity: {
                "!doc": "The total amount of energy in the source. Equals to 3000 in most cases.",
                "!type": "number"
            },
            ticksToRegeneration: {
                "!doc": "The remaining time after which the source will be refilled.",
                "!type": "number"
            }
        })
    },
    Mineral: {
        "!type": "fn()",
        "!doc": "A mineral deposit object. Can be harvested by creeps with a WORK body part using the extractor structure.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            mineralAmount: {
                "!doc": "The remaining amount of resource.",
                "!type": "number"
            },
            mineralType: {
                "!doc": "The resource type, one of the RESOURCE_* constants.",
                "!type": "string"
            },
            ticksToRegeneration: {
                "!doc": "The remaining time after which the deposit will be refilled.",
                "!type": "number"
            },
            density: {
                "!doc": "The density of this mineral deposit, one of the DENSITY_* constants.",
                "!type": "number"
            }
        })
    },
    Nuke: {
        "!type": "fn()",
        "!doc": "",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            launchRoomName: {
                "!type": "string",
                "!doc": "The name of the room where this nuke has been launched from.",
            },
            timeToLand: {
                "!type": "number",
                "!doc": "The remaining landing time.",
            }
        })
    },

    StructureContainer: {
        "!type": "fn()",
        "!doc": "A small container that can be used to store resources. This is a walkable structure. All dropped resources automatically goes to the container at the same tile.",
        prototype: _extend({}, _docs.store, def_screeps.Structure.prototype, {
            ticksToDecay: {
                "!doc": "The amount of game ticks when this container will lose some hit points.",
                "!type": "number"
            }
        })
    },
    StructureController: {
        "!type": "fn()",
        "!doc": "Claim this structure to take control over the room. The controller structure cannot be damaged or destroyed. It can be addressed by Room.controller property.",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            isPowerEnabled: {
                "!doc": "Whether using power is enabled in this room. Use PowerCreep.enableRoom to turn powers on.",
                "!type": "number"
            },
            level: {
                "!doc": "Current controller level, from 0 to 8.",
                "!type": "number"
            },
            progress: {
                "!doc": "The current progress of upgrading the controller to the next level.",
                "!type": "number"
            },
            progressTotal: {
                "!doc": "The progress needed to reach the next level.",
                "!type": "number"
            },
            reservation: {
                "!doc": "An object with the controller reservation info if present.",
                username: {
                    "!doc": "The name of a player who reserved this controller.",
                    "!type": "string"
                },
                ticksToEnd: {
                    "!doc": "The amount of game ticks when the reservation will end.",
                    "!type": "number"
                }
            },
            sign: {
                "!doc": "An object with the controller sign info if present.",
                username: {
                    "!doc": "The name of a player who signed this controller.",
                    "!type": "string"
                },
                text: {
                    "!doc": "The sign text.",
                    "!type": "string"
                },
                time: {
                    "!doc": "The sign time in game ticks.",
                    "!type": "number"
                },
                datetime: {
                    "!doc": "The sign real date.",
                    "!type": "Date"
                }
            },
            ticksToDowngrade: {
                "!doc": "The amount of game ticks when this controller will lose one level. This timer can be reset by using Creep.upgradeController.",
                "!type": "number"
            },
            upgradeBlocked: {
                "!doc": "The amount of game ticks while this controller cannot be upgraded due to attack.",
                "!type": "number"
            },
            unclaim: {
                "!doc": "Make your claimed controller neutral again.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            safeMode: {
                "!doc": "How many ticks of safe mode remaining, or undefined.",
                "!type": "number"
            },
            safeModeAvailable: {
                "!doc": "Safe mode activations available to use.",
                "!type": "number"
            },
            safeModeCooldown: {
                "!doc": "During this period in ticks new safe mode activations will be blocked, undefined if cooldown is inactive.",
                "!type": "number"
            },
            activateSafeMode: {
                "!doc": "Activate safe mode if available.\n\nArguments:\n* \n\nCPU cost: CONST",
                "!type": "fn() -> number"
            }
        })
    },
    StructureExtension: {
        "!type": "fn()",
        "!doc": "Contains energy which can be spent on spawning bigger creeps. Extensions can be placed anywhere in the room, any spawns will be able to use them regardless of distance.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype)
    },
    StructureExtractor: {
        "!type": "fn()",
        "!doc": "Allows to harvest a mineral deposit.",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            cooldown: {
                "!doc": "The amount of game ticks until the next harvest action is possible.",
                "!type": "number"
            }
        })
    },
    StructureKeeperLair: {
        "!type": "fn()",
        "!doc": "Non-player structure. Spawns NPC Source Keepers that guards energy sources and minerals in some rooms. This structure cannot be destroyed.",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            ticksToSpawn: {
                "!doc": "Time to spawning of the next Source Keeper.",
                "!type": "number"
            },
        })
    },
    StructureLab: {
        "!type": "fn()",
        "!doc": "Produces mineral compounds from base minerals and boosts creeps.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            cooldown: {
                "!doc": "The amount of game ticks the lab has to wait until the next reaction is possible.",
                "!type": "number"
            },
            mineralType: {
                "!doc": "The type of minerals containing in the lab. Labs can contain only one mineral type at the same time.",
                "!type": "number"
            },
            boostCreep: {
                "!doc": "Boosts creep body part using the containing mineral compound. The creep has to be at adjacent square to the lab. Boosting one body part consumes 30 mineral units and 20 energy units.\n\nArguments:\n* creep - The target creep.\n* bodyPartsCount (optional) - The number of body parts of the corresponding type to be boosted. Body parts are always counted left-to-right for TOUGH, and right-to-left for other types. If undefined, all the eligible body parts are boosted.\n\nCPU cost: CONST",
                "!type": "fn(creep: +Creep, bodyPartsCount?: number) -> number"
            },
            runReaction: {
                "!doc": "Produce mineral compounds using reagents from two another labs. Labs have to be within 2 squares range. Each reaction produces 10 mineral units and has a 10 ticks cooldown period. The same input labs can be used by many output labs.\n\nArguments:\n* lab1 - The first source lab.\n* lab2 - The second source lab.\n\nCPU cost: CONST",
                "!type": "fn(lab1: +Structure, lab2: +Structure) -> number"
            },
            unboostCreep: {
                "!doc": "Immediately remove boosts from the creep and drop 50% of the mineral compounds used to boost it onto the ground regardless of the creep's remaining time to live. The creep has to be at adjacent square to the lab. Unboosting requires cooldown time equal to the total sum of the reactions needed to produce all the compounds applied to the creep.\n\nArguments:\n* creep - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(creep: +Creep) -> number"
            },
        })
    },
    StructureLink: {
        "!type": "fn()",
        "!doc": "Remotely transfers energy to another Link in the same room.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            cooldown: {
                "!doc": "The amount of game ticks the link has to wait until the next transfer is possible.",
                "!type": "number"
            },
            transferEnergy: {
                "!doc": "Transfer energy from the link to another link or a creep. If the target is a creep, it has to be at adjacent square to the link. If the target is a link, it can be at any location in the same room. Remote transfer process implies 3% energy loss and cooldown delay depending on the distance.\n\nArguments:\n* target - The target object.\n* amount (optional) - The amount of energy to be transferred. If omitted, all the available energy is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, amount: number) -> number"
            },
        })
    },
    StructureObserver: {
        "!type": "fn()",
        "!doc": "Provides visibility into a distant room from your script.",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            observeRoom: {
                "!doc": "Provide visibility into a distant room from your script. The target room object will be available on the next tick. The maximum range is 5 rooms.\n\nArguments:\n* roomName - The name of the target room.\n\nCPU cost: CONST",
                "!type": "fn(roomName: string) -> number"
            },
        })
    },
    StructurePowerBank: {
        "!type": "fn()",
        "!doc": "Non-player structure. Contains power resource which can be obtained by destroying the structure. Hits the attacker creep back on each attack. ",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            power: {
                "!doc": "The amount of power containing.",
                "!type": "number"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when this structure will disappear.",
                "!type": "number"
            },
        })
    },
    StructurePowerSpawn: {
        "!type": "fn()",
        "!doc": "Processes power into your account, and spawns power creeps with special unique powers (in development).",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            power: {
                "!doc": "The amount of power containing.",
                "!type": "number"
            },
            powerCapacity: {
                "!doc": "The total amount of power this structure can contain.",
                "!type": "number"
            },
            processPower: {
                "!doc": "Register power resource units into your account. Registered power allows to develop power creeps skills. Consumes 1 power resource unit and 50 energy resource units.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            createPowerCreep: {
                "!doc": "Create a power creep. This method is under development.\n\nArguments:\n* name - The power creep name.\n\nCPU cost: CONST",
                "!type": "fn(name: string) -> number"
            },
        })
    },
    StructureRampart: {
        "!type": "fn()",
        "!doc": "Blocks movement of hostile creeps, and defends your creeps and structures on the same tile.",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            ticksToDecay: {
                "!doc": "The amount of game ticks when this rampart will lose some hit points.",
                "!type": "number"
            },
            isPublic: {
                "!doc": "If false (default), only your creeps can step on the same square. If true, any hostile creeps can pass through.",
                "!type": "bool"
            },
            setPublic: {
                "!doc": "Make this rampart public to allow other players' creeps to pass through.\n\nArguments:\n* isPublic - Whether this rampart should be public or non-public.\n\nCPU cost: CONST",
                "!type": "fn(isPublic) -> number"
            }
        })
    },
    StructureRoad: {
        "!type": "fn()",
        "!doc": "Decreases movement cost to 1. Using roads allows creating creeps with less MOVE body parts.",
        prototype: _extend({}, def_screeps.Structure.prototype, {
            ticksToDecay: {
                "!doc": "The amount of game ticks when this road will lose some hit points.",
                "!type": "number"
            },
        })
    },
    StructureStorage: {
        "!type": "fn()",
        "!doc": "A structure that can store huge amount of resource units. Only one structure per room is allowed that can be addressed by Room.storage property.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype)
    },
    StructureTerminal: {
        "!type": "fn()",
        "!doc": "Sends any resources to a Terminal in another room. The destination Terminal can belong to any player. If its storage is full, the resources are dropped on the ground. Each transaction requires additional energy (regardless of the transfer resource type) according to this formula: ceil(0.2 * amount * linearDistanceBetweenRooms). For example, sending 100 mineral units from W1N1 to W2N3 will consume 40 energy units. You can track your incoming and outgoing transactions and estimate range cost between rooms using the Game.market object. Only one Terminal per room is allowed that can be addressed by Room.terminal property.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            send: {
                "!doc": "Sends resource to a Terminal in another room with the specified name.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resources to be sent. The minimum amount is 100.\n* destination - The name of the target room. You don't have to gain visibility in this room.\n* description (optional) - The description of the transaction. It is visible to the recipient. The maximum length is 100 characters.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount: number, destination: string, description?: string) -> number"
            },
            cooldown: {
                "!doc": "The remaining amount of ticks while this terminal cannot be used to make `StructureTerminal.send` or `Game.market.deal` calls.",
                "!type": "number"
            }
        })
    },
    StructureTower: {
        "!type": "fn()",
        "!doc": "Remotely attacks or heals creeps, or repairs structures. Can be targeted to any object in the room. However, its effectiveness highly depends on the distance. Each action consumes energy.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            attack: {
                "!doc": "Remotely attack any creep in a room. \n\nArguments:\n* target - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            heal: {
                "!doc": "Remotely heal any creep in a room. \n\nArguments:\n* target - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            repair: {
                "!doc": "Remotely repair any structure in a room. \n\nArguments:\n* target - The target structure.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            }
        })
    },
    StructureNuker: {
        "!type": "fn()",
        "!doc": "Launches a nuke to any room within 5 rooms range dealing huge damage to the landing area. Each launch has a cooldown and requires energy and ghodium resources. Launching creates a Nuke object at the target room position which is visible to any player until it is landed. Incoming nuke cannot be moved or cancelled.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            launchNuke: {
                "!doc": "Launch a nuke to the specified position. \n\nArguments:\n* pos - The target room position.\n\nCPU cost: CONST",
                "!type": "fn(pos: +RoomPosition) -> number"
            },
            cooldown: {
                "!doc": "The amount of game ticks until the next launch is possible.",
                "!type": "number"
            },
        })
    },
    StructureWall: {
        "!type": "fn()",
        "!doc": "Blocks movement of all creeps.",
        prototype: _extend({}, def_screeps.Structure.prototype, {
            ticksToLive: {
                "!doc": "The amount of game ticks when the wall will disappear (only for automatically placed border walls at the start of the game).",
                "!type": "number"
            },
        })
    },
    StructureSpawn: {
        "!type": "fn()",
        "!doc": "Spawn is your colony center. This structure can create, renew, and recycle creeps. All your spawns are accessible through Game.spawns hash list.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            memory: {
                "!doc": "A shorthand to Memory.spawns[spawn.name]. You can use it for quick access the spawn’s specific memory data object."
            },
            name: {
                "!doc": "Spawn’s name. You choose the name upon creating a new spawn, and it cannot be changed later. This name is a hash key to access the spawn via the Game.spawns object.",
                "!type": "string"
            },
            spawning: {
                "!doc": "If the spawn is in process of spawning a new creep, this object will contain the new creep’s information, or null otherwise.",
                "!type": "+StructureSpawnSpawning"
            },
            canCreateCreep: {
                "!doc": "Check if a creep can be created.\n\nArguments:\n* body - An array describing the new creep’s body. Should contain 1 to 50 elements with one of the body part constants.\n* name (optional) - The name of a new creep. It should be unique creep name, i.e. the Game.creeps object should not contain another creep with the same name (hash key). If not defined, a random name will be generated.\n\nCPU cost: AVERAGE",
                "!type": "fn(body: [string], name?: string) -> bool"
            },
            createCreep: {
                "!doc": "This method is deprecated and will be removed soon. Please use StructureSpawn.spawnCreep instead.\n\nStart the creep spawning process. The required energy amount can be withdrawn from all spawns and extensions in the room.\n\nArguments:\n* body - An array describing the new creep’s body. Should contain 1 to 50 elements with one of the body part constants.\n* name (optional) - The name of a new creep. It should be unique creep name, i.e. the Game.creeps object should not contain another creep with the same name (hash key). If not defined, a random name will be generated.\n* memory (optional) - The memory of a new creep. If provided, it will be immediately stored into Memory.creeps[name].\n\nCPU cost: CONST",
                "!type": "fn(body: [string], name?: string, memory?: ?) -> number"
            },
            spawnCreep: {
                "!doc": "Start the creep spawning process. The required energy amount can be withdrawn from all spawns and extensions in the room.\n\nArguments:\n* body - An array describing the new creep’s body. Should contain 1 to 50 elements with one of the body part constants.\n* name - The name of a new creep. It should be unique creep name, i.e. the Game.creeps object should not contain another creep with the same name (hash key).\n* opts (optional) - An object with following properties:\n  - memory - The memory of a new creep. If provided, it will be immediately stored into Memory.creeps[name].\n  - energyStructures - Array of spawns/extensions from which to draw energy for the spawning process.\n  - dryRun - If dryRun is true, the operation will only check if it is possible to create a creep.\n  - directions - Set desired directions where the creep should move when spawned. An array with the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(body: [string], name: string, opts?: object) -> number"
            },
            renewCreep: {
                "!doc": "Increase the remaining time to live of the target creep. The target should be at adjacent square. The spawn should not be busy with the spawning process. Each execution increases the creep's timer by amount of ticks according to this formula: floor(600/body_size). Energy required for each execution is determined using this formula: ceil(creep_cost/2.5/body_size).\n\nArguments:\n* target - The creep to be renewed.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            recycleCreep: {
                "!doc": "Kill the creep and drop up to 100% of resources spent on its spawning and boosting depending on remaining life time. The target should be at adjacent square. \n\nArguments:\n* target - The creep to be recycled.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            }
        }),
        Spawning: {
            "!type": "StructureSpawnSpawning"
        }
    },

    StructurePortal: {
        "!type": "fn()",
        "!doc": "A non-player structure. Instantly teleports your creeps to a distant room acting as a room exit tile. Portals appear randomly in the central room of each sector.",
        prototype: _extend({}, def_screeps.Structure.prototype, {
            destination: {
                '!doc': 'The position object in the destination room.',
                '!type': '+RoomPosition'
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when the portal disappears, or undefined when the portal is stable.",
                "!type": "number"
            }
        })
    },

    StructureFactory: {
        "!type": "fn()",
        "!doc": "Produces trade commodities from base minerals and other commodities.",
        prototype: _extend({}, _docs.store, def_screeps.OwnedStructure.prototype, {
            produce: {
                "!doc": "Produces the specified commodity. All ingredients should be available in the factory store. \n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string) -> number"
            },
            cooldown: {
                "!doc": "The amount of game ticks the factory has to wait until the next production is possible.",
                "!type": "number"
            },
            level: {
                "!doc": "The factory's level. Can be set by applying the PWR_OPERATE_FACTORY power to a newly built factory. Once set, the level cannot be changed.",
                "!type": "number"
            },
        })
    },

    StructureInvaderCore: {
        "!type": "fn()",
        "!doc": "This NPC structure is a control center of NPC Strongholds, and also rules all invaders in the sector. ",
        prototype: _extend({}, def_screeps.OwnedStructure.prototype, {
            ticksToDeploy: {
                "!doc": "Shows the timer for a ot yet deployed stronghold, undefined otherwise.",
                "!type": "number"
            },
            level: {
                "!doc": "The level of the stronghold. The amount and quality of the loot depends on the level.",
                "!type": "number"
            },
        })
    },

    Tombstone: {
        "!type": "fn()",
        "!doc": "A remnant of dead creeps. This is a walkable structure.",
        prototype: _extend({}, _docs.store, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            creep: {
                "!doc": "An object containing the deceased creep.",
                "!type": "+Creep"
            },
            deathTime: {
                "!doc": "Time of death.",
                "!type": "number"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks before this tombstone decays.",
                "!type": "number"
            }
        })
    },

    Ruin: {
        "!type": "fn()",
        "!doc": "A destroyed structure. This is a walkable object.",
        prototype: _extend({}, _docs.store, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            structure: {
                "!doc": "An object containing basic data of the destroyed structure.",
                "!type": "+Structure"
            },
            destroyTime: {
                "!doc": "The time when the structure has been destroyed.",
                "!type": "number"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks before this ruin decays.",
                "!type": "number"
            }
        })
    },

    Deposit: {
        "!type": "fn()",
        "!doc": "A rare resource deposit needed for producing commodities.",
        prototype: _extend({}, def_screeps.RoomObject.prototype, {
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`.",
            },
            cooldown: {
                "!doc": "The amount of game ticks until the next harvest action is possible.",
                "!type": "number"
            },
            depositType: {
                "!doc": "The deposit type, one of the following constants: RESOURCE_MIST, RESOURCE_BIOMASS, RESOURCE_METAL, RESOURCE_SILICON.",
                "!type": "number"
            },
            lastCooldown: {
                "!doc": "The cooldown of the last harvest operation on this deposit.",
                "!type": "number"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when this deposit will disappear.",
                "!type": "number"
            }
        })
    },
})

_extend(def_screeps, {
    PathFinder: {
        "!doc": "Contains powerful methods for pathfinding in the game world. Support exists for custom navigation costs and paths which span multiple rooms. Additionally PathFinder can search for paths through rooms you can't see, although you won't be able to detect any dynamic obstacles like creeps or buildings.\n\nThis module is experimental and disabled by default. Run `PathFinder.use(true)` to enable it in the game methods.",
        search: {
            "!doc": "Find an optimal path between origin and goal.\n\nArguments:\n* origin - The start position.\n* goal - A goal or an array of goals. If more than one goal is supplied then the cheapest path found out of all the goals will be returned. A goal is either a RoomPosition or an object as defined below. Important: Please note that if your goal is not walkable (for instance, a source) then you should set range to at least 1 or else you will waste many CPU cycles searching for a target that you can't walk on.\n  - pos - The target.\n  - range - Range to pos before goal is considered reached. The default is 0.\n\n* opts (optional) - An object containing additional pathfinding flags.\n  - roomCallback - Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix.\n  - plainCost - Cost for walking on plain positions. The default is 1.\n  - swampCost - Cost for walking on swamp positions. The default is 5.\n  - flee - Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.\n  - maxOps - The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.\n  - maxCost - The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to `maxCost` it will immediately halt the search. The default is Infinity.\n  - maxRooms - The maximum allowed rooms to search. The default (and maximum) is 16.\n  - heuristicWeight - Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.2.\n\nReturn value\n\nAn object containing:\n* path - An array of RoomPosition objects.\n* ops - Total number of operations performed before this path was calculated.",
            "!type": "fn(origin: +RoomPosition, goal: ?, opts?: +PathfindingOptions) -> +PathfindingResult"
        },
        use: {
            "!doc": "Specify whether to use this new experimental pathfinder in game objects methods. This method should be invoked every tick. It affects the following methods behavior: Room.findPath, RoomPosition.findPathTo, RoomPosition.findClosestByPath, Creep.moveTo.",
            "!type": "fn(isEnabled: bool)"
        },
        CostMatrix: {
            "!type": "CostMatrix"
        }
    },
    Room: {
        "!type:": "fn()",
        "!doc": "An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the `room` property.",
        prototype: {
            controller: {
                "!doc": "The Controller structure of this room, if present, otherwise undefined.",
                "!type": "+StructureController"
            },
            energyAvailable: {
                "!doc": "Total amount of energy available in all spawns and extensions in the room.",
                "!type": "number"
            },
            energyCapacityAvailable: {
                "!doc": "Total amount of energyCapacity of all spawns and extensions in the room.",
                "!type": "number"
            },
            memory: {
                "!doc": "A shorthand to Memory.rooms[room.name]. You can use it for quick access the room’s specific memory data object."
            },
            mode: {
                "!doc": "One of the MODE_* constants.",
                "!type": "string"
            },
            name: {
                "!doc": "The name of the room.",
                "!type": "string"
            },
            storage: {
                "!doc": "The Storage structure of this room, if present, otherwise undefined.",
                "!type": "+StructureStorage"
            },
            terminal: {
                "!doc": "The Terminal structure of this room, if present, otherwise undefined.",
                "!type": "+StructureTerminal"
            },
            survivalInfo: {
                "!doc": "An object with survival game info if available.",
                score: {
                    "!doc": "Current score",
                    "!type": "number"
                },
                timeToWave: {
                    "!doc": "Time to the next wave of invaders.",
                    "!type": "number"
                },
                wave: {
                    "!doc": "The number of the next wave.",
                    "!type": "number"
                }
            },
            createConstructionSite: {
                "!doc": "Syntax:\ncreateConstructionSite(x, y, structureType, [name])\ncreateConstructionSite(pos, structureType, [name])\n\nCreate new ConstructionSite at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y position.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n* structureType - One of the STRUCTURE_* constants.\n* name (optional) - The name of the structure, for structures that support it (currently only spawns).\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?, arg4?: ?) -> number"
            },
            createFlag: {
                "!doc": "Syntax:\ncreateFlag(x, y, [name], [color], [secondaryColor])\ncreateFlag(pos, [name], [color], [secondaryColor])\n\nCreate new Flag at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y position.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n* name (optional) - The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.\n* color (optional) - The color of a new flag.\n* secondaryColor (optional) - The secondary color of a new flag.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?, arg4?: ?) -> number"
            },
            find: {
                "!doc": "Find all objects of the specified type in the room.\n\nArguments:\n* type - One of the FIND_* constants.\n* opts (optional) - An object with additional options:\n  - filter - The result list will be filtered using the Lodash.filter method.\n\nCPU cost: AVERAGE",
                "!type": "fn(type: number, opts?: object) -> [object]"
            },
            findExitTo: {
                "!doc": "Find the exit direction en route to another room.\n\nArguments:\n* room - Another room name or room object.\n\nCPU cost: HIGH",
                "!type": "fn(room: ?) -> number"
            },
            findPath: {
                "!doc": "Find an optimal path inside the room between fromPos and toPos using A* search algorithm.\n\nArguments:\n* fromPos - The start position.\n* toPos - The end position.\n* opts (optional) - An object containing additonal pathfinding flags:\n  - ignoreCreeps - Treat squares with creeps as walkable. Can be useful with too many moving creeps around or in some other cases. The default value is false.\n  - ignoreDestructibleStructures - Treat squares with destructible structures (constructed walls, ramparts, spawns, extensions) as walkable. Use this flag when you need to move through a territory blocked by hostile structures. If a creep with an ATTACK body part steps on such a square, it automatically attacks the structure. The default value is false.\n  - ignoreRoads - Ignore road structures. Enabling this option can speed up the search. The default value is false. This is only used when the new PathFinder is enabled.\n  - costCallback - You can use this callback to modify a CostMatrix for any room during the search. The callback accepts two arguments, roomName and costMatrix. Use the costMatrix instance to make changes to the positions costs. If you return a new matrix from this callback, it will be used instead of the built-in cached one. This option is only used when the new PathFinder is enabled.\n  - ignore - An array of the room's objects or RoomPosition objects which should be treated as walkable tiles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).\n  - avoid - An array of the room's objects or RoomPosition objects which should be treated as obstacles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).\n  - maxOps - The maximum limit of possible pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.\n  - heuristicWeight - Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.2.\n  - serialize - If true, the result path will be serialized using Room.serializePath. The default is false.\n  - maxRooms - The maximum allowed rooms to search. The default (and maximum) is 16. This is only used when the new PathFinder is enabled.\n  - range - Find a path to a position in specified linear range of target. The default is 0.\n  - plainCost - Cost for walking on plain positions. The default is 1.\n  - swampCost - Cost for walking on swamp positions. The default is 5.\n\nCPU cost: HIGH",
                "!type": "fn(fromPos: +RoomPosition, toPos: +RoomPosition, opts?: +RoomFindPathOptions) -> Path"
            },
            getPositionAt: {
                "!doc": "Creates a RoomPosition object at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y Position.\n\nCPU cost: LOW",
                "!type": "fn(x: number, y: number) -> +RoomPosition"
            },
            lookAt: {
                "!doc": "Syntax:\nlookAt(x, y)\nlookAt(target)\n\nGet the list of objects at the specified room position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n* target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: AVERAGE",
                "!type": "fn(arg1: ?, arg2?: ?) -> LookArray"
            },
            lookAtArea: {
                "!doc": "Get the list of objects at the specified room area.\n\nArguments:\n* top - The top Y boundary of the area.\n* left - The left X boundary of the area.\n* bottom - The bottom Y boundary of the area.\n* right - The right X boundary of the area.\n* asArray (optional) - Set to true if you want to get the result as a plain array.\n\nCPU cost: AVERAGE",
                "!type": "fn(top: number, left: number, bottom: number, right: number, asArray?: bool) -> LookAreaArray"
            },
            lookForAt: {
                "!doc": "Syntax:\nlookForAt(type, x, y)\nlookForAt(type, target)\n\nGet an object with the given type at the specified room position.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n* x - X position in the room.\n* y - Y position in the room.\n* target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?) -> [object]"
            },
            lookForAtArea: {
                "!doc": "Get the list of objects with the given type at the specified room area.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n* top - The top Y boundary of the area.\n* left - The left X boundary of the area.\n* bottom - The bottom Y boundary of the area.\n* right - The right X boundary of the area.\n* asArray (optional) - Set to true if you want to get the result as a plain array.\n\nCPU cost: LOW",
                "!type": "fn(type: string, top: number, left: number, bottom: number, right: number, asArray?: bool) -> LookAreaArray"
            },
            visual: {
                "!doc": "A RoomVisual object for this room. You can use this object to draw simple shapes (lines, circles, text labels) in the room.",
                "!type": "+RoomVisual"
            },
            getTerrain: {
                "!doc": "Get a Room.Terrain object which provides fast access to static terrain data. This method works for any room in the world even if you have no access to it.",
                "!type": "fn() -> +RoomTerrain"
            },
            getEventLog: {
                "!doc": "Returns an array of events happened on the previous tick in this room.\n\nArguments:\n* raw (optional) - If this parameter is false or undefined, the method returns an object parsed using JSON.parse which incurs some CPU cost on the first access (the return value is cached on subsequent calls). If raw is truthy, then raw JSON in string format is returned.\n\nCPU Cost: NONE",
                "!type": "fn(raw?: bool) -> [object]",
            },

        },
        serializePath: {
            "!doc": "Serialize a path array into a short string representation, which is suitable to store in memory.\n\nArguments:\n* path - A path array retrieved from Room.findPath.\n\nCPU cost: LOW",
            "!type": "fn(path: Path) -> string"
        },
        deserializePath: {
            "!doc": "Deserialize a short string path representation into an array form.\n\nArguments:\n* path - A serialized path string.\n\nCPU cost: LOW",
            "!type": "fn(path: string) -> Path"
        },
        Terrain: {
            "!type": "RoomTerrain"
        }
    },
    RoomPosition: {
        "!type:": "fn(x: number, y: number, roomName: string) -> +RoomPosition",
        "!doc": "An object representing the specified position in the room. Every object in the room contains RoomPosition as the pos property. The position object of a custom location can be obtained using the `Room.getPositionAt()` method or using the constructor.",
        prototype: {
            roomName: {
                "!doc": "The name of the room.",
                "!type": "string"
            },
            x: {
                "!doc": "X position in the room.",
                "!type": "number"
            },
            y: {
                "!doc": "Y position in the room.",
                "!type": "number"
            },
            createConstructionSite: {
                "!doc": "Create new ConstructionSite at the specified location.\n\nArguments:\n* structureType - One of the STRUCTURE_* constants.\n* name (optional) - The name of the structure, for structures that support it (currently only spawns).\n\nCPU cost: CONST",
                "!type": "fn(structureType: string, name?: string) -> number"
            },
            createFlag: {
                "!doc": "Create new Flag at the specified location.\n\nArguments:\n* name (optional) - The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.\n* color (optional) - The color of a new flag.\n* secondaryColor (optional) - The secondary color of a new flag.\n\nCPU cost: CONST",
                "!type": "fn(name?: string, color?: string, secondaryColor?: string) -> number"
            },
            findClosestByPath: {
                "!doc": "Syntax:\nfindClosestByPath(type, [opts])\nfindClosestByPath(objects, [opts])\n\nFind an object with the shortest path from the given position. Uses A* search algorithm and Dijkstra's algorithm.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* opts (optional) - An object containing pathfinding options (see Room.findPath), or one of the following:\n  - filter - Only the objects which pass the filter using the Lodash.filter method will be used.\n  - algorithm - One of the following constants:\n    +  astar - is faster when there are relatively few possible targets;\n    + dijkstra - is faster when there are a lot of possible targets or when the closest target is nearby.\n    The default value is determined automatically using heuristics.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, opts?: object) -> object"
            },
            findClosestByRange: {
                "!doc": "Syntax:\nfindClosestByRange(type, [opts])\nfindClosestByRange(objects, [opts])\n\nFind an object with the shortest linear distance from the given position.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* opts (optional) - An object containing one of the following options:\n  - filter - Only the objects which pass the filter using the Lodash.filter method will be used.\n\nCPU cost: AVERAGE",
                "!type": "fn(arg1: ?, opts?: object) -> number"
            },
            findInRange: {
                "!doc": "Syntax:\nfindInRange(type, range, [opts])\nfindInRange(objects, range, [opts])\n\nFind all objects in the specified linear range.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* range - The range distance\n* opts (optional) - See Room.find.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, range: number, opts?: object) -> [object]"
            },
            findPathTo: {
                "!type": "fn(arg1?: ?, arg2?: ?, arg3?: ?) -> Path",
                "!doc": "Syntax:\nfindPathTo(x, y, [opts])\nfindPathTo(target, [opts])\n\nFind an optimal path to the specified position using A* search algorithm. This method is a shorthand for `Room.findPath`. If the target is in another room, then the corresponding exit will be used as a target.\n\nCPU cost: HIGH"
            },
            getDirectionTo: {
                "!doc": "Syntax:\ngetDirectionTo(x,y)\ngetDirectionTo(target)\n\nGet linear direction to the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            },
            getRangeTo: {
                "!doc": "Syntax:\ngetRangeTo(x,y)\ngetRangeTo(target)\n\nGet linear range to the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            },
            inRangeTo: {
                "!doc": "Syntax:\ninRangeTo(x,y,range)\ninRangeTo(target,range)\n\nCheck whether this position is in the given range of another position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n* target - The target position.\n* range - The range distance.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?) -> bool"
            },
            isEqualTo: {
                "!doc": "Syntax:\nisEqualTo(x,y)\nisEqualTo(target)\n\nCheck whether this position is the same as the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> bool"
            },
            isNearTo: {
                "!doc": "Syntax:\nisNearTo(x,y)\nisNearTo(target)\n\nCheck whether this position is on the adjacent square to the specified position. The same as inRangeTo(target, 1).\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> bool"
            },
            look: {
                "!doc": "Get the list of objects at the specified room position.\n\nCPU cost: AVERAGE",
                "!type": "fn() -> LookArray"
            },
            lookFor: {
                "!doc": "Get an object with the given type at the specified room position.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n\nCPU cost: LOW",
                "!type": "fn(type: string) -> [object]"
            }
        }
    },
    RoomVisual: {
        "!type:": "fn(roomName: string) -> +RoomVisual",
        "!doc": "Room visuals provide a way to show various visual debug info in game rooms. You can use the RoomVisual object to draw simple shapes that are visible only to you.",
        roomName: {
            "!doc": "The name of the room.",
            "!type": "string"
        },
        line: {
            "!doc": "Syntax:\nline(x1, y1, x2, y2, [style])\nline(pos1, pos2, [style])\n\nDraw a line.\n\nArguments:\n* x1 - The start X coordinate.\n* y1 - The start Y coordinate.\n* x2 - The finish X coordinate.\n* y2 - The finish Y coordinate.\n* pos1 - The start position object.\n* pos2 - The finish position object.\n* style (optional) - An object with the following properties:\n  - width - Line width, default is 0.1.\n  - color - Line color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - lineStyle - Either undefined (solid line), dashed, or dotted. Default is undefined.",
            "!type": "fn(x1: number, y1: number, x2: number, y2: number, style?: +LineStyle) -> +RoomVisual"
        },
        circle: {
            "!doc": "Syntax:\ncircle(x, y, [style])\ncircle(pos, [style])\n\nDraw a circle.\n\nArguments:\n* x - The X coordinate of the center.\n* y - The Y coordinate of the center.\n* pos - The position object of the center.\n* style (optional) - An object with the following properties:\n  - radius - Circle radius, default is 0.15.\n  - fill - Fill color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(x: number, y: number, style?: +CircleStyle) -> +RoomVisual"
        },
        rect: {
            "!doc": "Syntax:\nrect(x, y, width, height, [style])\nrect(topLeftPos, width, height, [style])\n\nDraw a rectangle.\n\nArguments:\n* x - The X coordinate of the top-left corner.\n* y - The Y coordinate of the top-left corner.\n* topLeftPos - The position object of the top-left corner.\n* width - The width of the rectangle.\n* height - The height of the rectangle.\n* style (optional) - An object with the following properties:\n  - fill - Fill color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(x: number, y: number, width: number, height: number, style?: +PolyStyle) -> +RoomVisual"
        },
        poly: {
            "!doc": "Draw a polyline.\n\nArguments:\n* points - An array of points. Every item should be either an array with 2 numbers (i.e. [10,15]), or a RoomPosition object.\n* style (optional) - An object with the following properties:\n  - fill - Fill color in any web format, default is undefined (no fill).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is #ffffff (white).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(points: [object], style?: +PolyStyle) -> +RoomVisual"
        },
        text: {
            "!doc": "Syntax:\ntext(text, x, y, [style])\ntext(text, pos, [style])\n\nDraw a text label.\n\nArguments:\n* text - The text message.\n* x - The X coordinate of the label baseline point.\n* y - The Y coordinate of the label baseline point.\n* pos - The position object of the label baseline.\n* style (optional) - An object with the following properties:\n  - color - Font color in any web format, default is #ffffff (white).\n  - font - Either a number or a string.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke width, default is 0.15.\n  - background - Background color in any web format, default is undefined (no background). When background is enabled, text vertical align is set to middle (default is baseline).\n  - backgroundPadding - Background rectangle padding, default is 0.3.\n  - align - Text align, either 'center', 'left', or 'right'. Default is 'center'.\n  - opacity - Opacity value, default is 1.0.",
            "!type": "fn(x: number, y: number, width: number, height: number, style?: +TextStyle) -> +RoomVisual"
        },
        clear: {
            "!doc": "Remove all visuals from the room.",
            "!type": "fn() -> +RoomVisual"
        },
        getSize: {
            "!doc": "Get the stored size of all visuals added in the room in the current tick. It must not exceed 512,000 (500 KB).",
            "!type": "fn() -> number"
        }
    },
    RawMemory: {
        "!doc": "RawMemory object allows to implement your own memory stringifier instead of built-in serializer based on JSON.stringify.",
        "get": {
            "!doc": "Get a raw string representation of the Memory object.",
            "!type": "fn() -> string"
        },
        "set": {
            "!doc": "Set new memory value.\n\nArguments:\n* value - New memory value as a string.",
            "!type": "fn(value: string)"
        },
        segments: {
            "!doc": "An object with asynchronous memory segments available on this tick. Each object key is the segment ID with data in string values. Use RawMemory.setActiveSegments to fetch segments on the next tick. Segments data is saved automatically in the end of the tick.",
        },
        setActiveSegments: {
            "!doc": "Request memory segments using the list of their IDs. Memory segments will become available on the next tick in RawMemory.segments object.\n\nArguments:\n* ids - An array of segment IDs. Each ID should be a number from 0 to 99. Maximum 10 segments can be requested simultaneously. Subsequent calls of setActiveSegments override previous ones.",
            "!type": "fn(ids: [number])"
        },
        foreignSegment: {
            "!doc": "An object with a memory segment of another player available on this tick. Use setActiveForeignSegment to fetch segments on the next tick. ",
            username: {
                "!doc": "Another player's name",
                "!type": "string"
            },
            id: {
                "!doc": "The ID of the requested memory segment.",
                "!type": "number"
            },
            data: {
                "!doc": "The segment contents",
                "!type": "string"
            }
        },
        setActiveForeignSegment: {
            "!doc": "Request a memory segment of another user. The segment should be marked by its owner as public using setPublicSegments. The segment data will become available on the next tick in foreignSegment object. You can only have access to one foreign segment at the same time.\n\nArguments:\n* username - The name of another user. Pass null to clear the foreign segment.\n* id - The ID of the requested segment from 0 to 99. If undefined, the user's default public segment is requested as set by setDefaultPublicSegment.",
            "!type": "fn(username: string, id?: number)"
        },
        setDefaultPublicSegment: {
            "!doc": "Set the specified segment as your default public segment. It will be returned if no id parameter is passed to setActiveForeignSegment by another user.\n\nArguments:\n* id - The ID of the memory segment from 0 to 99. Pass null to remove your default public segment.",
            "!type": "fn(id: number)"
        },
        setPublicSegments: {
            "!doc": "Set specified segments as public. Other users will be able to request access to them using setActiveForeignSegment.\n\nArguments:\n* ids - An array of segment IDs. Each ID should be a number from 0 to 99. Subsequent calls of setPublicSegments override previous ones.",
            "!type": "fn(ids: [number])"
        },
        interShardSegment: {
            "!doc": "A string with a shared memory segment available on every world shard. Maximum string length is 100 KB.\n\nWarning: this segment is not safe for concurrent usage! All shards have shared access to the same instance of data. When the segment contents is changed by two shards simultaneously, you may lose some data, since the segment string value is written all at once atomically. You must implement your own system to determine when each shard is allowed to rewrite the inter-shard memory, e.g. based on mutual exclusions.",
            "!type": "string"
        }
    },
    Memory: {
        "!doc": "The global object Memory in which you may store any information in the JSON format."
    },
    InterShardMemory: {
        "!doc": "InterShardMemory object provides an interface for communicating between shards.\n\nEvery shard can have its own 100 KB of data in string format that can be accessed by all other shards. A shard can write only to its own data, other shards' data is read-only.\n\nThis data has nothing to do with Memory contents, it's a separate data container.",
        getLocal: {
            "!doc": "Returns the string contents of the current shard's data.",
            "!type": "fn() -> string"
        },
        setLocal: {
            "!doc": "Replace the current shard's data with the new value.\n\nArguments:\n* value - New data value in string format.\n",
            "!type": "fn(value: string)"
        },
        getRemote: {
            "!doc": "Returns the string contents of another shard's data.\n\nArguments:\n* shard - Shard name.\n",
            "!type": "fn(shard: string) -> string"
        }
    },
    Game: {
        "!doc": "The main global game object containing all the gameplay information.",
        cpu: {
            "!doc": "An object containing information about your CPU usage.",
            limit: {
                "!doc": "Your CPU limit depending on your Global Control Level.",
                "!type": "number"
            },
            tickLimit: {
                "!doc": "An amount of available CPU time at the current game tick. It can be higher than `Game.cpu.limit`.",
                "!type": "number"
            },
            bucket: {
                "!doc": "An amount of unused CPU accumulated in your bucket.",
                "!type": "number"
            },
            getUsed: {
                "!doc": "Get amount of CPU time used from the beginning of the current game tick. Always returns 0 in the Simulation mode.\n\nCPU cost: LOW",
                "!type": "fn() -> number"
            },
            shardLimits: {
                "!doc": "An object with limits for each shard with shard names as keys. You can use setShardLimits method to re-assign them."
            },
            setShardLimits: {
                "!doc": "Allocate CPU limits to different shards. Total amount of CPU should remain equal to Game.cpu.shardLimits. This method can be used only once per 12 hours.",
                "!type": "fn(limits: object) -> number"
            },
            getHeapStatistics: {
                "!doc": "Use this method to get heap statistics for your virtual machine. The return value is almost identical to the Node.js function v8.getHeapStatistics(). This function returns one additional property: externally_allocated_size which is the total amount of currently allocated memory which is not included in the v8 heap but counts against this isolate's memory limit. ArrayBuffer instances over a certain size are externally allocated and will be counted here.",
                "!type": "fn() -> +HeapStatistics"
            }
        },

        constructionSites: {
            "!doc": "A hash containing all your construction sites with their id as hash keys.",
            "!type": "[+ConstructionSite]"
        },

        creeps: {
            "!doc": "A hash containing all your creeps with creep names as hash keys.",
            "!type": "[+Creep]"
        },
        powerCreeps: {
            "!doc": "A hash containing all your Power Creeps with their names as hash keys.",
            "!type": "[+PowerCreep]"
        },
        flags: {
            "!doc": "A hash containing all your flags with flag names as hash keys.",
            "!type": "[+Flag]"
        },
        gcl: {
            "!doc": "Your Global Control Level, an object with the following properties :",
            level: {
                "!doc": "The current level.",
                "!type": "number"
            },
            progress: {
                "!doc": "The current progress to the next level.",
                "!type": "number"
            },
            progressTotal: {
                "!doc": "The progress required to reach the next level.",
                "!type": "number"
            }
        },
        gpl: {
            "!doc": "Your Global Power Level, an object with the following properties:",
            level: {
                "!doc": "The current level.",
                "!type": "number"
            },
            progress: {
                "!doc": "The current progress to the next level.",
                "!type": "number"
            },
            progressTotal: {
                "!doc": "The progress required to reach the next level.",
                "!type": "number"
            }
        },
        market: {
            "!doc": "A global object representing the in-game market. You can use this object to track resource transactions to/from your terminals, and your buy/sell orders.",
            incomingTransactions: {
                "!doc": "An array of the last 100 incoming transactions to your terminals.",
                "!type": "[Transaction]"
            },
            outgoingTransactions: {
                "!doc": "An array of the last 100 outgoing transactions from your terminals.",
                "!type": "[Transaction]"
            },
            calcTransactionCost: {
                "!doc": "Estimate the energy transaction cost of StructureTerminal.send and Market.deal methods. The formula: Math.ceil( amount * (Math.log(0.1*linearDistanceBetweenRooms + 0.9) + 0.1) )\n\nArguments:\n* amount - Amount of resources to be sent.\n* roomName1 - The name of the first room.\n* roomName2 - The name of the second room.\n\nCPU cost: NONE",
                "!type": "fn(amount: number, roomName1: string, roomName2: string) -> number"
            },
            credits: {
                "!doc": "Your current credits balance.",
                "!type": "number"
            },
            orders: {
                "!doc": "An object with your active and inactive buy/sell orders on the market.",
                "!type": "[MarketOrder]"
            },
            cancelOrder: {
                "!doc": "Cancel a previously created order. The 5% fee is not returned.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string) -> number"
            },
            createOrder: {
                "!doc": "Create a market order in your terminal. You will be charged price*amount*0.05 credits when the order is placed. The maximum orders count is 20 per player. You can create an order at any time with any amount, it will be automatically activated and deactivated depending on the resource/credits availability.\n\nArguments:\n* type - The order type, either ORDER_SELL or ORDER_BUY.\n* resourceType - Either one of the RESOURCE_* constants or SUBSCRIPTION_TOKEN. If your Terminal doesn't have the specified resource, the order will be temporary inactive.\n* price - The price for one resource unit in credits. Can be a decimal number.\n* totalAmount - The amount of resources to be traded in total. The minimum amount is 100.\n* roomName (optional) - The room where your order will be created. You must have your own Terminal structure in this room, otherwise the created order will be temporary inactive. This argument is not used when resourceType equals to SUBSCRIPTION_TOKEN.\n\nCPU cost: CONST",
                "!type": "fn(type: string, resourceType: string, price: number, totalAmount: number, roomName?: string) -> number"
            },
            deal: {
                "!doc": "Execute a trade deal from your Terminal to another player's Terminal using the specified buy/sell order. Your Terminal will be charged energy units of transfer cost regardless of the order resource type. You can use Game.market.calcTransactionCost method to estimate it. When multiple players try to execute the same deal, the one with the shortest distance takes precedence.\n\nArguments:\n* orderId - The order ID as provided in Game.market.getAllOrders.\n* amount - The amount of resources to transfer. The minimum amount is 100.\n* targetRoomName (optional) - The name of your room which has to contain an active Terminal with enough amount of energy. This argument is not used when the order resource type equals to SUBSCRIPTION_TOKEN.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, amount: number, targetRoomName?: string) -> number"
            },
            getAllOrders: {
                "!doc": "Get other players' orders currently active on the market.\n\nArguments:\n* filter (optional) - An object or function that will filter the resulting list using the lodash.filter method.\n\nCPU cost: AVERAGE",
                "!type": "fn(filter?: any) -> [MarketOrder]"
            },
            getOrderById: {
                "!doc": "Retrieve info for specific market order.\n\nArguments:\n* orderId - The order ID.\n\nCPU cost: LOW",
                "!type": "fn(id: string) -> +MarketOrder"
            },
            extendOrder: {
                "!doc": "Add more capacity to an existing order. It will affect remainingAmount and totalAmount properties. You will be charged price*addAmount*0.05 credits.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n* addAmount - How much capacity to add. Cannot be a negative value.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, addAmount: number) -> number"
            },
            changeOrderPrice: {
                "!doc": "Change the price of an existing order. If newPrice is greater than old price, you will be charged (newPrice-oldPrice)*remainingAmount*0.05 credits.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n* newPrice - The new order price.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, newPrice: number) -> number"
            },
            getHistory: {
                "!doc": "Get daily price history of the specified resource on the market for the last 14 days.\n\nArguments\n\n* resorceType (optional) - One of the RESOURCE_* constants. If undefined, returns history data for all resources.",
                "!type": "fn(resourceType?: string) -> [MarketHistoryItem]"
            },
        },
        map: {
            "!doc": "A global object representing world map. Use it to navigate between rooms.",
            describeExits: {
                "!doc": "List all exits available from the room with the given name.\n\nArguments:\n* roomName - The room name.\n\nCPU cost: LOW",
                "!type": "fn(roomName: string) -> [string]"
            },
            findExit: {
                "!doc": "Find the exit direction from the given room en route to another room.\n\nArguments:\n* fromRoom - Start room name or room object.\n* toRoom - Finish room name or room object.\n\nCPU cost: HIGH",
                "!type": "fn(fromRoom: ?, toRoom: ?) -> number"
            },
            findRoute: {
                "!doc": "Find route from the given room to another room.\n\nArguments:\n* fromRoom - Start room name or room object.\n* toRoom - Finish room name or room object.\n* opts - An object with the following options:\n  - routeCallback - This callback accepts two arguments: function(roomName, fromRoomName). It can be used to calculate the cost of entering that room. You can use this to do things like prioritize your own rooms, or avoid some rooms. You can return a floating point cost or Infinity to block the room.\n\nCPU cost: HIGH",
                "!type": "fn(fromRoom: ?, toRoom: ?, opts?: +FindRouteOptions) -> [MapRouteStep]"
            },
            isRoomProtected: {
                "!doc": "Check if the room with the given name is protected by temporary \"newbie\" walls.\n\nArguments:\n* roomName - The room name.\n\nCPU cost: AVERAGE",
                "!type": "fn(roomName: string) -> bool"
            },
            getTerrainAt: {
                "!doc": "Syntax:\ngetTerrainAt(x, y, roomName)\ngetTerrainAt(pos)\n\nGet terrain type at the specified room position. This method works for any room in the world even if you have no access to it.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n* roomName - The room name\n* pos - The position object\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?) -> string"
            },
            getRoomLinearDistance: {
                "!doc": "Get linear distance (in rooms) between two rooms. You can use this function to estimate the energy cost of sending resources through terminals, or using observers and nukes. \n\nArguments:\n* roomName1 - The name of the first room.\n* roomName2 - The name of the second room.\n* continuous (optional) - Whether to treat the world map continuous on borders. Set to true if you want to calculate the terminal send or trade fee.\n\nCPU cost: NONE",
                "!type": "fn(roomName1: string, roomName2: string, continuous?: boolean) -> number"
            },
            getWorldSize: {
                "!doc": "Returns the world size as a number of rooms between world corners. For example, for a world with rooms from W50N50 to E50S50 this method will return 102.\n\nCPU cost: NONE",
                "!type": "fn() -> number"
            },
            getRoomTerrain: {
                "!doc": "Get a Room.Terrain object which provides fast access to static terrain data. This method works for any room in the world even if you have no access to it.\n\nArguments:\n* roomName - The room name\n\nCPU Cost: LOW",
                "!type": "fn(roomName: string) -> +RoomTerrain"
            }
        },
        resources: {
            "!doc": "An object with your global resources that are bound to the account, like subscription tokens. Each object key is a resource constant, values are resources amounts.",
        },
        rooms: {
            "!doc": "A hash containing all the rooms available to you with room names as hash keys. A room is visible if you have a creep or an owned structure in it.",
            "!type": "[+Room]"
        },
        shard: {
            "!doc": "An object describing the world shard where your script is currently being executed in.",
            name: {
                "!doc": "The name of the shard",
                "!type": "string"
            },
            type: {
                "!doc": "Currently always equals to 'normal'.",
                "!type": "string"
            },
            ptr: {
                "!doc": "Whether this shard belongs to the PTR.",
                "!type": "boolean"
            }
        },
        spawns: {
            "!doc": "A hash containing all your spawns with spawn names as hash keys.",
            "!type": "[+StructureSpawn]"
        },
        structures: {
            "!doc": "A hash containing all your structures with structure id as hash keys.",
            "!type": "[+OwnedStructure]"
        },
        time: {
            "!doc": "System game tick counter. It is automatically incremented on every tick.",
            "!type": "number"
        },
        getObjectById: {
            "!doc": "Get an object with the specified unique ID. It may be a game object of any type. Only objects from the rooms which are visible to you can be accessed.\n\nArguments:\n* id - The unique identificator.\n\nCPU cost: NONE",
            "!type": "fn(id: string) -> object"
        },
        notify: {
            "!doc": "Send a custom message at your profile email. This way, you can set up notifications to yourself on any occasion within the game. You can schedule up to 20 notifications during one game tick. Not available in the Simulation Room.\n\nArguments:\n* message - Custom text which will be sent in the message. Maximum length is 1000 characters.\n* groupInterval - If set to 0 (default), the notification will be scheduled immediately. Otherwise, it will be grouped with other notifications and mailed out later using the specified time in minutes.\n\nCPU cost: CONST",
            "!type": "fn(message: string, groupInterval?: number) -> number"
        }
    },
});

const constants = require('@screeps/common/lib/constants');

for(var i in constants) {
    def_screeps[i] = typeof constants[i];
}


fs.writeFileSync('defs/screeps.json', JSON.stringify(def_screeps, undefined, 2));
