// Map initialization and Firebase data fetching
let map;
let markers = [];
let geocoder;
let firestoreListener = null;
let selectedRating = 0; // Variable to store the selected rating

async function initMap() {
    // Wait for Google Maps to load
    const {
        Map
    } = await google.maps.importLibrary("maps");
    // Import the marker library
    const {
        AdvancedMarkerElement
    } = await google.maps.importLibrary("marker");

    geocoder = new google.maps.Geocoder();

    // Create the map with default center
    map = new Map(document.getElementById("map"), {
        center: {
            lat: 37.7749,
            lng: -122.4194
        }, // Default center (San Francisco)
        zoom: 12,
        mapId: "hbdjsbnvconc"
    });

    // Store AdvancedMarkerElement in window for global access
    window.AdvancedMarkerElement = AdvancedMarkerElement;

    // Set up a real-time listener for landmarks from Firebase
    setupFirestoreListener();
    setupStarRating();
    setupFormSubmission();
}

// Function to set up a real-time listener on the Firestore collection
function setupFirestoreListener() {
    try {
        // First, make sure we have the required Firebase imports
        import ("https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js")
            .then(module => {
                const {
                    onSnapshot
                } = module;

                // Get reference to the Firestore collection
                const landmarksCollection = window.collection(window.db, "map_review");

                // Set up the real-time listener
                firestoreListener = onSnapshot(landmarksCollection,
                    // Success callback
                    (snapshot) => {
                        console.log("Firestore collection updated, reloading markers...");

                        // Clear all existing markers
                        clearMarkers();

                        // Process document changes
                        snapshot.forEach(doc => {
                            const landmarkData = doc.data();
                            console.log("Processing landmark:", landmarkData);

                            // Add the marker for this landmark
                            geocodeAddressAndAddMarker(landmarkData);
                        });

                        // If no documents, log it
                        if (snapshot.empty) {
                            console.log("No landmarks found in the database");
                        }
                    },
                    // Error callback
                    (error) => {
                        console.error("Error listening to collection:", error);
                        // Fall back to one-time fetch
                        fetchLandmarksAndDisplay();
                    }
                );
            })
            .catch(error => {
                console.error("Failed to import onSnapshot:", error);
                // Fall back to one-time fetch
                fetchLandmarksAndDisplay();
            });
    } catch (error) {
        console.error("Error setting up Firestore listener:", error);
        // Fall back to one-time fetch as a last resort
        fetchLandmarksAndDisplay();
    }
}

// Fallback function to fetch landmarks once
async function fetchLandmarksAndDisplay() {
    console.log("Using fallback method to fetch landmarks");
    try {
        const landmarksCollection = window.collection(window.db, "map_review");
        const landmarkSnapshot = await window.getDocs(landmarksCollection);

        // Clear existing markers
        clearMarkers();

        if (landmarkSnapshot.empty) {
            console.log("No landmarks found in the database");
            return;
        }

        landmarkSnapshot.forEach(doc => {
            const landmarkData = doc.data();
            console.log("Fetched landmark:", landmarkData);
            geocodeAddressAndAddMarker(landmarkData);
        });
    } catch (error) {
        console.error("Error fetching landmarks:", error);
    }
}

// Function to convert address to coordinates and create marker
function geocodeAddressAndAddMarker(landmarkData) {
    if (!landmarkData.address) {
        console.error("Landmark is missing address data");
        return;
    }

    geocoder.geocode({
        address: landmarkData.address
    }, (results, status) => {
        if (status === "OK" && results[0]) {
            const position = results[0].geometry.location;

            // Create content for the info window
            const contentString = `
        <div style="max-width: 250px;">
          <h3>${landmarkData["landmark name"] || "Unnamed Landmark"}</h3>
          <p><strong>Address:</strong> ${landmarkData.address}</p>
          <p><strong>Category:</strong> ${landmarkData.categories || "Not specified"}</p>
          <p><strong>Rating:</strong> ${landmarkData.ratings || "Not rated"}/5</p>
          ${landmarkData.image_url ? `<img src="${landmarkData.image_url}" alt="${landmarkData["landmark name"]}" style="max-width: 100%; max-height: 150px;">` : ''}
          ${landmarkData.comments ? `<p><strong>Comments:</strong> ${landmarkData.comments}</p>` : ''}
        </div>
      `;

            // Create an info window
            const infoWindow = new google.maps.InfoWindow({
                content: contentString,
            });

            // Create a marker with the landmark data using AdvancedMarkerElement
            const marker = new window.AdvancedMarkerElement({
                map: map,
                position: position,
                title: landmarkData["landmark name"] || "Unnamed Landmark",
            });

            // Store the marker for later reference
            markers.push(marker);

            // Add click event listener to show info window
            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });

            // Adjust map bounds to include this marker
            adjustMapBounds();
        } else {
            console.error("Geocode was not successful for the following reason: " + status);
        }
    });
}

