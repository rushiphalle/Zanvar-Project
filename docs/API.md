# Server API Documentation

This document describes all endpoints for the server, including request format, parameters, and possible responses.

| No | Protocol | Method | Endpoint | Parameters | JSON Body | Response Codes | Description |
|----|----------|--------|---------|-----------|-----------|----------------|------------|
| 1  | HTTP     | GET    | [/api/login](#1-login) | username , password | N/A | 200, 400, 401, 503 | Authenticates user and sets session cookie |
| 2  | HTTP     | GET    | [/api/logout](#2-logout) | N/A | N/A | 200, 400, 401 | Logs out user by clearing cookie |
| 3  | HTTP     | GET    | [/api/getSettings](#3-get-settings) | N/A | N/A | 200, 400, 401, 403 | Logs out user by clearing cookie |
| 4  | HTTP     | GET    | [/api/getSecurityCredintials](#4-get-security-credintials) | N/A | N/A | 200, 400, 401, 403 | Logs out user by clearing cookie |
| 5  | HTTP     | POST    | [/api/update](#5-update) | N/A | { "a2": 1.50, "d3": 0, "d4": 3.50, "usl": 26.00, "lsl": 25.95, "datapointSize": 30, "machineName": "machineName", "machineIP": "machineIP", "toolOffsetNumber": 30, "offsetSize": 20, "monitorCode":"701" } | 200, 400, 401, 403, 507 |  Update existing or Add new SPC Settings |
| 6  | HTTP     | POST    | [/api/delete](#6-delete) | monitorCode | N/A | 200, 400, 401, 403, 404 | Delete SPC Setting from persistant database |
| 7  | HTTP     | POST    | [/api/reset](#7-reset) | monitorCode | N/A | 200, 400, 401, 403 | Reset record for respective monior code |
| 8  | HTTP     | POST    | [/api/updateWifi](#8-update-wifi) | N/A | {"ssid":"newSSID", "password":"newPassword"} | 200, 400, 401, 403 | Update Wifi credintials |
| 9  | HTTP     | POST    | [/api/updateSTA](#9-update-sta) | N/A | {"ssid":"newSSID", "password":"newPassword"} | 200, 400, 401, 403 | Update Wifi credintials |
| 10  | HTTP     | POST    | [/api/updateRole](#10-update-role) | N/A | { "username":"admin", "password":"password", "userAlias":"admin", "allowedTo":["SETTING"] } | 200, 400, 401, 403, 507 | Update User credintials |
| 11  | HTTP     | POST    | [/api/deleteRole](#11-delete-role) | username | N/A | 200, 400, 401, 403, 404 | Delete User Role |
| 12  | WS     | -    | [/subscribe](#12-subscribe-\(websocket\)) | N/A | N/A | 200, 400, 401, 403, 404 | Delete User Role |




---

## 1. Login

**Method:** GET                        
**Endpoint:** `/api/login`  
**Description:** Authenticate a user, return user data and set a session cookie.

**Query Parameters:**
- `username` (string, required)
- `password` (string, required)

**Responses:**   

**1. On  Successful login**   
- **Status Code -** 200 (OK)  
- **cookie -**
`"session_id=<15_characters_cookie>"` _(valid for single session, can be accesed through script)_         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    { 
        "username": "admin", 
        "userAlias": "admin", 
        "allowedTo": [ 
            "SETTING", "MONITOR", "SECURITY" 
        ]
    }
    ```
***

**2. On Bad Request (Parameter Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Missing Username Or Password`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Invalid Username Or Password`

***
**4. Overlaoded**   
- **Status Code -** 503  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Server Reached Max Login capacity`


## 2. Logout

**Method:** GET                        
**Endpoint:** `/api/logout`  
**Description:** Logs out user by clearing cookie

**Cookie -** `"session_id=<15_characters_cookie>"`

**Responses:**   

**1. On  Successful logout**   
- **Status Code -** 200 (OK)  
- **cookie -**
`"session_id=<15_characters_cookie>"` _(this cookie will be cleared)_         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    { 
        "status":"logged_out"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***



## 3. Get Settings

**Method:** GET                        
**Endpoint:** `/api/getSettings`  
**Description:** Get SPC Settings stored in persistant database

**Cookie -** `"session_id=<15_characters_cookie>"`

**Responses:**   

**1. On Valid Settings Data**   
- **Status Code -** 200 (OK)          
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "700": {
            "a2": 1.50,
            "d3": 0.00,
            "d4": 3.50,
            "usl": 26.00,
            "lsl": 25.95,
            "datapointSize": 30,
            "machineName": "machineName",
            "machineIP": "machineIP",
            "toolOffsetNumber": 30,
            "offsetSize": 20
        },
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

## 4. Get Security Credintials

**Method:** GET                        
**Endpoint:** `/api/getSecurityCredintials`  
**Description:** Get Security Credintials, including wifi and user role data

**Cookie -** `"session_id=<15_characters_cookie>"`

**Responses:**   

**1. On Valid Settings Data**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "wifi": {
            "ssid": "NEWSSID",
            "password": "12345678"
        },
        "users": [
                {
                    "username": "admin",
                    "password": "admin123",
                    "userAlias": "admin",
                    "allowedTo": [
                        "SETTING", "MONITOR", "SECURITY"
                    ]
                }
        ]
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***





## 5. Update

**Method:** POST                        
**Endpoint:** `/api/update`  
**Description:** Update existing or Add new SPC Settings

**Cookie -** `"session_id=<15_characters_cookie>"`

**JSON Body:**
```json
    	{ 
            "monitorCode": "701",
            "a2": 1.50, 
            "d3": 0, 
            "d4": 3.50, 
            "usl": 26.00, 
            "lsl": 25.95, 
            "datapointSize": 30, 
            "machineName": "machineName", 
            "machineIP": "machineIP", 
            "toolOffsetNumber": 30, 
            "offsetSize": 20
        }
```

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `JSON Data Too Large` | `Invalid JSON Data`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

**5. Storage Full**   
- **Status Code -** 507 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Max Setting Storage Limit Reached`

***

## 6. Delete

**Method:** POST                        
**Endpoint:** `/api/delete`  
**Description:** Delete SPC Setting from persistant database 

**Cookie -** `"session_id=<15_characters_cookie>"`

**Query Parameters:**
- `monitorCode` (string, required)

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `Missing monitorCode`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

**5. Record Not Found**   
- **Status Code -** 404 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Record Not Found`

***

## 7. Reset

**Method:** POST                        
**Endpoint:** `/api/reset`  
**Description:** Reset record for respective monior code

**Cookie -** `"session_id=<15_characters_cookie>"`

**Query Parameters:**
- `monitorCode` (string, required)

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `Missing monitorCode`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

## 8. Update Wifi

**Method:** POST                        
**Endpoint:** `/api/updateWifi`  
**Description:** Update Wifi credintials
**Cookie -** `"session_id=<15_characters_cookie>"`

**JSON Body:**
```json
    	{
            "ssid":"newSSID", 
            "password":"newPassword"
        }	 
```

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `JSON Data Too Large` | `Invalid JSON Data` | `Length of password and ssid must be greater than 7`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

## 9. Update STA

**Method:** POST                        
**Endpoint:** `/api/updateSTA`  
**Description:** Update STA credintials
**Cookie -** `"session_id=<15_characters_cookie>"`

**JSON Body:**
```json
    	{
            "ssid":"newSSID", 
            "password":"newPassword"
        }	 
```

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `JSON Data Too Large` | `Invalid JSON Data` | `Length of password and ssid must be greater than 7`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***


## 10. Update Role

**Method:** POST                        
**Endpoint:** `/api/updateRole`  
**Description:** Update User credintials

**Cookie -** `"session_id=<15_characters_cookie>"`

**JSON Body:**
```json
    	{ 
            "username":"admin", 
            "password":"password", 
            "userAlias":"admin", 
            "allowedTo":["SETTING"] 
        }
```

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `JSON Data Too Large` | `Invalid JSON Data`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

**5. Storage Full**   
- **Status Code -** 507 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Max Setting Storage Limit Reached`

***

## 11. Delete Role

**Method:** POST                        
**Endpoint:** `/api/deleteRole`  
**Description:** Delete User Role

**Cookie -** `"session_id=<15_characters_cookie>"`

**Query Parameters:**
- `username` (string, required)

**Responses:**   

**1. On Setting Updation**   
- **Status Code -** 200 (OK)         
- **Body -**   

    - **Content Type -** application/json
    - **JSON structure -**
    ```json
    {
        "status":"ok"
    }
    ```
***

**2. On Bad Request (Cookie Missing)**   
- **Status Code -** 400  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Session cookie not found` | `Missing username`

    ***

**3. Unauthenticated**   
- **Status Code -** 401  
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Unauthenticated`

***

**4. Not Allowed**   
- **Status Code -** 403 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Not Allowded To Perform This Action`

***

**5. Record Not Found**   
- **Status Code -** 404 
- **Body -**   

    - **Content Type -** text/plain
    - **Text Message -** `Record Not Found`

***




## 12. subscribe (Websocket)
                       
**Endpoint:** `/subscribe`  
**Description:** Establish web socket to transfer live data based on pub sub model

- **First Message:** `VERIFY-15_Characters_cookie_set_at_time_of_login`

- **Subscribe Request:** `SUB-7Char_channel_name`

- **Unsubscribe Request:** `UNS-7Char_channel_name`

**Responses:**   

**1. Request Acknowledge (VERIFY, SUB, UNS)**   
- **Status Code -** N/A       
- **Message -** 
```json"
{
    "type":"msg",
    "data":{
        "subject":"verify" | "suback" | "unsack",
        "status":true | false
        "reason": .... (in case of failure only)
    }
}
``` 

**2. Subscribtion Content**   
- **Status Code -** N/A       
- **Message -** 
```json"
{
    "type":"content",
    "channel":"CHANNEL_NAME",
    "data":"JSON DATA PUBLSHED ON THAT CHANNEL"
}
``` 
***

**Disconnects:**  

**1. Unauthenticated** 
- **On -** If client dont send the cookie as first message Or send wrong cookie
- **Code -** 1008
- **Message -** "UNAUTHORIZED"

**2. Bad Request** 
- **On -** If Client send invalid message or in wrong format
- **Code -** 1008
- **Message -** "INVALID MESSAGE"

**3. Force disconnect** 
- **On -** If client gets logged out due to any issues
- **Code -** 1000
- **Message -** "FORCEFULLY LOGGED OUT"

**4. No Pong** 
- **On -** If client does not send pong for any ping
- **Code -** 4000
- **Message -** "NO PONG"

**5. Server Overload** 
- **On -** If client capacity reached beyond limit
- **Code -** 1013
- **Message -** "CLIENT CAPACITY FULL"

**6. too Many Requests** 
- **On -** If client send multiple request without closing old one
- **Code -** 3001
- **Message -** "TOO MANY REQUESTS"

