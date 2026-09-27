'use strict';

const bleLegoHubServiceUUID = '00001623-1212-efde-1623-785feabcd123';
const bleLegoHubCharacteristicUUID = '00001624-1212-efde-1623-785feabcd123';
const LEGO_MTU = 20;
let bleRemoteDevice;
let legoCharacteristic;
let remoteConnected = false;
let bleBusy = false;
let handlers = {};

function remoteConnectionToggle(){ remoteConnected ? remoteDisconnect() : remoteConnect(); }
function changeRemoteConnectionState(state){
    remoteConnected = state;
    const button = document.getElementById('remoteConnectButton');
    if (button) {
        button.innerHTML = state ? 'Disconnect' : 'Connect';
        button.classList.toggle('connected', state);
    }
    state ? enableSleepLock() : disableSleepLock();
}
async function remoteConnect(){
    if (!checkBluetooth()) return;
    try {
        terminal_writeln('Requesting LEGO Remote...');
        bleRemoteDevice = await navigator.bluetooth.requestDevice({filters:[{services:[bleLegoHubServiceUUID]}]});
        bleRemoteDevice.addEventListener('gattserverdisconnected', onRemoteDisconnected);
        const server = await bleRemoteDevice.gatt.connect();
        const service = await server.getPrimaryService(bleLegoHubServiceUUID);
        legoCharacteristic = await service.getCharacteristic(bleLegoHubCharacteristicUUID);
        await legoCharacteristic.startNotifications();
        legoCharacteristic.addEventListener('characteristicvaluechanged', handleRemoteNotifications);
        changeRemoteConnectionState(true);
        terminal_writeln(bleRemoteDevice.name + ' Connected.');
    } catch(error) {
        terminal_writeln(String(error));
        if (bleRemoteDevice && bleRemoteDevice.gatt && bleRemoteDevice.gatt.connected) bleRemoteDevice.gatt.disconnect();
    }
}
function remoteDisconnect(){
    if (bleRemoteDevice && bleRemoteDevice.gatt && bleRemoteDevice.gatt.connected) bleRemoteDevice.gatt.disconnect();
    changeRemoteConnectionState(false);
}
function onRemoteDisconnected(){ changeRemoteConnectionState(false); terminal_writeln('LEGO Remote Disconnected.'); }
function toHex(d){ return ('0' + Number(d).toString(16)).slice(-2).toUpperCase(); }
async function handleRemoteNotifications(event){
    const value = event.target.value;
    const payload = [];
    for (let i=0; i<value.byteLength; i++) payload.push(value.getUint8(i));
    if (payload.length < 5) return;
    let eventName = '';
    if (payload[2] === 0x08) {
        eventName = payload[4] === 0x01 ? 'oncenterpress' : payload[4] === 0x00 ? 'oncenterrelease' : '';
    } else if (payload[2] === 0x45) {
        const port = payload[3] === 0x00 ? 'left' : payload[3] === 0x01 ? 'right' : '';
        const ev = payload[4] === 0x01 ? 'pluspress' : payload[4] === 0x7F ? 'stoppress' : payload[4] === 0xFF ? 'minuspress' : payload[4] === 0x00 ? 'release' : '';
        if (port && ev) eventName = 'on' + port + ev;
    }
    if (eventName && handlers[eventName]) handlers[eventName]();
}
async function remoteSendArray(arr){
    if (!legoCharacteristic || !remoteConnected) return;
    while (bleBusy) await delay(1);
    bleBusy = true;
    try {
        const bytes = new Uint8Array([arr.length, 0, ...arr]);
        for (let i=0; i<bytes.length; i += LEGO_MTU) await legoCharacteristic.writeValue(bytes.slice(i, i + LEGO_MTU));
    } finally { bleBusy = false; }
}
