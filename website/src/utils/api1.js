function block(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


let users =  {
    'admin':{
        password: 'admin123',
        userAlias: 'admin',
        allowedTo: ['SETTING', 'MONITOR', 'SECURITY']
    }

}

let settings = {
  '700': {
    a2: 1.30,
    d3: 0,
    d4: 3.50,
    usl: 26.0,
    lsl: 25.95,
    datapointSize: 30, 
    machineName: 'Rahul GAndhi',
    machineIP: '192.16.1.1',
    toolOffsetNumber: 641,
    offsetSize: 51615.5
  },
  '701': {
    a2: 1.30,
    d3: 0,
    d4: 3.50,
    usl: 55.0,
    lsl: 54.95,
    datapointSize: 20, 
    machineName: 'Rahul GAndhi',
    machineIP: '192.16.1.1',
    toolOffsetNumber: 641,
    offsetSize: 51615.5
  }
};

// To track how many rows have been sent per monitorCode
const callCount = {};

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getData() {
  // Pick a random monitorCode from settings keys
  const keys = Object.keys(settings);
  const monitorCode = keys[Math.floor(Math.random() * keys.length)];

  // Initialize callCount for monitorCode
  if (!callCount[monitorCode]) callCount[monitorCode] = 0;
  callCount[monitorCode]++;

  const config = settings[monitorCode];

  // Determine how many rows to generate based on call count and datapointSize
  const rowsToGenerate = Math.min(callCount[monitorCode], config.datapointSize);

  // Generate tableData rows with dummy values (value and MR)
  const tableData = [];
  for (let i = 0; i < rowsToGenerate; i++) {
    tableData.push({
      value: getRandomFloat(20, 30),   // Example range for value
      MR: getRandomFloat(0, 5)         // Example range for MR
    });
  }

  // Calculate dummy stats based on generated data (just random for now)
  // X-bar as average of values in tableData
  const xBar = tableData.reduce((acc, cur) => acc + cur.value, 0) / rowsToGenerate;
  // stdDev random near 15.5 ±5
  const stdDev = getRandomFloat(10, 20);
  // avgMR average of MR values
  const avgMR = tableData.reduce((acc, cur) => acc + cur.MR, 0) / rowsToGenerate * 10000; // scale it up for dummy
  // Other stats random or from config with small random noise
  const UCL_X = getRandomFloat(200, 250);
  const LCL_X = getRandomFloat(5000, 5500);
  const UCL_MR = getRandomFloat(450, 500);
  const LCL_MR = getRandomFloat(550, 600);
  const cp = getRandomFloat(5, 10);
  const cpk = getRandomFloat(45, 55);
  const isDrifting = Math.random() < 0.1; // 10% chance true

  return {
    monitorCode,
    timestamp: new Date().toISOString(),
    tableData,
    "X-bar": parseFloat(xBar.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    avgMR: Math.round(avgMR),
    UCL_X: parseFloat(UCL_X.toFixed(0)),
    LCL_X: parseFloat(LCL_X.toFixed(0)),
    UCL_MR: parseFloat(UCL_MR.toFixed(0)),
    LCL_MR: parseFloat(LCL_MR.toFixed(0)),
    cp: parseFloat(cp.toFixed(0)),
    cpk: parseFloat(cpk.toFixed(0)),
    isDrifting,
    a2: config.a2,
    d3: config.d3,
    usl: config.usl,
    lsl: config.lsl,
    datapointSize: config.datapointSize,
    machineName: config.machineName,
    machineIP: config.machineIP,
    toolOffsetNumber: config.toolOffsetNumber,
    offsetSize: config.offsetSize
  };
}


let wifi = {
    ssid: 'ZANVAR',
    password: '12345678',
}



let current_user = null;

export async function login(username, password) {
    await block(2000);
    if(users[username] && users[username].password == password){
        current_user = username;
        return {
            code: 200,
            username,
            userAlias: users[username].userAlias,
            allowedTo: users[username].allowedTo,
        }
    }else{
        return {
            code: 401,
            reason: 'Invalid Username Or Password'
        }
    }
}

export async function logout() {
    await block(1000);
    current_user = null;
    return {
        code: 200
    }
}

export async function subscribe(callback) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('MONITOR')){
            let intervalId = setInterval(()=>{
                callback(getData());
            }, 5000);
            return {
                code: 200,
                unsubscribe: ()=>{clearInterval(intervalId)}
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function getSettings() {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SETTING')){
            return {
                code: 200,
                settings: settings
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function update(monitorCode, USL, LSL, D3, D4, A2, bufferSize, machineName, machineIP, toolOffsetNum, offsetSize) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SETTING')){
            settings[monitorCode] = {
                 "a2": A2,
                "d3": D3,
                "d4": D4,
                "usl": USL,
                "lsl": LSL,
                "datapointSize": bufferSize,
                "machineName": machineName,
                "machineIP": machineIP,
                "toolOffsetNumber": toolOffsetNum,
                "offsetSize": offsetSize,
            }
            return {
                code: 200,
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function deleteM(monitorCode) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SETTING')){
            delete settings[monitorCode];
            return {
                code: 200,
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function reset(monitorCode) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SETTING')){
            delete callCount[monitorCode];
            return {
                code: 200,
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function getSecurityCreds() {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SECURITY')){
            return {
                code: 200,
                wifi,
                users : Object.entries(users).map(([username, details]) => ({
                            username,
                            ...details
                            })),
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function updateWifi(ssid, password) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SECURITY')){
            wifi.ssid = ssid;
            wifi.password = password;
            return {
                code: 200,
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}

export async function updateRole(username, password, userAlias, allowedTo) {
    await block(2000);
    if(current_user){
        //this means user is logged in
        if(users[current_user].allowedTo.includes('SECURITY')){
            users[username] = {
                password, userAlias, allowedTo
            }
            return {
                code : 200,
            }
        }
        return {
            code: 403,
            reason: 'Not Allowed To Perform This Operation'
        }
    }
    return {
        code: 401,
        reason: 'Session Expired'
    }
}


function test() {
  setInterval(() => {
    const data = getData();
    console.log(data);
  }, 5000);
}

test();
