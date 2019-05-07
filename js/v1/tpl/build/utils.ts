export function hrtimeToSeconds(hrtime) {
    const seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}
