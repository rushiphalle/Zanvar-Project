/**
 * Updates SPC (Statistical Process Control) settings or triggers logic based on limits.
 *
 * @param {string} monitorCode - Unique identifier for the SPC monitor or sensor.
 * @param {number} USL - Upper Specification Limit.
 * @param {number} LSL - Lower Specification Limit.
 * @param {number} D3 - SPC control limit (used in R chart calculations).
 * @param {number} D4 - SPC control limit (used in R chart calculations).
 * @param {number} A2 - Constant for calculating control limits in X̄ and R charts.
 * @param {string} bufferSizeName - Name or label indicating the buffer size used.
 * @param {string} machineIP - IP address of the machine for identification or communication.
 * @param {number} toolOffsetNum - Tool offset number to be used for adjustments.
 * @param {number} offsetSize - Size of the tool offset to apply.
 * @returns {boolean} Returns `true` if SPC settings get updated, otherwise `false`.
 */
export async function update(monitorCode, USL, LSL, D3, D4, A2, bufferSizeName, machineIP, toolOffsetNum, offsetSize) {
    try {
        const response = await fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                monitorCode,
                USL,
                LSL,
                D3,
                D4,
                A2,
                bufferSizeName,
                machineIP,
                toolOffsetNum,
                offsetSize,
            }),
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error during update:', error);
        return false;
    }
}

/**
 * Updates SPC (Statistical Process Control) settings or triggers logic based on limits.
 *
 * @param {string} monitorCode - Unique identifier for the SPC monitor or sensor.
 * @returns {boolean} Returns `true` if monitor get reset, otherwise `false`.
 */
export async function reset(monitorCode){
    return true
}

/**
 * Updates SPC (Statistical Process Control) settings or triggers logic based on limits.
 *
 * @param {string} monitorCode - Unique identifier for the SPC monitor or sensor.
 * @returns {boolean} Returns `true` if monitor get delted, otherwise `false`.
 */
export async function deleteM(monitorCode){
    return true
}

/**
 * Subscribrs to live SPC monitors
 * @param {(content: any) => void} callback - Function to call whenever content is emitted.
 */
export function subscribe(callback) {
    const socket = new WebSocket(`ws://${window.location.host}/subscribe`);

    socket.onopen = () => {
        console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
        try {
            const json = JSON.parse(event.data);
            callback(json);
        } catch (e) {
            console.error('Failed to parse WebSocket message as JSON:', e);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.warn('WebSocket connection closed.');
    };
}

/*DEMO DATA*/
let data = [
  {
    "monitorCode": "700",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {
        "value": 25.96,
        "MR": 0.0
      }
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "700",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "700",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "700",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
      {"value" : 25.97200, "MR": 0.00200},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "700",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
      {"value" : 25.97200, "MR": 0.00200},
      {"value" : 25.96800, "MR": 0.00400}
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "701",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {
        "value": 25.96,
        "MR": 0.0
      }
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "701",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "701",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "701",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
      {"value" : 25.97200, "MR": 0.00200},
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
  {
    "monitorCode": "701",
    "timestamp": "2025-07-17T12:30:45Z",
    "tableData": [
      {"value" : 25.96000, "MR":0.00000},
      {"value" : 25.96500, "MR": 0.00500},
      {"value" : 25.97000, "MR": 0.00500},
      {"value" : 25.97200, "MR": 0.00200},
      {"value" : 25.96800, "MR": 0.00400}
    ],
    "X-bar": 25.9,
    "stdDev": 15.5,
    "avgMR": 14189,
    "UCL_X": 215,
    "LCL_X": 5165,
    "UCL_MR": 484,
    "LCL_MR": 561,
    "cp": 6,
    "cpk": 51,
    "isDrifting": false,
    "a2": 516.5,
    "d3": 151.5,
    "usl": 15615.5,
    "lsl": 1566.5,
    "datapointSize": 626.5,
    "machineName": 156.5,
    "machineIP": 1563.5,
    "toolOffsetNumber": 641,
    "offsetSize": 51615.5
  },
]