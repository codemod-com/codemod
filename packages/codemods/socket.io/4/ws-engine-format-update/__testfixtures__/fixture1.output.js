const io = require("socket.io")(httpServer, {
    wsEngine: require("eiows").Server
});