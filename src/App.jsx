import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import ClockInOutPage from './ClockInOutPage';
import AdminPage from './AdminPage';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
function App() {

  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setUserLocation({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //         });
  //       },
  //       (error) => {
  //         setError(error.message);
  //       }
  //     );
  //   } else {
  //     setError("Geolocation not available");
  //   }
  // }, []);

  const isNearWestWindsor = (latitude, longitude) => {

    const westWindsorCoords = { latitude: 40.371231, longitude: -74.650619 }; //-> SpringHill Suites Coordinates
//const westWindsorCoords = { latitude: 40.313250, longitude: -74.620415 } -> Best in Class West Windsor Coordinates
  
   
   
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      westWindsorCoords.latitude,
      westWindsorCoords.longitude
    );

    console.log(distance);
    return distance < 2; // Check if within 1 km
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  // if (!userLocation) {
  //   return <div>Loading...</div>;
  // }




  return (

    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={
            <ClockInOutPage />
            // isNearWestWindsor(userLocation.latitude, userLocation.longitude) ? <ClockInOutPage /> : <h1>You Must Be at Best In Class in Order to Check In!</h1>
            
          } />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Container>
    </Router>

    </LocalizationProvider>
  );
}

export default App;
