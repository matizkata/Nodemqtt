const { testView } = require('./script1');
//const { sendESPstate } = require('./mqtt/mqtt_client');
const { port } = require('./mqtt/mqtt_client');
console.log(port);
testView();
//sendESPstate('esp3','gpio4',1);
while(1){
  console.log(port);
}
