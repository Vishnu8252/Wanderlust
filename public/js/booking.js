console.log("booking.js loaded");
console.log("Booked Dates:", bookedDates);
const disabledDates = [];

bookedDates.forEach((booking) => {

    let start = new Date(booking.checkIn);
    let end = new Date(booking.checkOut);

    while (start <= end) {

        disabledDates.push(
            start.toISOString().split("T")[0]
        );

        start.setDate(start.getDate() + 1);
    }

});

flatpickr("#checkIn", {

    minDate: "today",

    dateFormat: "Y-m-d",

    disable: disabledDates,

});

flatpickr("#checkOut", {

    minDate: "today",

    dateFormat: "Y-m-d",

    disable: disabledDates,

});