'use strict';

// Circuit Cubes Nordic UART Service (NUS)
const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const MTU = 20;

// Keep these as window globals for compatibility with the original project.
var bleDevice;
var nusService;
var rxCharacteristic;
var txCharacteristic;
var connected = false;
var bleNusBusy = false;

function connectionToggle() {
    if (connected) disconnect();
    else connect();
}

function changeConnectionState(state) {
    connected = state;
    const button = document.getElementById('clientConnectButton');
    if (button) {
        button.innerHTML = state ? 'Disconnect' : 'Connect';
        button.classList.toggle('connected', state);
    }
    if (state) {
        openFullscreen(document.body);
    } else if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
}

async function connect() {
    if (!checkBluetooth()) {
        terminal_writeln('Web Bluetooth is not available in this browser.');
        return;
    }

    try {
        terminal_writeln('HUB 1/6: Requesting Circuit Cubes device...');
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [bleNusServiceUUID] }]
        });
        terminal_writeln('HUB 2/6: Found ' + (bleDevice.name || 'unnamed device'));
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);

        terminal_writeln('HUB 3/6: Connecting to GATT server...');
        const server = await bleDevice.gatt.connect();
        terminal_writeln('HUB 4/6: Looking for Nordic UART service...');
        nusService = await server.getPrimaryService(bleNusServiceUUID);
        terminal_writeln('HUB: NUS service found.');

        terminal_writeln('HUB 5/6: Looking for RX/TX characteristics...');
        rxCharacteristic = await nusService.getCharacteristic(bleNusCharRXUUID);
        txCharacteristic = await nusService.getCharacteristic(bleNusCharTXUUID);
        terminal_writeln('HUB: RX and TX characteristics found.');

        // Register first, then enable notifications to avoid missing early data.
        txCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        terminal_writeln('HUB 6/6: Enabling notifications...');
        await txCharacteristic.startNotifications();

        changeConnectionState(true);
        terminal_writeln('HUB CONNECTED: ' + (bleDevice.name || 'Circuit Cubes'));
    } catch (error) {
        terminal_writeln('HUB CONNECTION FAILED: ' + (error && error.name ? error.name + ': ' : '') + String(error));
        changeConnectionState(false);
        if (bleDevice && bleDevice.gatt && bleDevice.gatt.connected) {
            try { bleDevice.gatt.disconnect(); } catch (_) {}
        }
    }
}

function disconnect() {
    if (!bleDevice) {
        terminal_writeln('No Circuit Cubes hub selected.');
        changeConnectionState(false);
        return;
    }
    terminal_writeln('Disconnecting Circuit Cubes hub...');
    if (bleDevice.gatt && bleDevice.gatt.connected) bleDevice.gatt.disconnect();
    changeConnectionState(false);
}

function onDisconnected() {
    changeConnectionState(false);
    terminal_writeln('HUB DISCONNECTED: ' + (bleDevice && bleDevice.name ? bleDevice.name : 'Circuit Cubes'));
}

function handleNotifications(event) {
    const value = event.target.value;
    let str = '';
    for (let i = 0; i < value.byteLength; i++) str += String.fromCharCode(value.getUint8(i));
    terminal_writeln('HUB RX: ' + str);
}

async function nusSendString(s, log = true) {
    if (!bleDevice || !bleDevice.gatt || !bleDevice.gatt.connected || !rxCharacteristic) {
        terminal_writeln('HUB WRITE FAILED: hub is not connected.');
        return;
    }

    while (bleNusBusy) await delay(1);
    bleNusBusy = true;
    try {
        if (log) terminal_writeln('HUB TX: ' + s);
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
        for (let offset = 0; offset < bytes.length; offset += MTU) {
            await rxCharacteristic.writeValue(bytes.slice(offset, offset + MTU));
        }
    } catch (error) {
        terminal_writeln('HUB WRITE ERROR: ' + (error && error.name ? error.name + ': ' : '') + String(error));
        throw error;
    } finally {
        bleNusBusy = false;
    }
}
