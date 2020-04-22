
/*     
*      TracCar2APRS v1
*     Criado em Abril/2020 por PU3IKE Henrique B. Gravina
*          
*/


/*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA
*/

/* 
  user_list example:
  user_list= { 
  "UniqueIDFromTracCar": { Call:"N0CALL-1",TableSelection:"/",TableIcom:"j",CommentText:"#Data from TracCar 1 "},
  "UniqueIDFromTracCar": { Call:"N1CALL-2",TableSelection:"/",TableIcom:"a",CommentText:"#Data from TracCar 2 "} 
}
*/

user_list = { "4210263856":{ Call: "NOCALL-1",TableSelection:"/",TableIcom:"j",CommentText:"#Data from TracCar"}}

const callsign = "N0CALL" // Call sign to send data to APRS-IS server
const aprs_pass = "000000" // Pass code to aprs network


//HTTP server config to receive Traccar Json
const http = require('http')
const port = 3001  // Port to receive TracCar forward requests
const ip = '0.0.0.0' // I recomend that this service runs only to local machine access(127.0.0.1), but you can run it open to World(0.0.0.0)

// Socket config to aprs-is server
var net = require('net');
var client = new net.Socket();

const aprs_is_server="rotate.aprs2.net" // Host name of APRS-IS server
const aprs_is_server_port ="14580" // Almost all servers use the same port


function connect_to_aprsis(){
  client.connect(aprs_is_server_port, aprs_is_server, function() {
      console.log(`Connected to APRS-IS server:${aprs_is_server} `);
      client.write(`user ${callsign} pass ${aprs_pass}\n`)
});
}

connect_to_aprsis();

client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
  console.log('Connection closed...');
  connect_to_aprsis();
});


function parse_data(traccar_data){
  
   
   if(user_list[traccar_data.device.uniqueId]){
      
    user_data = user_list[traccar_data.device.uniqueId]
    dxcallsign = user_data["Call"]
    table_selection = user_data["TableSelection"]
    table_icon = user_data["TableIcom"]
    comment_text = user_data["CommentText"]


       // Convert traccar postion format to APRS compatible:
      latitude_tc = traccar_data.position.latitude;
      longitude_tc = traccar_data.position.longitude;
 
      latitude_degree = (~~latitude_tc) * -1
      latitude_minutes = (latitude_tc *-1 ) - latitude_degree
      latitude_decimals = latitude_minutes * 60
      latitude = (latitude_degree *100) + latitude_decimals
      latitude = latitude.toFixed(2)

      longitude_degree = (~~longitude_tc) * -1
      longitude_minutes = (longitude_tc *-1 ) - longitude_degree
      longitude_decimals = longitude_minutes * 60
      longitude = (longitude_degree *100) + longitude_decimals
      longitude = longitude.toFixed(2)
      
      var lat_sig = latitude_tc  < 0 ? "S" : "N";
      var lon_sig = longitude_tc < 0 ? "W" : "E";
      var lon_siz = (longitude_tc * -1) < 100 ? "0" : "";

      latitude = `${latitude}${lat_sig}`
      longitude =`${lon_siz}${longitude}${lon_sig}`

      // Build the aprs package 
      aprs_package = (`${dxcallsign}>APTCHE:=${latitude}${table_selection}${longitude}${table_icon}${comment_text}\n`)
      
      console.log(aprs_package)
      client.write(aprs_package)

  }
}

const server = http.createServer((req, res) => {
  let data = []
  req.on('data', chunk => {
    data.push(chunk)
  })
  req.on('end', () => {
    teste = JSON.parse(data)
    parse_data(teste)
  })
})

// Start HTTP server
server.listen(port, ip, () => {
  console.log(`HTTP Server at http://${ip}:${port}`)
})
