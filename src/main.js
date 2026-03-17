const startBtn = document.getElementById('start');
const statusEl = document.getElementById('status');

// Haunted zones met echte geluiden
const zones = [
  {
    name: 'Spookhuis',
    lat: 50.985,
    lng: 4.56732,
    radius: 40,
    audio: new Audio('/audio/ghost1.mp3')
  },
  {
    name: 'Begraafplaats',
    lat: 50.986,
    lng: 4.5677,
    radius: 60,
    audio: new Audio('/audio/ghost_growl.mp3')
  }
];

let watchId = null;

startBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusEl.textContent = 'Geolocatie wordt niet ondersteund in deze browser.';
    return;
  }

  statusEl.textContent = 'Locatie wordt gevolgd...';

  // Audio voorbereiden (mobiel vereist user interaction)
  zones.forEach(z => {
    z.audio.load();
  });

  watchId = navigator.geolocation.watchPosition(onPosition, onError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000
  });
});

function onPosition(pos) {
  const { latitude, longitude } = pos.coords;
  statusEl.textContent = `Locatie: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  zones.forEach(zone => {
    const d = distanceInMeters(latitude, longitude, zone.lat, zone.lng);

    if (d <= zone.radius) {
      if (zone.audio.paused) {
        zone.audio.loop = true;
        zone.audio.play().catch(() => {
          console.warn('Kon audio niet afspelen (permissie?).');
        });
        console.log(`In zone: ${zone.name}`);
      }
    } else {
      if (!zone.audio.paused) {
        zone.audio.pause();
        zone.audio.currentTime = 0;
      }
    }
  });
}

function onError(err) {
  statusEl.textContent = `Locatiefout: ${err.message}`;
}

// Haversine-formule voor afstand in meters
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}