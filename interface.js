const checkboxes = [
    "steer_invert",
    "drive_left_invert",
    "drive_right_invert"
];

const values = [
    "steer_speed",
    "drive_speed"
];

const COOKIE_EXT_DAYS = 364;
const COOKIE_PREFIX = "circuit_cubes_dual_";

function enableSleepLock(){
    const video = document.getElementById('sleep_lock');
    if (video) video.play().catch(() => {});
}

function disableSleepLock(){
    const video = document.getElementById('sleep_lock');
    if (video) video.pause();
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function terminal_write(str) {
    const textarea = document.getElementById('terminal');
    textarea.value += str;
    textarea.scrollTop = textarea.scrollHeight;
}

function terminal_writeln(str) {
    terminal_write(str + '\n');
}

function inc(id, by=5){
    const input = document.getElementById(id);
    input.value = Math.min(parseInt(input.value) + by, 255);
    input.onchange();
}

function dec(id, by=5){
    const input = document.getElementById(id);
    input.value = Math.max(0, parseInt(input.value) - by);
    input.onchange();
}

function toggleTerminal(){
    const terminal = document.getElementById("terminal");
    terminal.style.display = terminal.style.display === "block" ? "none" : "block";
}

function toggleSettings(){
    const settings = document.getElementById("settings");
    settings.style.display = settings.style.display === "block" ? "none" : "block";
}

function alreadyTouched(touch){
    if (touch) {
        touchScreen = true;
    } else if (touchScreen){
        return true;
    }
    return false;
}

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + COOKIE_EXT_DAYS * 24 * 60 * 60 * 1000);
    document.cookie =
        cname + "=" + encodeURIComponent(cvalue) +
        ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(';');

    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) {
            return decodeURIComponent(c.substring(name.length));
        }
    }
    return "";
}

function onSetup(){
    checkboxes.forEach(id => {
        setCookie(COOKIE_PREFIX + id,
            document.getElementById(id).checked);
    });

    values.forEach(id => {
        setCookie(COOKIE_PREFIX + id,
            document.getElementById(id).value);
    });

    radiobuttons.forEach(name => {
        const selected = document.querySelector(
            `input[name="${name}"]:checked`
        );
        if (selected) {
            setCookie(COOKIE_PREFIX + name, selected.value);
        }
    });
}

function checkBluetooth() {
    if (!navigator.bluetooth) {
        window.alert(
            "Web Bluetooth is not available in this browser. " +
            "Use a browser/platform combination supporting Web Bluetooth."
        );
        return false;
    }
    return true;
}

function onLoad(){
    checkBluetooth();

    checkboxes.forEach(id => {
        const value = getCookie(COOKIE_PREFIX + id);
        const input = document.getElementById(id);

        if (value !== "") {
            input.checked = value === "true";
        }

        input.onchange = onSetup;
    });

    values.forEach(id => {
        const value = getCookie(COOKIE_PREFIX + id);
        const input = document.getElementById(id);

        if (value !== "") {
            input.value = Number(value);
        }

        input.onchange = onSetup;
    });

    radiobuttons.forEach(name => {
        const value = getCookie(COOKIE_PREFIX + name);

        if (value !== "") {
            const input = document.querySelector(
                `input[name="${name}"][value="${value}"]`
            );
            if (input) input.click();
        }

        document.getElementsByName(name).forEach(input => {
            input.onchange = onSetup;
        });
    });
}
