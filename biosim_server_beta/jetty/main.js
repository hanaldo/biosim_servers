const cp = require("child_process");
const fs = require("fs");

let javaProcess;

process.on("SIGINT", function() {
  console.log("Kill javaProcess");
  javaProcess.kill("SIGINT");
  process.exit();
});

let mainWindow;

const {
  app,
  BrowserWindow,
  dialog
} = require("electron");
app.commandLine.appendSwitch("disable-http-cache");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function() {
  var path = app.getAppPath();
  //var path = app.getAppPath().replace("default_app.asar", "");

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  mainWindow.loadFile("loading.html");

  mainWindow.on("closed", function() {
    mainWindow = null
  });

  javaProcess = cp.exec("java -jar start.jar", {
    cwd: app.getAppPath()
  }, (error, stdout, stderr) => {
    console.log("Java command finished");
  });

  // javaProcess.stderr.pipe(fs.createWriteStream(path + "/log.txt", {
  //   flags: "w"
  // }));

  javaProcess.stdout.on("data", function(data) {
    if (data.includes("Thank you! You server is ready")) {
      console.log("Java server ready!");
      console.log("Wait 1 second to load index page...");
      setTimeout(function() {
        mainWindow.loadURL("http://localhost:8080/index.html");
      }, 1000);
    }
  });

  //mainWindow.webContents.openDevTools();
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  console.log("Bye BioSim");
  app.quit();
});

app.on("quit", function() {
  console.log("Kill javaProcess");
  javaProcess.kill("SIGINT");
});
