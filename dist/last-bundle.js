function toggleBlips(){for(var e in _blips){var t=_blips[e];console._log("Disabled ("+e+")? "+_disabledBlips.includes(e)),-1==_disabledBlips.indexOf(e)?t.forEach(e=>{var t=MarkerStore[e.markerId];_showBlips?t.addTo(Map):t.remove()}):(console._log("Blip "+e+"'s are disabled.."),t.forEach(e=>{console.log(e),MarkerStore[e.markerId].remove()}))}}function initMapControl(e){e.on("baselayerchange",function(t){var o=getMapBounds(t.layer);e.setMaxBounds(o),e.fitBounds(o),CurrentLayer=t.layer,clearAllMarkers(),toggleBlips()})}function initPlayerMarkerControls(e,t){t.on("clusterclick",function(t){for(var o=L.DomUtil.create("ul"),r=t.layer.getAllChildMarkers(),n=0;n<r.length;n++){var s=r[n].options,l=s.title,i=L.DomUtil.create("li","clusteredPlayerMarker");i.setAttribute("data-identifier",s.player.identifier),i.appendChild(document.createTextNode(l)),o.appendChild(i)}L.DomEvent.on(o,"click",function(t){var o=t.target.getAttribute("data-identifier"),r=PopupStore[localCache[o].marker];e.closePopup(e._popup),e.openPopup(r)}),e.openPopup(o,t.layer.getLatLng())})}$(document).ready(function(){globalInit(),$("#showBlips").click(function(e){e.preventDefault(),_showBlips=!_showBlips,toggleBlips(),$("#blips_enabled").removeClass("badge-success").removeClass("badge-danger").addClass(_showBlips?"badge-success":"badge-danger").text(_showBlips?"on":"off")}),$("#toggle-all-blips").on("click",function(){_blipControlToggleAll=!_blipControlToggleAll,console._log(_blipControlToggleAll+" showing blips?"),$("#blip-control-container").find("a").each(function(e,t){var o=(t=$(t)).data("blip-number").toString();_blipControlToggleAll?(_disabledBlips.splice(_disabledBlips.indexOf(o),1),t.removeClass("blip-disabled").addClass("blip-enabled")):(_disabledBlips.push(o),t.removeClass("blip-enabled").addClass("blip-disabled"))}),toggleBlips()}),$("#playerSelect").on("change",function(){""!=this.value?(Map.setZoom(3),_trackPlayer=this.value):_trackPlayer=null}),$("#filterOn").on("change",function(){""!=this.value?window.Filter={on:this.value}:window.Filter=void 0}),$("#refreshBlips").click(function(e){e.preventDefault(),clearAllMarkers(),initBlips(connectedTo.getBlipUrl())}),$("#server_menu").on("click",".serverMenuItem",function(e){console._log($(this).text()),changeServer($(this).text())}),$("#reconnect").click(function(e){e.preventDefault(),$("#connection").removeClass("badge-success").removeClass("badge-danger").addClass("badge-warning").text("reconnecting"),null==webSocket&&null==webSocket||webSocket.close(),connect()})});class VersionCheck{constructor(){this.versionFile="version.json",this.currentVersion="0.0.0",this.remoteVersion="4.0.0",this.remoteVersionUrl="https://raw.githubusercontent.com/TGRHavoc/live_map-interface/master/version.json",this.doUpdate()}updateInterface(){document.getElementById("livemap_version").textContent=this.currentVersion}getCurrentVersion(e){const t=this;Requester.sendRequestTo(t.versionFile,function(o){var r=JSON.parse(JsonStrip.stripJsonOfComments(o.responseText));t.currentVersion=r.interface,null!=e&&e()},function(e){Alerter.createAlert({status:"error",text:`Got response ${e.status} from server.`})})}getRemoteVersion(e){const t=this;Requester.sendRequestTo(t.remoteVersionUrl,function(o){var r=JSON.parse(JsonStrip.stripJsonOfComments(o.responseText));t.remoteVersion=r.interface,null!=e&&e()},function(e){Alerter.createAlert({status:"error",text:`Got response ${e.status} from server.`})})}doUpdate(){const e=this;this.getCurrentVersion(function(){e.updateInterface(),e.getRemoteVersion(function(){window.compareVersions(e.currentVersion,e.remoteVersion)<0?Alerter.createAlert({title:"Update available",text:`An update is available (${e.currentVersion} -> ${e.remoteVersion}). Please download it <a style='color: #000;' href='https://github.com/TGRHavoc/live_map-interface'>HERE.</a>`}):Alerter.createAlert({status:"success",title:"Version up to date",text:`Have fun with ${e.currentVersion} of LiveMap!`,autoclose:!0,autotimeout:2e3})})})}}window.VersionCheck=new VersionCheck;