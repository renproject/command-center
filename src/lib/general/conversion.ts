import moment from "moment";

export const alreadyPast = (expiry: number) => {
    return moment.unix(expiry).isBefore(moment.now());
};

/**
 * Converts a timestamp to the number of hours, minutes or seconds from now,
 * showing "Expired" if the timestamp has already passed.
 *
 * TODO: Make countdown schedule rerender (based on time unit)
 *
 * @param expiry the time to countdown to as a unix timestamp in seconds
 * @returns a JSX span element with the time remaining and a unit
 */
export const naturalTime = (expiry: number, options: { message: string; prefix?: string; suffix?: string; countDown: boolean; showingSeconds?: boolean }): string => {
    let diff;
    if (!options.countDown) {
        diff = moment.duration(moment().diff(moment.unix(expiry)));
    } else {
        diff = moment.duration(moment.unix(expiry).diff(moment()));
    }
    let days = diff.asDays();
    let hours = diff.asHours();
    let minutes = diff.asMinutes();
    let seconds = diff.asSeconds();

    const suffix = options.suffix ? ` ${options.suffix}` : "";
    const prefix = options.prefix ? `${options.prefix} ` : "";

    if (days > 2) {
        days = Math.round(days);
        return `${prefix}${days} ${days === 1 ? "day" : "days"}${suffix}`;
    }
    if (hours >= 1) {
        // Round to the closest hour
        hours = Math.round(hours);
        return `${prefix}${hours} ${hours === 1 ? "hour" : "hours"}${suffix}`;
    } else if (minutes >= 1) {
        minutes = Math.round(minutes);
        return `${prefix}${minutes} ${minutes === 1 ? "minute" : "minutes"}${suffix}`;
    } else if (options.showingSeconds && seconds >= 0) {
        seconds = Math.floor(seconds);
        return `${prefix}${seconds} ${seconds === 1 ? "second" : "seconds"}${suffix}`;
    } else {
        return `${options.message}`;
    }
};
