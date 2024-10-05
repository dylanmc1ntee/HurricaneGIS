let map;
function initMap() {
    // Initialize the map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Get user's latitude and longitude
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Initialize the map centered around the user's location
                map = new google.maps.Map(document.getElementById("map"), {
                    center: userLocation,
                    zoom: 15, // Adjust zoom level as needed
                });

                // Optionally, add a marker at the user's location
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here!", // Tooltip text
                });
            },
            () => {
                // Handle location error
                handleLocationError(true);
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false);
    }
}

function handleLocationError(browserHasGeolocation) {
    const errorMessage = browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    alert(errorMessage);
}

    // Adding an event listener for map clicks
    map.addListener("click", (e) => {
        const clickedLocation = e.latLng; // Get the clicked location
        const newMarker = new google.maps.Marker({
            position: clickedLocation,
            map: map,
            title: "New Event",
        });
    });
