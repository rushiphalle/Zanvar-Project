#ifndef SPC_H
#define SPC_H

#include <vector>
#include <cmath>
#include <algorithm>
#include "stdStructs.h"

// Round to 3 decimal places
inline float round3(float val) {
    return std::round(val * 1000.0f) / 1000.0f;
}

inline SPCResult calculate(const std::vector<float>& dataPoints, SPCsettings settings) {
    SPCResult result = {};

    const float A2 = settings.A2;
    const float D3 = settings.D3;
    const float D4 = settings.D4;
    const float USL = settings.USL;
    const float LSL = settings.LSL;

    std::size_t n = dataPoints.size();
    if (n < 2) return result;

    // Calculate x̄ (average)
    float sum = 0.0f;
    for (float val : dataPoints) sum += val;
    result.xBar = round3(sum / n);

    // Calculate standard deviation
    float sumDev = 0.0f;
    for (float val : dataPoints)
        sumDev += (val - result.xBar) * (val - result.xBar);
    result.stdDev = round3(std::sqrt(sumDev / n));

    // Calculate Moving Range (MR)
    result.mrArray.reserve(n - 1);
    float sumMR = 0.0f;
    for (std::size_t i = 1; i < n; ++i) {
        float mr = std::abs(dataPoints[i] - dataPoints[i - 1]);
        result.mrArray.push_back(round3(mr));
        sumMR += mr;
    }
    result.avgMR = round3(sumMR / (n - 1));

    // Control Limits
    result.UCL_X = round3(result.xBar + A2 * result.stdDev);
    result.LCL_X = round3(result.xBar - A2 * result.stdDev);
    result.UCL_MR = round3(D4 * result.stdDev);  // Typically uses avgMR * D4
    result.LCL_MR = round3(D3 * result.stdDev);  // but here stdDev is used, so fine if that's your standard

    // Cp and Cpk (Check for divide-by-zero)
    if (result.stdDev != 0.0f) {
        result.cp = round3((USL - LSL) / (6.0f * result.stdDev));
        result.cpk = round3(std::min(
            (USL - result.xBar) / (3.0f * result.stdDev),
            (result.xBar - LSL) / (3.0f * result.stdDev)
        ));
    } else {
        result.cp = 0.0f;
        result.cpk = 0.0f;
    }

    result.isDrifting = false;

    return result;
}

#endif // SPC_H
