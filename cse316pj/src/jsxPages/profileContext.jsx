import React, { createContext, useState, useEffect } from "react";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const [profileImage, setProfileImage] = useState("./user.png");
    const [loading, setLoading] = useState(true);

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        try {
            const response = await fetch("http://localhost:3001/api/token/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: refreshToken }),
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            const data = await response.json();
            const { accessToken } = data;

            localStorage.setItem("accessToken", accessToken);
            console.log("Access token refreshed successfully:", accessToken);
            return accessToken;
        } catch (error) {
            console.error("Error refreshing access token:", error);
            alert("Session expired. Please log in again.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/homepage";
            return null;
        }
    };
    
    const fetchProfileImage = async () => {
        const userId = localStorage.getItem("userId");
        let accessToken = localStorage.getItem("accessToken");
        console.log("Access Token being sent:", accessToken);

        if (!userId || !accessToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/user/profile?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.status === 403) {
                console.log("Access Token expired, attempting to refresh...");
                accessToken = await refreshAccessToken();
                if (accessToken) {
                    const retryResponse = await fetch(`http://localhost:3001/api/user/profile?userId=${userId}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        if (data.img_src && data.img_src !== "") {
                            setProfileImage(data.img_src);
                        }
                    } else {
                        throw new Error("Failed to fetch profile image after token refresh");
                    }
                }
            } else if (response.ok) {
                const data = await response.json();
                if (data.img_src && data.img_src !== "") {
                    setProfileImage(data.img_src);
                }
            } else {
                throw new Error("Failed to fetch profile image");
            }
        } catch (error) {
            console.error("Error fetching profile image:", error);
            alert("Session expired. Please log in again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileImage();
    });

    return (
        <ProfileContext.Provider value={{ profileImage, setProfileImage, loading }}>
            {children}
        </ProfileContext.Provider>
    );
};
