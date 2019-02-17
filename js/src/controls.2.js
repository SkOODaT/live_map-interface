// ************************************************************************** //
//            LiveMap Interface - The web interface for the livemap
//                    Copyright (C) 2017  Jordan Dalton
//
//      This program is free software: you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation, either version 3 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program in the file "LICENSE".  If not, see <http://www.gnu.org/licenses/>.
// ************************************************************************** //

function toggleBlips(){
    console._log("showing local blips");
    if (_showBlips){

        for(var spriteId in _blips){
            var blipArray = _blips[spriteId];
            //console._log("Disabled (" + spriteId + ")? " + _disabledBlips.includes(spriteId));

            if(_disabledBlips.indexOf(spriteId) != -1){
                if(_SETTINGS_debug){
                    console._log("Blip " + spriteId + "'s are disabled..");
                }
                // If disabled, don't make a marker for it
                continue;
            }

            for(var i in blipArray){
                var blip = blipArray[i];

                var obj = new MarkerObject(blip.name, new Coordinates(blip.pos.x, blip.pos.y, blip.pos.z), MarkerTypes[blip.type], blip.description, "", "");
                blip.markerId = createMarker(false, false, obj, "") - 1;
            }
        }

    }else{
        clearAllMarkers();
    }
}

$(document).ready(function(){
    globalInit();

    $("#playerSelect").on("change", function(){
        if (this.value == ""){
            _trackPlayer = null;
            return;
        }

        Map.setZoom(3);// zoom in!
        _trackPlayer = this.value;
    });

    $("#refreshBlips").click(function(e){
        e.preventDefault();
        if (_showBlips){
            clearAllMarkers();
            initBlips();
        }
    });

    $("#server_menu").on("click", ".serverMenuItem", function(e){
        console._log($(this).text());
        changeServer($(this).text());
    });

    $("#showBlips").click(function(e){
        e.preventDefault();

        _showBlips = !_showBlips;

        //webSocket.send("getBlips");
        toggleBlips();

        $("#blips_enabled").removeClass("badge-success").removeClass("badge-danger")
            .addClass( _showBlips ? "badge-success" : "badge-danger")
            .text(_showBlips ? "on" : "off");
    });

    $("#reconnect").click(function(e){
        e.preventDefault();

        $("#connection").removeClass("badge-success").removeClass("badge-danger").addClass("badge-warning").text("reconnecting");

        if(webSocket != undefined || webSocket != null){
            webSocket.close();
        }

        connect();
    });

    $("#toggle-all-blips").on("click", function(){
        // Toggle the classes and add/remove the blipIds from the array
        $("#blip-control-container").find("a").each(function(index, ele){
            var ele = $(ele);
            var blipId = ele.data("blipNumber").toString();

            // Toggle blip
            if(_disabledBlips.includes(blipId)){
                // Already disabled, enable it
                _disabledBlips.splice(_disabledBlips.indexOf(blipId), 1);
                ele.removeClass("blip-disabled").addClass("blip-enabled");
            }else{
                // Enabled, disable it
                _disabledBlips.push(blipId);
                ele.removeClass("blip-enabled").addClass("blip-disabled");
            }
        });

        // Now we can refresh the markers
        clearAllMarkers();
        toggleBlips();
    });
});

function initControls(Map, PlayerMarkers){

    // If they click on a clustered marker
    PlayerMarkers.on('clusterclick', function (a) {

        var html = L.DomUtil.create('ul');
        var markers = a.layer.getAllChildMarkers();
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i].options;

            var name = marker.title;
            var child = L.DomUtil.create("li", "clusteredPlayerMarker");
            child.setAttribute("data-identifier", marker.player.identifer);
            child.appendChild(document.createTextNode(name));

            html.appendChild(child);
        }

        L.DomEvent.on(html, "click", function(e){
            var t = e.target;
            var attribute = t.getAttribute("data-identifier");
            var m = MarkerStore[localCache[attribute].marker]; // Get the marker using the localcache.

            Map.closePopup(Map._popup); //Close the currently open popup
            Map.openPopup(m.getPopup()); // Open the user's popup
        });

        Map.openPopup(html, a.layer.getLatLng());
    });

    // When a layer changes. Recalculate everything and shit. Make sure nothing breaks.
    Map.on("baselayerchange", function (e) {

        var mapBounds = getMapBounds(e.layer);

        Map.setMaxBounds(mapBounds);
        Map.fitBounds(mapBounds);
        CurrentLayer = e.layer;

        Map.removeLayer(PlayerMarkers); // Remove the cluster layer
        window.PlayerMarkers = L.markerClusterGroup({ // Re-make it fresh
            maxClusterRadius: 20,
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });
        Map.addLayer(PlayerMarkers); // Add it back. The clearAllMarkers() will ensure player markers are added to the new cluster layer

        clearAllMarkers();
        toggleBlips();
    });
}