function block(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
  let capacity = 10;
  
  // Initialize users with default users and load from localStorage
  const defaultUsers = {
      'admin':{
          password: 'admin123',
          userAlias: 'admin',
          allowedTo: ['SETTING', 'MONITOR', 'SECURITY']
      },
      'user1':{
          password: 'user123',
          userAlias: 'user1',
          allowedTo: ['SECURITY', 'MONITOR']
      }
  };

  // Load users from localStorage or use defaults
  function loadUsers() {
    try {
      const storedUsers = localStorage.getItem('zanvar_users');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
    return { ...defaultUsers };
  }

  // Save users to localStorage
  function saveUsers() {
    try {
      localStorage.setItem('zanvar_users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      return false;
    }
  }

  // Load settings from localStorage or use defaults
  function loadSettings() {
    try {
      const storedSettings = localStorage.getItem('zanvar_settings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return {
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
        offsetSize: 51615.5,
        active: true
      }
    };
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem('zanvar_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      return false;
    }
  }

  // Initialize users from localStorage or defaults
  let users = loadUsers();

  // Initialize settings from localStorage or defaults
  let settings = loadSettings();
  
  // To track how many rows have been sent per monitorCode
  const callCount = {};
  
  function getRandomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }
  
function getData() {
  // Pick a random monitorCode from settings keys
  const keys = Object.keys(settings).filter(key => settings[key].active !== false);
  if (keys.length === 0) return null; // No active monitors

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
      value: getRandomFloat(config.lsl, config.usl), // Use actual USL/LSL
      MR: getRandomFloat(0, 10)
    });
  }

  // Calculate X-bar as average of values
  const xBar = tableData.reduce((acc, cur) => acc + cur.value, 0) / rowsToGenerate;

  // Calculate avgMR
  const avgMR = tableData.reduce((acc, cur) => acc + cur.MR, 0) / rowsToGenerate;

  // Correct control limits formulas
  const UCL_X = xBar + config.a2 * avgMR -10;
  const LCL_X = xBar - config.a2 * avgMR +5;
  const UCL_MR = config.d4 * avgMR - 8;
  const LCL_MR = config.d3 * avgMR + 2;

  const stdDev = getRandomFloat(10, 20); // optional, keep as is
  const cp = getRandomFloat(5, 10);
  const cpk = getRandomFloat(45, 55);
  const isDrifting = Math.random() < 0.1; // 10% chance

  return {
    monitorCode,
    timestamp: new Date().toISOString(),
    tableData,
    "X-bar": parseFloat(xBar.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    avgMR: Math.round(avgMR),
    UCL_X: parseFloat(UCL_X.toFixed(2)),
    LCL_X: parseFloat(LCL_X.toFixed(2)),
    UCL_MR: parseFloat(UCL_MR.toFixed(2)),
    LCL_MR: parseFloat(LCL_MR.toFixed(2)),
    cp: parseFloat(cp.toFixed(2)),
    cpk: parseFloat(cpk.toFixed(2)),
    isDrifting,
    usl: config.usl,
    lsl: config.lsl
  };
}

  
  
  let wifi = {
      ssid: 'ZANVAR',
      password: '12345678',
  }
  
  
  
  let current_user = null;
  
  export async function login(username, password) {
      await block(2000);
      capacity--;
      if(capacity<=0) return {
              code: 503,
              reason: 'To Many People Are accessing the website right now'
      }
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
                  "active": true // Ensure new/updated monitors are active
              }
              saveSettings(); // Save settings to localStorage
              reset(monitorCode);          
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
              reset(monitorCode);          
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
            // Disable the monitor instead of just deleting callCount
            if (settings[monitorCode]) {
                settings[monitorCode].active = false;
            }
            delete callCount[monitorCode];
            saveSettings(); // Save the updated settings to localStorage
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
              saveUsers();
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
  
  export async function deleteRole(username){
      await block(2000);
      if(current_user){
          //this means user is logged in
          if(users[current_user].allowedTo.includes('SECURITY')){
              delete users[username];
              saveUsers();
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
  
  // User Management Functions
  export async function addUser(username, password, userAlias, allowedTo) {
      await block(1000);
      
      if (users[username]) {
          return {
              code: 409,
              reason: 'User already exists'
          };
      }
      
      if (!username || !password || !userAlias || !Array.isArray(allowedTo)) {
          return {
              code: 400,
              reason: 'Missing required fields: username, password, userAlias, allowedTo'
          };
      }
      
      // Add new user
      users[username] = {
          password: password,
          userAlias: userAlias,
          allowedTo: allowedTo
      };
      saveUsers();
      
      return {
          code: 200,
          message: 'User added successfully',
          user: {
              username,
              userAlias,
              allowedTo
          }
      };
  }

  export async function deleteUser(username) {
      await block(1000);
      
      if (!users[username]) {
          return {
              code: 404,
              reason: 'User not found'
          };
      }
      
      // Don't allow deleting the admin user
      if (username === 'admin') {
          return {
              code: 403,
              reason: 'Cannot delete admin user'
          };
      }
      
      delete users[username];
      saveUsers();
      
      return {
          code: 200,
          message: 'User deleted successfully'
      };
  }

  export async function updateUser(username, updates) {
      await block(1000);
      
      if (!users[username]) {
          return {
              code: 404,
              reason: 'User not found'
          };
      }
      
      // Update user properties
      if (updates.password) users[username].password = updates.password;
      if (updates.userAlias) users[username].userAlias = updates.userAlias;
      if (updates.allowedTo && Array.isArray(updates.allowedTo)) {
          users[username].allowedTo = updates.allowedTo;
      }
      saveUsers();
      
      return {
          code: 200,
          message: 'User updated successfully',
          user: {
              username,
              userAlias: users[username].userAlias,
              allowedTo: users[username].allowedTo
          }
      };
  }

  export async function getUsers() {
      await block(500);
      
      // Return users without passwords for security
      const userList = Object.keys(users).map(username => ({
          username,
          userAlias: users[username].userAlias,
          allowedTo: users[username].allowedTo
      }));
      
      return {
          code: 200,
          users: userList
      };
  }
  
  function test() {
    setInterval(() => {
      const data = getData();
      console.log(data);
    }, 5000);
  }
  
//   test();