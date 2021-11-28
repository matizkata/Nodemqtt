var fs = require('fs');
const mqtt = require('mqtt')
const host = 'mklocalbroker.local'
const port = '8883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `mqtts://${host}:${port}`
var crypto = require('crypto');
var CAfile = [fs.readFileSync(('./certs/cacert.pem'))];

globalStates = {
  gpio1esp3: 7,
  gpio2esp3: null,
  gpio3esp3: null,
  gpio4esp3: null
}

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  //connectTimeout: 4000,
  username: 'esplocal',
  password: 'esplocal',
  //reconnectPeriod: 1000,
  ca: CAfile
})

client.on('connect', () => {
  console.log('Connected')
  client.subscribe('smarthome/data/esp3', () => {
    console.log(`Subscribed smarthome/data/esp3`)
  })
})

client.on('message', (topic, payload) => {
  let receivedObject = JSON.parse(payload.toString()) ;
  receivedAuthDigest = receivedObject['auth'];
  switch (topic) {
    case 'smarthome/data/esp3':
      var objectToVerify = {
        gpio1: receivedObject['gpio1'],
        gpio2: receivedObject['gpio2'],
        gpio3: receivedObject['gpio3'],
        gpio4: receivedObject['gpio4'],
        sensor: receivedObject['sensor']
      }
  }
  let hmacOfReceivedPayload = generateHMAC(objectToVerify);
  if(compareHMAC(hmacOfReceivedPayload, receivedAuthDigest)){
    console.log("These auth hmacs are the same");
    globalStates = objectToVerify;
    console.log(hmacOfReceivedPayload);
  }
  else{
    console.log(receivedAuthDigest);
    console.log("  and  ");
    console.log(hmacOfReceivedPayload);
    console.log("Not the same");
  }
})


function publish(topicToPublish, rawPayloadObject) {
  authString = generateHMAC(rawPayloadObject);
  rawPayloadObject['auth'] = authString;
  payloadString = JSON.stringify(rawPayloadObject)
  client.publish(topicToPublish, payloadString);
}

function generateHMAC(payloadObject){
  let hmac = crypto.createHmac('sha256','secretkey');
  data = hmac.update(JSON.stringify(payloadObject));
  gen_hmac= data.digest('hex');
  return gen_hmac;
}

function compareHMAC(hmacReceived, hmacGenerated){
  if(hmacReceived==hmacGenerated){
    return true;
  }
  else return false;
}

function sendESPstate(deviceToChange,resourceToChange,state){
  let objectToSend={};
  objectToSend[resourceToChange] = state;
  let topicName = 'smarthome/' + deviceToChange + '/' + resourceToChange;
  publish(topicName, objectToSend);
}

//sendESPstate('esp3','gpio4',1);
module.exports.sendESPstate = sendESPstate;
