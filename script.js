let map;
let clickLocation; // Store the clicked location for later use

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map = new google.maps.Map(document.getElementById("map"), {
                    center: userLocation,
                    zoom: 12,
                });

                // Add marker for user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here!",
                });

                // Map click event listener
                map.addListener("click", (e) => {
                    clickLocation = e.latLng; // Store the clicked location
                    openModal(); // Open the modal to collect info
                });
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }
}

// Open the modal
function openModal() {
    document.getElementById("pinModal").style.display = "block";
}

// Close the modal
document.querySelector(".close").onclick = function() {
    document.getElementById("pinModal").style.display = "none";
};

// Handle form submission
document.getElementById("pinForm").onsubmit = function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Gather data from the form
    const issueType = document.getElementById("issueType").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("imageUpload").files[0];

    if (issueType && description) {
        // Here you can process the form data (e.g., upload to Firebase)
        console.log("Issue Type:", issueType);
        console.log("Description:", description);
        console.log("Location:", clickLocation);
        if (file) {
            console.log("Image:", file.name);
            // You would handle the image upload as before
        }

        // Close the modal
        document.getElementById("pinModal").style.display = "none";

        // Add the marker to the map
        const marker = new google.maps.Marker({
            position: clickLocation,
            map: map,
            title: description // Use the description as tooltip
        });

        // Reset the form
        document.getElementById("pinForm").reset();
    }
};
