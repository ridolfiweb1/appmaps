let map;
let markers = [];
let geocoder;
let service;
let currentLocation;

// Inicializar o mapa
function initMap() {
    // Localização padrão (Campinas, SP)
    const defaultLocation = { lat: -22.9099, lng: -47.0626 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 14,
        mapTypeControl: false,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    geocoder = new google.maps.Geocoder();
    service = new google.maps.places.PlacesService(map);
    
    setupEventListeners();
}

// Configurar eventos
function setupEventListeners() {
    document.getElementById('locationBtn').addEventListener('click', getCurrentLocation);
    document.getElementById('searchBtn').addEventListener('click', searchAddress);
    
    // Eventos dos filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Adicionar active no clicado
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            searchNearby(type);
        });
    });
    
    // Enter no input
    document.getElementById('addressInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAddress();
        }
    });
}

// Obter localização atual
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(currentLocation);
                map.setZoom(15);
                
                // Adicionar marcador da posição atual
                new google.maps.Marker({
                    position: currentLocation,
                    map: map,
                    title: 'Você está aqui!',
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }
                });
                
                alert('✅ Localização obtida! Selecione um filtro para buscar estabelecimentos.');
            },
            (error) => {
                alert('❌ Erro ao obter localização: ' + error.message);
            }
        );
    } else {
        alert('❌ Geolocalização não é suportada pelo seu navegador.');
    }
}

// Buscar por endereço
function searchAddress() {
    const address = document.getElementById('addressInput').value;
    
    if (!address) {
        alert('Digite um endereço!');
        return;
    }
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
            currentLocation = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            map.setCenter(currentLocation);
            map.setZoom(15);
            
            // Adicionar marcador
            new google.maps.Marker({
                position: currentLocation,
                map: map,
                title: address,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
            });
            
            alert('✅ Endereço encontrado! Selecione um filtro para buscar estabelecimentos.');
        } else {
            alert('❌ Endereço não encontrado: ' + status);
        }
    });
}

// Buscar estabelecimentos próximos
function searchNearby(type) {
    if (!currentLocation) {
        alert('❌ Defina uma localização primeiro!');
        return;
    }
    
    // Limpar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    const request = {
        location: currentLocation,
        radius: 2000, // 2km de raio
        type: type
    };
    
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayResults(results);
            addMarkers(results);
        } else {
            alert('❌ Nenhum resultado encontrado.');
            document.getElementById('placesList').innerHTML = '<p>Nenhum estabelecimento encontrado.</p>';
        }
    });
}

// Exibir resultados
function displayResults(places) {
    const placesList = document.getElementById('placesList');
    placesList.innerHTML = '';
    
    places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        
        const rating = place.rating ? `⭐ ${place.rating}` : 'Sem avaliações';
        const isOpen = place.opening_hours?.open_now ? '🟢 Aberto' : '🔴 Fechado';
        
        card.innerHTML = `
            <h4>${place.name}</h4>
            <p>📍 ${place.vicinity}</p>
            <p>${rating} | ${isOpen}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}&query_place_id=${place.place_id}" target="_blank">Ver no Google Maps →</a>
        `;
        
        placesList.appendChild(card);
    });
}

// Adicionar marcadores no mapa
function addMarkers(places) {
    places.forEach(place => {
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            animation: google.maps.Animation.DROP
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${place.name}</strong><br>${place.vicinity}`
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
    });
}

// Inicializar quando carregar
window.onload = initMap;
