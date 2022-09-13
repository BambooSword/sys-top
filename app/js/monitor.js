const path = require("path");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

// Run every 2 seconds
setInterval(() => {
  // cpu usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";
  });
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });

  // uptime
  document.getElementById("sys-uptime").innerHTML = secondsToDhms(os.uptime());
}, 2000);

// set model
document.getElementById("cpu-model").innerHTML = cpu.model();

// computer name
document.getElementById("comp-name").innerHTML = os.hostname();

// os
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Total mem
mem.info().then((info) => {
  console.log(info, "<== mem info");
  document.getElementById("mem-total").innerText = info.totalMemMb;
});

// show days, hours, mins, seconds

function secondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}天 ${h}小时 ${m}分 ${s}秒`;
}
