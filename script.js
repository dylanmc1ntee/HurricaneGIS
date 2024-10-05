let map;
let clickLocation; // Store the clicked location for later use
let autocomplete; // Variable for autocomplete
let token = ''; // Store the JWT token here
const API_URL = 'http://localhost:5000/api/auth'; // Base URL for your API

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

                // Fetch and render pins from the database
                fetchPins();
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

    // Add event listener for address search button
    document.getElementById("searchButton").addEventListener("click", () => {
        const address = document.getElementById("addressInput").value;
        geocodeAddress(address);
    });

    // Handle user registration
    document.getElementById('registerForm').onsubmit = async function (event) {
        event.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.text();
        alert(data); // Show registration result
    };

    // Handle user login
    document.getElementById('loginForm').onsubmit = async function (event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token; // Store the JWT token
            alert('Login successful!');
            document.getElementById('markerForm').style.display = 'block'; // Show the marker form
        } else {
            alert(data); // Show error message
        }
    };

    // Handle form submission for adding a marker
    document.getElementById("pinForm").onsubmit = async function (event) {
        event.preventDefault(); // Prevent form from submitting normally

        // Ensure clickLocation is set before submitting
        if (!clickLocation) {
            alert("Please select a location on the map first.");
            return;
        }

        // Gather data from the form
        const issueType = document.getElementById("issueType").value;
        const description = document.getElementById("description").value;
        const file = document.getElementById("imageUpload").files[0]; // Get the uploaded file

        if (issueType && description) {
            // Close the modal
            document.getElementById("pinModal").style.display = "none";

            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append("issueType", issueType);
            formData.append("description", description);
            formData.append("latitude", clickLocation.lat());
            formData.append("longitude", clickLocation.lng());
            if (file) {
                formData.append("image", file); // Append the uploaded file
            }

            // Add the marker to the database
            const response = await fetch('http://localhost:5000/api/markers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include JWT in the header
                },
                body: formData, // Send form data, including the image file
            });

            const data = await response.json();
            if (response.ok) {
                alert('Marker added successfully!');
                const marker = new google.maps.Marker({
                    position: clickLocation,
                    map: map,
                    title: description // Use the description as tooltip
                });

                // Create an InfoWindow to display information including the image
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h3>${issueType}</h3>
                            <p>${description}</p>
                            <p>Location: ${clickLocation.lat()}, ${clickLocation.lng()}</p>
                            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Uploaded Image" style="max-width:100px; max-height:100px;" />` : ""}
                        </div>
                    `
                });

                // Add click event listener to the marker
                marker.addListener('click', () => {
                    infoWindow.open(map, marker); // Show the InfoWindow on marker click
                });

            } else {
                console.error("Error adding marker:", data);
                alert("Error adding marker: " + data.error); // Show detailed error message
            }

            // Reset the form
            document.getElementById("pinForm").reset();
        }
    };
}

// Function to extract user ID from the JWT token
function extractUserIdFromToken(token) {
    if (!token) {
        throw new Error("Token is missing");
    }

    const base64Url = token.split('.')[1];
    if (!base64Url) {
        throw new Error("Token payload is missing");
    }

    // Replace URL-safe base64 characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the payload
    try {
        const decodedPayload = JSON.parse(atob(base64));
        return decodedPayload._id; // Make sure this matches the actual field in your token
    } catch (error) {
        console.error("Failed to decode token payload:", error);
        throw new Error("Invalid token");
    }
}

// Fetch pins from MongoDB and display them on the map
function fetchPins() {
    fetch("http://localhost:3000/api/pins")  // Adjust this URL if needed
        .then(response => response.json())
        .then(data => {
            data.forEach(pin => {
                const marker = new google.maps.Marker({
                    position: { lat: pin.lat, lng: pin.lng },
                    map: map,
                    title: pin.description
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<p>${pin.description}</p>`
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            });
        })
        .catch(error => console.error("Error fetching pins:", error));
}

// Open the modal
function openModal() {
    document.getElementById("pinModal").style.display = "block";
}

// Close the modal
document.querySelector(".close").onclick = function() {
    document.getElementById("pinModal").style.display = "none";
};

// Add event listener for the form submit event, not the button
document.getElementById("pinForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent form from submitting the traditional way
    
    const description = document.getElementById("description").value; // Get description from modal
    
    // Prepare the pin data
    const pinData = {
        lat: clickLocation.lat(),  // Use the clickLocation's latitude
        lng: clickLocation.lng(),  // Use the clickLocation's longitude
        description: description   // Include the description entered in the modal
    };

    // Send the pin data to the backend API to save in MongoDB
    fetch("http://localhost:3000/api/pins", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pinData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Pin saved:", data);

        // Add a marker at the clicked location with the provided description
        const marker = new google.maps.Marker({
            position: clickLocation,
            map: map,
            title: description
        });

        // Attach an info window to display the description when the pin is clicked
        const infoWindow = new google.maps.InfoWindow({
            content: `<p>${description}</p>`
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });

        // Close the modal after saving the pin
        document.getElementById("pinModal").style.display = "none";
    })
    .catch(error => console.error("Error saving pin:", error));
});
// Function to handle location errors
function handleLocationError(browserHasGeolocation) {
    const errorMessage = browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    alert(errorMessage);
}

// Make sure to define window.initMap to link to the Google Maps API
window.initMap = initMap;
