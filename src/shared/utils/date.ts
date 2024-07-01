import dayjs from 'dayjs';

export function displayDate(date: number) {
    return dayjs(date).format('l LT');
}

export class Time {
    static get second() {
        return 1000;
    }

    static get minute() {
        return this.second * 60;
    }

    static get hour() {
        return this.minute * 60;
    }

    static get day() {
        return this.hour * 24;
    }
}
