'use strict';

const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_MTU = 20;

let bleDevice;
let nusService;
let rxCharacteristic;
let txCharacteristic;
let connected = false;
let bleNusBusy = false;

function connectionToggle(){ connected ? disconnect() : connect(); }
function changeConnectionState(state){
    connected = state;
    const button = document.getElementById('clientConnectButton');
    if (!button) return;
    button.innerHTML = state ? 'Disconnect' : 'Connect';
    button.classList.toggle('connected', state);
    if (state) openFullscreen(document.body);
}
async function connect(){
    if (!checkBluetooth()) return;
    try {
        terminal_writeln('Requesting Bluetooth Device...');
        bleDevice = await navigator.bluetooth.requestDevice({filters:[{services:[bleNusServiceUUID]}]});
        terminal_writeln('Found ' + bleDevice.name);
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        const server = await bleDevice.gatt.connect();
        nusService = await server.getPrimaryService(bleNusServiceUUID);
        rxCharacteristic = await nusService.getCharacteristic(bleNusCharRXUUID);
        txCharacteristic = await nusService.getCharacteristic(bleNusCharTXUUID);
        await txCharacteristic.startNotifications();
        txCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        changeConnectionState(true);
        enableSleepLock();
        terminal_writeln(bleDevice.name + ' Connected.');
    } catch (error) {
        terminal_writeln(String(error));
        if (bleDevice && bleDevice.gatt && bleDevice.gatt.connected) bleDevice.gatt.disconnect();
    }
}
function disconnect(){
    if (bleDevice && bleDevice.gatt && bleDevice.gatt.connected) bleDevice.gatt.disconnect();
    changeConnectionState(false);
    disableSleepLock();
}
function onDisconnected(){ changeConnectionState(false); disableSleepLock(); terminal_writeln('Circuit Cubes Disconnected.'); }
function handleNotifications(event){
    let str = '';
    for (let i=0; i<event.target.value.byteLength; i++) str += String.fromCharCode(event.target.value.getUint8(i));
    terminal_writeln('notification ' + str);
}
async function nusSendString(s, log=true){
    if (!bleDevice || !bleDevice.gatt || !bleDevice.gatt.connected) {
        terminal_writeln('Not connected to a device yet.');
        return;
    }
    while (bleNusBusy) await delay(1);
    bleNusBusy = true;
    try {
        if (log) terminal_writeln('send: ' + s);
        const bytes = new TextEncoder().encode(s);
        for (let i=0; i<bytes.length; i += NUS_MTU) {
            await rxCharacteristic.writeValue(bytes.slice(i, i + NUS_MTU));
        }
    } finally {
        bleNusBusy = false;
    }
}
