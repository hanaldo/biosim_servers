function Actor(type, id, name) {//reactor is same as actor
    this.type = type;
    this.id = id;
    this.name = name;
    this.loads = [];//not used
    this.status = null;//reserved for later use
    this.model = null;
    this.dyProps = {};
    this.space = 1;//for two-window mode
}

function Action(type, actorId, reactorId, world) {
    this.type = type;
    this.actor = actorId;
    this.reactor = reactorId;
    this.worldCopy = world;
    this.objectsCopy = [];//copy of actor objects
    this.worldDurationDiff = 0;
    this.actionIndex = -1;
}

function World(startTime, currentTime) {
    this.startTime = startTime;
    this.weather = null;
    this.xPositions = 0;
    this.yPositions = 0;
    this.currentTime = currentTime;
    this.gameHolder = null;
}