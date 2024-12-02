import React, { useEffect, useState } from "react";
import '../cssPages/reservationHistory.css'
import axios from "axios";

function ReservationHistory() {
    const [reservations, setReservations] = useState([]);

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        //console.log("Attempting to refresh access token...");
        try {
            const response = await axios.post("http://localhost:3001/api/token/refresh", {
                token: refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            console.log("Access token refreshed successfully:", accessToken);
            return accessToken;
        } catch (error) {
            console.error("Error refreshing access token:", error);
            alert("Session expired. Please log in again.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/signin"; // Redirect to login page
            return null;
        }
    };

    const fetchReservations = async () => {
        let accessToken = localStorage.getItem("accessToken");

        console.log("Fetching reservations with access token:", accessToken);

        try {
            const response = await axios.get("http://localhost:3001/api/reservation", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("Reservations fetched successfully:", response.data);
            setReservations(response.data);
        } catch (error) {
            if (error.response?.status === 403) {
                // If unauthorized, try refreshing the token
                console.log("Access token expired or invalid. Refreshing token...");
                accessToken = await refreshAccessToken();
                if (accessToken) {
                    // Retry the API request with the new token
                    console.log("Retrying with new access token:", accessToken);
                    const retryResponse = await axios.get("http://localhost:3001/api/reservation", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    setReservations(retryResponse.data);
                }
            } else {
                alert("Error fetching reservation data:", error);
            }
        }
    };

    useEffect(() => {   
        fetchReservations();
    });
    

    const handleRemoveReservation = async(id) => {
        let accessToken = localStorage.getItem("accessToken");
        // Deleting the data which has particular id from DB
        try {
            // Deleting the data which has a particular id from DB
            await axios.delete(`http://localhost:3001/api/reservation/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            // After deleting from DB, update UI
            setReservations(reservations.filter(reservation => reservation.id !== id));
        } catch (error) {
            console.error('Error deleting reservation:', error);
            if (error.response?.status === 401) {
                accessToken = await refreshAccessToken();
                if (accessToken) {
                    // Retry the delete request with the new token
                    await axios.delete(`http://localhost:3001/api/reservation/${id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    setReservations(reservations.filter((reservation) => reservation.id !== id));
                }
            } else {
                console.error("Error deleting reservation:", error);
            }
        }
    };

    let content;
    /* Actually I could have put this code into return, but I was just curious of using if and else function */
    if (reservations.length === 0) {
        content = <div className="noRsrv">
                    <h2>No Reservation Yet</h2>
                </div>
    } 
    else {
        content = (
            <div className="wholeRsrv">
                {reservations.map((reservation, index) => (
                    <div key={index} className="reservationItem">
                        <img src={reservation.image_src} alt={reservation.reservation_name} className="rsrvedFacImg" />
                        <div className="itemContents">
                            <h2>{reservation.reservation_name}</h2>
                            <div className="descriptions">
                                {/* If nothing in purpose box, print - */}
                                <div className="descriptionItems"><img src={'/sticky_note.png'} alt={'stickyNote icon'}/>
                                    <p className="purpose">{reservation.purpose ? reservation.purpose : '-'}</p>
                                </div>

                                <div className="descriptionItems"><img src={'/calendar.png'} alt={'calendar icon'}/><p>{reservation.reservation_date}</p></div>

                                {/* If participant number is 1, only put my name */}
                                <div className="descriptionItems"><img src={'/people.png'} alt={'people icon'}/><p>{reservation.user_name} {reservation.user_number - 1 > 0 && `+ ${reservation.user_number - 1}`}</p></div>
                                <div className="descriptionItems"><img src={'/location.png'} alt={'location icon'}/><p>{reservation.location}</p></div>
                                <div className="descriptionItems"><img src={'/person_check.png'} alt={'availability icon'}/><p>{reservation.is_suny}</p></div>
                                <button className="cancelBtn" onClick={() => handleRemoveReservation(reservation.id)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {content}
        </div>
    );
}

export default ReservationHistory;
