#ifndef SPC_H
#define SPC_H

#include <vector>
#include <cmath>   

using namespace std;

struct SPCResult {
    float xBar;
    float stdDev;
    float avgMR;
    float UCL_X;
    float LCL_X;
    float UCL_MR;
    float LCL_MR;
    float cp;
    float cpk;
    vector<float> mrArray;
};

inline float round3(float val) {
    return round(val * 1000.0f) / 1000.0f;
}

inline SPCResult calculate(const vector<float>& dataPoints) {
    SPCResult result = {};

    const float A2 = 1.88;
    const float D3 = 0.0;
    const float D4 = 3.27;
    const float USL = 26.000;
    const float LSL = 25.950;

    size_t n = dataPoints.size();
    if (n < 2) return result;

    float sum = 0;
    for (float val : dataPoints) sum += val;
    result.xBar = round3(sum / n);

    float sumDev = 0;
    for (float val : dataPoints) sumDev += (val - result.xBar) * (val - result.xBar);
    result.stdDev = round3(sqrt(sumDev / n));

    result.mrArray.reserve(n - 1);
    float sumMR = 0;
    for (size_t i = 1; i < n; ++i) {
        float mr = abs(dataPoints[i] - dataPoints[i - 1]);
        result.mrArray.push_back(round3(mr));
        sumMR += mr;
    }
    result.avgMR = round3(sumMR / (n - 1));

    result.UCL_X = round3(result.xBar + A2 * result.stdDev);
    result.LCL_X = round3(result.xBar - A2 * result.stdDev);
    result.UCL_MR = round3(D4 * result.stdDev);
    result.LCL_MR = round3(D3 * result.stdDev);

    result.cp = round3((USL - LSL) / (6 * result.stdDev));
    result.cpk = round3(min(
        (USL - result.xBar) / (3 * result.stdDev),
        (result.xBar - LSL) / (3 * result.stdDev)
    ));

    return result;
}

#endif
