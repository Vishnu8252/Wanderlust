document.addEventListener("DOMContentLoaded", () => {

    const payBtn = document.getElementById("pay-btn");

    if (!payBtn) return;

    payBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        try {

            const form = document.getElementById("booking-form");
            const formData = new FormData(form);

            const listingId = document.getElementById("listingId").value;
            const checkIn = formData.get("checkIn");
            const checkOut = formData.get("checkOut");
            const guests = formData.get("guests");

            if (!checkIn || !checkOut) {
                alert("Please select Check-In and Check-Out dates.");
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            const nights = Math.ceil(
                (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
            );

            if (nights <= 0) {
                alert("Check-Out date must be after Check-In date.");
                return;
            }

            // ===============================
            // Create Razorpay Order
            // ===============================

            const orderResponse = await fetch("/bookings/create-order", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    listingId,
                    checkIn,
                    checkOut,
                    guests,
                }),

            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                throw new Error(orderData.message);
            }

            const order = orderData.order;

            // ===============================
            // Razorpay Checkout
            // ===============================

            const options = {

                key: "rzp_test_TEYTcNzpbq9dsH",

                amount: order.amount,

                currency: order.currency,

                name: "Wanderlust",

                description: "Stay Booking",

                image: "/images/logo.png",

                order_id: order.id,

                handler: async function (response) {

                    try {

                        const verifyResponse = await fetch("/bookings/verify-payment", {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                            },

                            body: JSON.stringify({

                                razorpay_order_id: response.razorpay_order_id,

                                razorpay_payment_id: response.razorpay_payment_id,

                                razorpay_signature: response.razorpay_signature,

                                listingId,

                                checkIn,

                                checkOut,

                                guests,

                            }),

                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {

                            alert("✅ Booking Confirmed!");

                            window.location.href = "/bookings/my";

                        } else {

                            alert(verifyData.message || "Payment Verification Failed");

                        }

                    } catch (err) {

                        console.error(err);

                        alert("Payment Verification Failed.");

                    }

                },

                prefill: {

                    name: "",

                    email: "",

                    contact: "",

                },

                notes: {

                    booking: "Wanderlust Booking",

                },

                theme: {

                    color: "#fe424d",

                },

                modal: {

                    ondismiss: function () {

                        console.log("Payment popup closed.");

                    }

                }

            };

            const rzp = new Razorpay(options);

            rzp.on("payment.failed", function (response) {

                console.error(response.error);

                alert(response.error.description);

            });

            rzp.open();

        }

        catch (err) {

            console.error(err);

            alert(err.message || "Unable to create Razorpay order.");

        }

    });

});