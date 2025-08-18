/**
 * @async @function login
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password for the given username.
 * ***
 * @returns {Promise<Object>} Resolves with an object in the format:
 * Successful login:
 * ```json
 * {
 *   "code": 200,
 *   "username": "admin",
 *   "userAlias": "admin",
 *   "allowedTo": ["SETTING", "MONITOR", "SECURITY"]
 * }
 * ```
 *
 * Failed login:
 * ```json
 * {
 *   "code": 401,
 *   "reason": "Invalid Username Or Password"
 * }
 * ```
 *
 * Missing parameters:
 * ```json
 * {
 *   "code": 400,
 *   "reason": "Missing Username Or Password"
 * }
 * ```
 *
 * Server Overload:
 * ```json
 * {
 *   "code": 503,
 *   "reason": "Server Limit Reached For Login"
 * }
 * ```
 *
 * Network/unexpected errors:
 * ```json
 * {
 *   "code": 500,
 *   "reason": "Unexpected Error: ..."
 * }
 * ```
 */
export async function login(username, password) {
  try {
    const response = await fetch(
      `/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
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
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 503:
        text = await response.text();
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

/**
 * Logs out the currently authenticated user by calling the `/logout` endpoint.
 * 
 * The request includes cookies (`credentials: "include"`) to ensure
 * the session is properly invalidated server-side.
 * 
 * @async
 * @function logout
 * @returns {Promise<{code: number, reason?: string}>}
 *   An object containing:
 *   - `code` {number} - The HTTP status code (200, 400, 401, 500).
 *   - `reason` {string} [optional] - A description for error codes.
 * 
 * Possible return cases:
 * - `{ code: 200 }` → Logout successful.
 * - `{ code: 401, reason: "Unauthenticated - You are not logged in" }`
 * - `{ code: 400, reason: "<server provided reason>" }`
 * - `{ code: 500, reason: "Unexpected Error..." }`
 */
export async function logout() {
  try {
    const response = await fetch(`/logout`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, ...data};
      case 400:
        text = await response.text();
        return { code: 400, reason: text };
      case 401: 
        text = await response.text();
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

export async function getSettings() {
  try {
    const response = await fetch(`/getSettings`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return {  code: 200, settings: data };
      case 400: 
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
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
    const response = await fetch(`/getSecurityCredintials`, {
      method: "GET",
      credentials: "include"
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return { code: 200, creds: data };
      case 400: 
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
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

export async function update(monitorCode, USL, LSL, D3, D4, A2, bufferSize, machineName, machineIP, toolOffsetNum, offsetSize) {
  try {
    const response = await fetch("/update", {
      method: "POST",
      credentials: "include",  
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        a2: A2,
        d3: D3,
        d4: D4,
        usl: USL,
        lsl: LSL,
        datapointSize: bufferSize,
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
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
        return { code: 403, reason: text };
      case 507:
        text = await response.text();
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
        const response = await fetch(`/delete?monitorCode=${encodeURIComponent(monitorCode)}`, {
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
              text = await response.text();
              return { code: 400, reason: text };
            case 401:
              text = await response.text();
              return { code: 401, reason: text };
            case 403:
              text = await response.text();
              return { code: 403, reason: text };
            case 404:
              text = await response.text();
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
        const response = await fetch(`/reset?monitorCode=${encodeURIComponent(monitorCode)}`, {
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
    const response = await fetch("/updateWifi", {
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
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
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
    const response = await fetch("/updateRole", {
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
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
        return { code: 403, reason: text };
      case 507:
        text = await response.text();
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
    const response = await fetch(`/deleteRole?username=${encodeURIComponent(username)}`, {
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
        text = await response.text();
        return { code: 400, reason: text };
      case 401:
        text = await response.text();
        return { code: 401, reason: text };
      case 403:
        text = await response.text();
        return { code: 403, reason: text };
      case 404:
        text = await response.text();
        return { code: 404, reason: text };

      default:
        return { code: 500, reason: "Unexpected Server Error" };
    }
  } catch (err) {
    return { code: 500, reason: "Network/Server Error: " + (err.message || err) };
  }
}



export async function subscribe(callback) {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", () => {
      const allCookies = document.cookie;
      const match = allCookies.match(/session_id=([A-Za-z0-9]{15})/);
      if (match) {
        const sessionId = match[1];
        socket.send("VERIFY-" + sessionId);
      }else{
          return {
              code: 401,
              reason: 'Session Expired'
          }
      }
    });
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if(data.type =="msg"){
        if(!data.data.status){
            return {
                code: 403,
                reason: 'Not Allowed To Perform This Operation ' + data.reason
            }
        }else{
          if(data.data.status && data.data.subject == 'verify'){
            socket.send("SUB-MONITOR");
          }else{
              return {
                code: 200,
                unsubscribe: ()=>{socket.send("UNS-MONITOR");}
              }
          }
        }
      }else{
        callback(data.data);
      }
    });
    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });
}
