// This file contains the JavaScript code for the establishment search application.

let map;
let service;
let infowindow;

function initMap() {
    const location = { lat: -23.5505, lng: -46.6333 }; // Default location (São Paulo)
    map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 15,
    });

    const locationBtn = document.getElementById("locationBtn");
    locationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Você está aqui!",
                });
            });
        } else {
            alert("Geolocalização não é suportada por este navegador.");
        }
    });

    const searchBtn = document.getElementById("searchBtn");
    searchBtn.addEventListener("click", () => {
        const address = document.getElementById("addressInput").value;
        searchEstablishments(address);
    });

    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const type = button.getAttribute("data-type");
            filterEstablishments(type);
        });
    });
}

function searchEstablishments(address) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            map.setCenter(results[0].geometry.location);
            const marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
            });
            findNearbyEstablishments(results[0].geometry.location);
        } else {
            alert("Endereço não encontrado: " + status);
        }
    });
}

function findNearbyEstablishments(location) {
    const request = {
        location: location,
        radius: '500',
        type: ['restaurant', 'cafe', 'bar', 'lodging', 'pharmacy', 'hospital', 'gas_station', 'bank'],
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayResults(results);
        }
    });
}

function displayResults(places) {
    const placesList = document.getElementById("placesList");
    placesList.innerHTML = "";
    places.forEach((place) => {
        const li = document.createElement("li");
        li.textContent = place.name;
        placesList.appendChild(li);
    });
}

function filterEstablishments(type) {
    const request = {
        location: map.getCenter(),
        radius: '500',
        type: [type],
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayResults(results);
        } else {
            console.error('Erro na busca de estabelecimentos:', status);
            alert('Erro ao buscar estabelecimentos. Tente novamente.');
        }
    });
}

// O mapa será inicializado automaticamente pelo callback da API
console.log('App.js carregado com sucesso');