import { Config } from "./config.js";
import { Translator } from "./translator.js";
import { Markers } from "./markers.js";
import {SocketHandler} from "./socket.js";
import {MapWrapper} from "./map.js";
import {Alerter} from "./alerter.js";
import {VersionCheck} from "../last_bundle/version-check.js";

// This file should initialize the map and set everything up for it to work.

export class Initializer {

    static page(config){
        let serverMenu = document.getElementById("server_menu");
        for (const serverName in config.servers) {
            let li = document.createElement("li");
            let link = document.createElement("a");
            link.classList.add("dropdown-item", "serverMenuItem");
            link.href = "#";
            link.innerText = serverName;

            li.appendChild(link);
            serverMenu.appendChild(li);
            //$("#server_menu").append("<a class='dropdown-item serverMenuItem' href='#'>" + serverName + "</a>");
        }
    }

    static async blips(url, markers){
        Config.log("Sending request to ", url);

        try{
            let response = await fetch(url);
            let data = await response.json();

            for (var spriteId in data) {
                if (data.hasOwnProperty(spriteId)) {
                    // data[spriteId] == array of blips for that type
                    var blipArray = data[spriteId];

                    for (var i in blipArray) {
                        var blip = blipArray[i];
                        var fallbackName = (markers.MarkerTypes[spriteId] != undefined && markers.MarkerTypes[spriteId].hasOwnProperty("name")) ? markers.MarkerTypes[spriteId].name : "Unknown Name... Please make sure the sprite exists.";

                        blip.name = (blip.hasOwnProperty("name") || blip.name != null) ? blip.name : fallbackName;
                        blip.description = (blip.hasOwnProperty("description") || blip.description != null) ? blip.description : "";

                        blip.type = spriteId;
                        //TODO: Implement
                        //createBlip(blip);
                    }
                }
            }

            //TODO: Implement
            // Config.log(_blipCount + " blips created");
            // document.getElementById("blip_count").innerText = _blipCount;
            //$("#blip_count").text(_blipCount);
            //toggleBlips();

        }catch(error){
            console.error("Error ", error);

            new Alerter({
                status: "error",
                title: "Error getting blips!",
                text: error.message
            });
        }
    }
}

// Modules should be deferred so, DOM should be loaded already when we get here..

(async () => {
    window.VersionCheck = new VersionCheck();
    let translator = window.Translator = new Translator();

    let config = undefined;

    try{
        await translator.getLanguageFromFile();

        config = await Config.getConfigFileFromRemote();

    }catch(ex){
        console.error("Couldn't load LiveMap")
        console.error(ex);
        return;
    }

    for (const serverName in config.servers) {
        // Make sure all servers inherit defaults if they need
        let o = Object.assign({}, config.defaults, config.servers[serverName]);
        Config.staticConfig.servers[serverName] = o;
    }

    const markers = window.markers = new Markers(config);
    const socketHandler = window.socketHandler = new SocketHandler();
    const mapWrapper = window.mapWrapper = new MapWrapper(socketHandler);

    Initializer.page(config); // TODO: Initialize controls
    mapWrapper.changeServer(Object.keys(Config.staticConfig.servers)[0]); // Show the stuff for the first server in the config.
})();

// document.addEventListener('DOMContentLoaded', () => {
//     window.Translator = new Translator();

//     window.Translator.getLanguageFromFile(() => {

//         Config.getConfigFileFromRemote(function(success){

//             if (!success){ // We can't do anything
//                 console.error("Cannot load map as we can't load config.json");
//                 return;
//             }

//             const config = Config.getConfig();
//             for (const serverName in config.servers) {
//                 // Make sure all servers inherit defaults if they need
//                 var o = Object.assign({}, config.defaults, config.servers[serverName]);
//                 Config.staticConfig.servers[serverName] = o;
//             }

//             const markers = window.markers = new Markers(config); // initMarkers

//             const socketHandler = window.socketHandler = new SocketHandler();
//             const mapWrapper = window.mapWrapper = new MapWrapper(socketHandler); // mapInit

//             // todo: Initialize controls/page
//             Initializer.page(config);

//             mapWrapper.changeServer(Object.keys(Config.staticConfig.servers)[0]); // Show the stuff for the first server in the config.
//         });
//     });
// });
