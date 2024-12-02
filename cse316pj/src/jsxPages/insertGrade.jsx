import React, {useEffect, useState} from 'react';
import '../cssPages/facilityList.css';
import axios from 'axios';

function InsertGrade(){

  const [facility, setFacility] = useState([]);

  useEffect(() => {
    // Backend API call
    axios.get('http://localhost:3001/api/facilities') // get the data by using axios
      .then((response) => {
        console.log('API 데이터:', response.data);
        setFacility(response.data);
      })
      .catch((error) => {
        console.error('Error fetching facility data:', error);
      });
  }, []);
  
  return (
    <div className="imageContainer">
      {/* find the right source by using map function */}
      {facility.length > 0 ? facility.map((fac, index) => (
        <div key={index} className="image-box">
          {/* facility photo */}
          <img src={fac.img_src} alt={fac.facility_name}/>

          {/* Facility Information */}
          <h2>{fac.facility_name}</h2>
          <p>{fac.facility_desc}</p>
          <p><img src={'/calendar.png'} alt={'calendar icon'} />{fac.available_days}</p>
          <p><img src={'/people.png'} alt={'people icon'} />{fac.min_capacity}-{fac.max_capacity}</p>
          <p><img src={'/location.png'} alt={'location icon'} />{fac.location}</p>
          <p><img src={'/exclamation.png'} alt={'exclamation icon'} />{fac.suny_flag ? 'Only available for SUNY' : 'Available to All'}</p>
        </div>
      )) : (
        <p>Data not loaded</p> // message to show when there is an error of data loading
      )}
    </div>
  );
};

export default InsertGrade;
