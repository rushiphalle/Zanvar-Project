#ifndef MYSPCCALCULATOR_H
#define MYSPCCALCULATOR_H

#include "stdStructs.h"
#include <math.h>     // pow, sqrt
#include <algorithm>  // std::min

inline float roundToThreeDecimals(float value) {
    return roundf(value * 1000.0f) / 1000.0f;
}

inline SPCResult calculate(SPCSettings setting, float values[], int elementsInArray) {
    SPCResult result{};
    if (elementsInArray <= 0) {
        return result; // empty result if no data
    }

    // --- 1. X-bar (mean) ---
    float sum = 0.0f;
    for (int i = 0; i < elementsInArray; i++) {
        sum += values[i];
    }
    result.xBar = roundToThreeDecimals(sum / elementsInArray);

    // --- 2. Moving Ranges ---
    float sumMR = 0.0f;
    result.avgMR = 0.0f;
    result.mrArray.size = (elementsInArray > 1) ? elementsInArray : 0;
    result.mrArray.data[0] = 0;

    for (int i = 1; i < elementsInArray; i++) {
        float mr = fabs(values[i] - values[i - 1]);
        result.mrArray.data[i] = roundToThreeDecimals(mr);
        sumMR += mr;
    }

    if (elementsInArray > 1) {
        result.avgMR = roundToThreeDecimals(sumMR / (elementsInArray - 1));
    }

    // --- 3. Standard Deviation ---
    float sumSq = 0.0f;
    for (int i = 0; i < elementsInArray; i++) {
        sumSq += pow(values[i] - result.xBar, 2);
    }
    result.stdDev = roundToThreeDecimals(sqrt(sumSq / elementsInArray));

    // --- 4. Control Limits ---
    result.UCL_X = roundToThreeDecimals(result.xBar + setting.a2 * result.stdDev);
    result.LCL_X = roundToThreeDecimals(result.xBar - setting.a2 * result.stdDev);

    result.UCL_MR = roundToThreeDecimals(setting.d4 * result.stdDev);
    result.LCL_MR = roundToThreeDecimals(setting.d3 * result.stdDev);

    // --- 5. Cp & Cpk ---
    if (result.stdDev > 0) {
        result.cp = roundToThreeDecimals((setting.usl - setting.lsl) / (6 * result.stdDev));
        float cpk1 = (setting.usl - result.xBar) / (3 * result.stdDev);
        float cpk2 = (result.xBar - setting.lsl) / (3 * result.stdDev);
        result.cpk = roundToThreeDecimals(std::min(cpk1, cpk2));
    } else {
        result.cp = 0;
        result.cpk = 0;
    }

    return result;
}

#endif
