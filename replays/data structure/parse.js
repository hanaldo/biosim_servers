const fs = require("fs");
fs.readFile("test.json", (err, data) => {
  if (err) throw err;

  var obj = JSON.parse(data);
  console.log(obj.world);

  var actions = obj.current.allActions;

  actions.forEach(function(action) {
    if (action.type === "checkTrack") {
      console.log("Action index: " + action.actionIndex);
      var updatedActors = action.objectsCopy;
      updatedActors.forEach(function(actorUpdated) {
        console.log("Actor: " + actorUpdated.actorId);
        var path = actorUpdated.pathGroup.points;
        console.log("Path:");
        path.forEach(function(point) {
          console.log(point);
        });
      });
      console.log("\n");
    }
  });
});
