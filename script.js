
let map;
let clickLocation; // Store the clicked location for later use
let autocomplete; // Variable for autocomplete

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
                    zoom: 15,
                });

                
                // Initialize the Autocomplete feature
                const addressInput = document.getElementById("addressInput");
                autocomplete = new google.maps.places.Autocomplete(addressInput);
                autocomplete.bindTo("bounds", map);

                // When the user selects an address, center the map on that location
                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        map.setCenter(place.geometry.location);
                        map.setZoom(15); // Set zoom level
                        new google.maps.Marker({
                            position: place.geometry.location,
                            map: map,
                            title: place.formatted_address, // Display the address as a marker title
                        });
                    } else {
                        alert("No details available for the input: '" + addressInput.value + "'");
                    }
                

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
        console.log("Issue Type:", issueType);
        console.log("Description:", description);
        console.log("Location:", clickLocation);
        if (file) {
            console.log("Image:", file.name);
            // Handle the image upload (if applicable)
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

// Function to handle location errors
function handleLocationError(browserHasGeolocation) {
    const errorMessage = browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    alert(errorMessage);
}

// Make sure to define window.initMap to link to the Google Maps API
window.initMap = initMap;

// Toggle header
document.getElementById('toggleTab').addEventListener('click', function() {
    const header = document.getElementById('headercontainer');
    
    // Get current transform value
    const currentTransform = getComputedStyle(header).transform;

    // Check if the header is currently moved
    if (currentTransform === 'none' || currentTransform === 'matrix(1, 0, 0, 1, 0, 0)') {
        header.style.transition = 'transform 0.3s ease'; 
        header.style.transform = 'translateY(-4.65em)'; 
    } else {
        header.style.transition = 'transform 0.3s ease'; 
        header.style.transform = 'translateY(0)'; 
    }
});