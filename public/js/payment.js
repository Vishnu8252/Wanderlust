document.getElementById("pay-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    try {

        const form = document.getElementById("booking-form");
        const formData = new FormData(form);

        const checkIn = formData.get("checkIn");
        const checkOut = formData.get("checkOut");
        const guests = formData.get("guests");

        if (!checkIn || !checkOut) {
            alert("Please select check-in and check-out dates.");
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const nights = Math.ceil(
            (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {
            alert("Check-out date must be after Check-in date.");
            return;
        }

        const pricePerNight = Number(
            document.getElementById("pricePerNight").value
        );

        const amount = nights * pricePerNight;

        const response = await fetch("/bookings/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            throw new Error("Unable to create Razorpay order");
        }

        const order = await response.json();

        const options = {
            key: "rzp_test_TEYTcNzpbq9dsH",
            amount: order.amount,
            currency: order.currency,
            name: "Wanderlust",
            description: "Stay Booking",
            image: "/images/logo.png",
            order_id: order.id,

            handler: async function (response) {

                const data = {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,

                    listingId: document.getElementById("listingId").value,
                    checkIn,
                    checkOut,
                    guests
                };

                const verify = await fetch("/bookings/verify-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await verify.json();

                if (result.success) {
                    alert("Payment Verified & Booking Confirmed!");
                    window.location.href = "/bookings";
                } else {
                    alert("Payment Verification Failed!");
                }
            },

            prefill: {
                name: "",
                email: "",
                contact: ""
            },

            notes: {
                booking: "Wanderlust Booking"
            },

            theme: {
                color: "#fe424d"
            },

            modal: {
                ondismiss: function () {
                    console.log("Payment popup closed");
                }
            },

            config: {
                display: {
                    blocks: {
                        upi: {
                            name: "Pay using UPI",
                            instruments: [
                                {
                                    method: "upi"
                                }
                            ]
                        }
                    },
                    sequence: [
                        "block.upi",
                        "block.card",
                        "block.netbanking"
                    ],
                    preferences: {
                        show_default_blocks: true
                    }
                }
            }
        };

        const rzp = new Razorpay(options);

        rzp.on("payment.failed", function (response) {
            alert("Payment Failed!");
            console.log(response.error);
        });

        rzp.open();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }
});