'use strict';

const bleLegoHubServiceUUID = '00001623-1212-efde-1623-785feabcd123';
const bleLegoHubCharacteristicUUID = '00001624-1212-efde-1623-785feabcd123';
const LEGO_MTU = 20;
let bleRemoteDevice;
let legoCharacteristic;
let remoteConnected = false;
let bleBusy = false;
let handlers = {};
let remotePortsActivated = false;
let remoteActivationInProgress = false;

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
        remotePortsActivated = false;
        remoteActivationInProgress = false;
        changeRemoteConnectionState(true);
        terminal_writeln(bleRemoteDevice.name + ' Connected; waiting for LEGO input ports...');
    } catch(error) {
        terminal_writeln('LEGO remote connection error: ' + String(error));
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
    for (let i = 0; i < value.byteLength; i++) payload.push(value.getUint8(i));
    if (payload.length < 3) return;

    // Keep raw packets visible in the existing terminal so the BLE path can be diagnosed.
    terminal_writeln('LEGO RX: ' + payload.map(toHex).join(' '));

    const messageType = payload[2];
    let eventName = '';

    // The 88010 reports its two internal button devices as attached I/O.
    // Activate ports 0 and 1 only after the remote has reported the expected device type.
    if (messageType === 0x04 && payload.length >= 4 && payload[3] === 0x3C) {
        if (!remotePortsActivated && !remoteActivationInProgress) {
            remoteActivationInProgress = true;
            try {
                await delay(100);
                await activatePortDevice(0);
                await delay(100);
                await activatePortDevice(1);
                remotePortsActivated = true;
                terminal_writeln('LEGO remote button ports activated.');
            } catch (error) {
                terminal_writeln('LEGO remote port activation error: ' + String(error));
            } finally {
                remoteActivationInProgress = false;
            }
        }
        return;
    }

    if (messageType === 0x08 && payload.length >= 5) {
        eventName = payload[4] === 0x01 ? 'oncenterpress' : payload[4] === 0x00 ? 'oncenterrelease' : '';
    } else if (messageType === 0x45 && payload.length >= 5) {
        const port = payload[3] === 0x00 ? 'left' : payload[3] === 0x01 ? 'right' : '';
        const ev = payload[4] === 0x01 ? 'pluspress'
            : payload[4] === 0x7F ? 'stoppress'
            : payload[4] === 0xFF ? 'minuspress'
            : payload[4] === 0x00 ? 'release' : '';
        if (port && ev) eventName = 'on' + port + ev;
    }

    if (eventName) {
        terminal_writeln('LEGO button: ' + eventName);
        if (typeof handlers[eventName] === 'function') handlers[eventName]();
        // Some remote firmware sends stoppress rather than release when a button is released.
        if (eventName === 'onleftstoppress' && typeof handlers.onleftrelease === 'function') handlers.onleftrelease();
        if (eventName === 'onrightstoppress' && typeof handlers.onrightrelease === 'function') handlers.onrightrelease();
    }
}

async function activatePortDevice(portNumber) {
    await remoteSendArray([0x41, portNumber, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01]);
}

async function remoteSendArray(arr){
    if (!legoCharacteristic || !bleRemoteDevice || !bleRemoteDevice.gatt || !bleRemoteDevice.gatt.connected) return;
    while (bleBusy) await delay(1);
    bleBusy = true;
    try {
        const bytes = new Uint8Array([arr.length, 0, ...arr]);
        for (let i=0; i<bytes.length; i += LEGO_MTU) await legoCharacteristic.writeValue(bytes.slice(i, i + LEGO_MTU));
    } finally { bleBusy = false; }
}