// Function to adjust map bounds to include all markers
function adjustMapBounds() {
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => {
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);

        // If there's only one marker, zoom out a bit
        if (markers.length === 1) {
            const listener = google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom() > 16) map.setZoom(16);
                google.maps.event.removeListener(listener);
            });
        }
    }
}

// Function to clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => {
        marker.map = null; // Remove from map
    });
    markers = []; // Clear the array
}

// Star rating functionality
function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const value = parseInt(this.getAttribute('data-value'));
            selectedRating = value;

            // Reset all stars
            stars.forEach(s => s.classList.remove('active'));

            // Activate stars up to the selected one
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                }
            });
        });
    });
}

// Add form submission handling
function setupFormSubmission() {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            console.log("Submit button clicked");

            // Get form values
            const landmarkName = document.getElementById('landmark-name').value;
            const address = document.getElementById('address').value;
            const categories = document.getElementById('categories').value;
            const imageUrl = document.getElementById('image-url').value;
            const comments = document.getElementById('comments').value; // Get comments value


            // Validate form
            if (!landmarkName || !address) {
                alert("Please enter at least a landmark name and address.");
                return;
            }

            // Geocode the address to get latitude and longitude
            geocoder.geocode({
                address: address
            }, async (results, status) => {
                if (status === "OK" && results && results.length > 0) {
                    const position = results[0].geometry.location;
                    const latitude = position.lat();
                    const longitude = position.lng();
                    // Get selected rating
                    const activeStars = document.querySelectorAll('.star-rating .star.active');
                    const ratings = activeStars.length;
                    const landmarkData = {
                        "landmark name": landmarkName,
                        address: address,
                        categories: categories,
                        image_url: imageUrl,
                        ratings: ratings,
                        latitude: latitude,
                        longitude: longitude,
                        comments: comments,  // Add comments to landmarkData
                        timestamp: new Date().toISOString()
                    };

                    try {
                        const docRef = await window.addDoc(window.collection(window.db, "map_review"), landmarkData);
                        console.log("Landmark added with ID: ", docRef.id);

                        // Clear form
                        clearForm();

                        geocodeAddressAndAddMarker(landmarkData)
                        // Show success message
                        alert("Landmark added successfully!");

                    } catch (dbError) {
                        console.error("Error adding landmark to Firestore: ", dbError);
                        alert("Error adding landmark: " + dbError.message);
                    }

                } else {
                    console.error("Geocode was not successful for the following reason: " + status);
                    alert("Geocode was not successful. Please check the address.");
                }
            });
        });
    }
}

// Function to clear the form
function clearForm() {
    document.getElementById("landmark-name").value = "";
    document.getElementById("address").value = "";
    document.getElementById("categories").selectedIndex = 0;
    document.getElementById("image-url").value = "";
    document.getElementById('comments').value = ""; // Clear comments field

    // Reset star rating
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(s => s.classList.remove('active'));
    selectedRating = 0;
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, initializing map...");

    // Wait a moment for Firebase to initialize
    setTimeout(() => {
        // Initialize map
        initMap();

        // Setup UI interactions
        setupStarRating();


        // Add manual refresh button event listener (as a backup)
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh Map';
        refreshBtn.style.position = 'absolute';
        refreshBtn.style.bottom = '20px';
        refreshBtn.style.left = '20px';
        refreshBtn.style.zIndex = '100';
        refreshBtn.style.padding = '10px 15px';
        refreshBtn.style.backgroundColor = '#ff6b6b';
        refreshBtn.style.color = 'white';
        refreshBtn.style.border = 'none';
        refreshBtn.style.borderRadius = '5px';
        refreshBtn.style.cursor = 'pointer';

        refreshBtn.addEventListener('click', () => {
            console.log("Manual refresh requested");
            fetchLandmarksAndDisplay();
        });

        document.querySelector('.map-container').appendChild(refreshBtn);
    }, 1000); // Increased timeout to ensure Firebase is fully initialized
});