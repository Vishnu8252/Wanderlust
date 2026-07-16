window.onload = function () {

    const lat = coordinates[1];
    const lng = coordinates[0];

    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const popup = L.popup({
        closeButton: false,
        offset: [0, -10],
    }).setContent(`
        <div style="text-align:center; min-width:180px;">
            <h6 style="margin-bottom:8px;">📍 ${listingTitle}</h6>
            <a href="https://www.google.com/maps?q=${lat},${lng}"
               target="_blank"
               style="
                    display:inline-block;
                    margin-top:8px;
                    padding:8px 14px;
                    background:#198754;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:14px;
               ">
                🧭 Get Directions
            </a>
        </div>
    `);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popup)
        .openPopup();
};