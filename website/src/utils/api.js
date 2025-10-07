const API_BASE = '/api/';

export async function login(username, password) {
  try {
    const response = await fetch(
      `${API_BASE}login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        method: "GET",
        credentials: "include"
      }
    );
    switch (response.status) {
      case 200:
        const data = await response.json();
        return {
          code: 200,
          username: data.username,
          userAlias: data.userAlias,
          allowedTo: [...data.allowedTo],
        };
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 503:
        var text =  await response.text();
        return { code: 503, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_BASE}logout`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400:
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401: 
        var text =  await response.text();
        return { code: 401, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function getTableData() {
  try {
    const response = await fetch(`${API_BASE}getTabledata`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return {  code: 200, table: data };
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function getSettings() {
  try {
    const response = await fetch(`${API_BASE}getSettings`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return {  code: 200, settings: data };
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function getSecurityCreds() {
  try {
    const response = await fetch(`${API_BASE}getSecurityCredintials`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, creds: data };
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function updateTable(tableData) {
  try {
    const response = await fetch(`${API_BASE}updateTable`, {
      method: "POST",
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableData),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      case 507:
        var text =  await response.text();
        return { code: 507, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function update(monitorCode, USL, LSL, bufferSize, machineName, machineIP, toolOffsetNum, offsetSize) {
  try {
    const response = await fetch(`${API_BASE}update`, {
      method: "POST",
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usl: USL,
        lsl: LSL,
        sampleSize: bufferSize,
        machineName,
        machineIP,
        toolOffsetNumber: toolOffsetNum,
        offsetSize,
        monitorCode
      }),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      case 507:
        var text =  await response.text();
        return { code: 507, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function deleteM(monitorCode) {
    try {
        const response = await fetch(`${API_BASE}delete?monitorCode=${encodeURIComponent(monitorCode)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
        });

        switch (response.status) {
            case 200:
              const data = await response.json();
              return { code: 200, ...data};
            case 400: 
              var text =  await response.text();
              return { code: 400, reason: text };
            case 401:
              var text =  await response.text();
              return { code: 401, reason: text };
            case 403:
              var text =  await response.text();
              return { code: 403, reason: text };
            case 404:
              var text =  await response.text();
              return { code: 404, reason: text };
            default:
              return {
                code: 500,
                reason: "Unexpected Err"
              };
        }
      } catch (err) {
          return {
            code: 500,
            reason: "Unexpected Error: " + (err.message || err)
          };
      }
}

export async function reset(monitorCode) {
    try {
        const response = await fetch(`${API_BASE}reset?monitorCode=${encodeURIComponent(monitorCode)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
        });

        switch (response.status) {
            case 200:
                return { code: 200 };

            case 400:
                return { code: 400, reason: "Bad Request: Invalid monitorCode" };

            case 401:
                return { code: 401, reason: "Unauthorized: Session expired" };

            case 403:
                return { code: 403, reason: "Forbidden: Not allowed to perform this operation" };
            default:
              return {
                code: 500,
                reason: "Unexpected Err"
              };
        }
      } catch (err) {
          return {
            code: 500,
            reason: "Unexpected Error: " + (err.message || err)
          };
      }
}


export async function updateWifi(ssid, password) {
  try {
    const response = await fetch(`${API_BASE}updateWifi`, {
      method: "POST",
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ssid, password
      }),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}


export async function updateSTA(ssid, password) {
  try {
    const response = await fetch(`${API_BASE}updateSTA`, {
      method: "POST",
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ssid, password
      }),
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      default:
        return {
          code: 500,
          reason: "Unexpected Err"
        };
    }
  } catch (err) {
    return {
      code: 500,
      reason: "Unexpected Error: " + (err.message || err)
    };
  }
}

export async function updateRole(username, password, userAlias, allowedTo) {
  try {
    const response = await fetch(`${API_BASE}updateRole`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username, password, userAlias, allowedTo })
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400: 
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      case 507:
        var text =  await response.text();
        return { code: 507, reason: text };

      default:
        return { code: 500, reason: "Unexpected Server Error" };
    }
  } catch (err) {
    return { code: 500, reason: "Network/Server Error: " + (err.message || err) };
  }
}

export async function deleteRole(username) {
  try {
    const response = await fetch(`${API_BASE}deleteRole?username=${encodeURIComponent(username)}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Accept": "application/json" // expecting JSON response
      }
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data };
      case 400:
        var text =  await response.text();
        return { code: 400, reason: text };
      case 401:
        var text =  await response.text();
        return { code: 401, reason: text };
      case 403:
        var text =  await response.text();
        return { code: 403, reason: text };
      case 404:
        var text =  await response.text();
        return { code: 404, reason: text };

      default:
        return { code: 500, reason: "Unexpected Server Error" };
    }
  } catch (err) {
    return { code: 500, reason: "Network/Server Error: " + (err.message || err) };
  }
}

export async function subscribe(callback) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket("ws://192.168.4.1/subscribe");

    socket.addEventListener("open", () => {
      const allCookies = document.cookie;
      const match = allCookies.match(/session_id=([A-Za-z0-9]{15})/);
      if (match) {
        const sessionId = match[1];
        socket.send("VERIFY-" + sessionId);
      } else {
        reject({
          code: 4001,
          reason: "Session Expired",
        });
      }
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type == "msg") {
        if (!data.data.status) {
          reject({
            code: 4003,
            reason: "Not Allowed To Perform This Operation " + data.reason,
          });
        } else {
          if (data.data.subject === "verify") {
            socket.send("SUB-MONITOR");
          } else {
            resolve({
              code: 2000,
              unsubscribe: () => {
                console.log("Called");
                socket.send("UNS-MONITOR");
                socket.close();
              },
            });
          }
        }
      } else {
        callback(data.data);
      }
    });

    socket.addEventListener("close", (e) => {
      console.log("WebSocket connection closed", e);
      if (e.code !== 3001 && e.code != 4000) {
        reject({
          code: e.code, //1013, 1008, 1000
          reason: e.reason,
        });
      }
    });

    socket.addEventListener("error", (err) => {
      reject({
        code: 5000,
        reason: "WebSocket error",
        error: err,
      });
    });
  });
}
