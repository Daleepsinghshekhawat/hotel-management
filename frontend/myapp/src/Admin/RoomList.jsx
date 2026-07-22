import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

const API = `${URL}/api`;

const RoomList = ({ hotelId }) => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [roomType, setRoomType] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("");




    const navigate = useNavigate();
    const basePath = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";

    useEffect(() => {
        if (hotelId) {
            getRooms();
        }
    }, [hotelId]);

    useEffect(() => {
        let data = [...rooms];

        // Search
        if (search) {
            data = data.filter(
                (room) =>
                    room.roomName.toLowerCase().includes(search.toLowerCase()) ||
                    room.roomNumber.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Room Type
        if (roomType) {
            data = data.filter((room) => room.roomType === roomType);
        }

        // Status
        if (status) {
            data = data.filter((room) => room.bookingStatus === status);
        }

        // Sorting
        if (sort === "low") {
            data.sort((a, b) => a.finalPrice - b.finalPrice);
        }

        if (sort === "high") {
            data.sort((a, b) => b.finalPrice - a.finalPrice);
        }

        if (sort === "newest") {
            data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        setFilteredRooms(data);
    }, [rooms, search, roomType, status, sort]);

    const getRooms = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API}/getRoomsByHotel/${hotelId}`
            );

            if (res.data.success) {
                setRooms(res.data.result);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteRoom = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this room?"
        );

        if (!confirmDelete) return;

        try {
            const res = await axios.patch(
                `${API}/deleteRoom/${id}`
            );

            if (res.data.success) {
                alert("Room Deleted Successfully");
                getRooms();
            }
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
    }

    return (
        <div style={styles.container}>
            <h1>Room Management</h1>

            {/* FILTER BAR */}

            <div style={styles.filterBar}>
                <input
                    placeholder="Search Room..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.input}
                />

                <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    style={styles.input}
                >
                    <option value="">All Types</option>
                    <option>Single</option>
                    <option>Double</option>
                    <option>Twin</option>
                    <option>Queen</option>
                    <option>King</option>
                    <option>Suite</option>
                    <option>Deluxe</option>
                    <option>Family</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={styles.input}
                >
                    <option value="">All Status</option>
                    <option>Available</option>
                    <option>Booked</option>
                    <option>Maintenance</option>
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={styles.input}
                >
                    <option value="">Sort</option>
                    <option value="newest">Newest</option>
                    <option value="low">Price Low → High</option>
                    <option value="high">Price High → Low</option>
                </select>

                <button
                    style={styles.addButton}
                    onClick={() => navigate(`${basePath}/add-room?hotelId=${hotelId}`)}
                >
                    + Add Room
                </button>
            </div>

            {/* TABLE */}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Room No.</th>
                        <th>Room Type</th>
                        <th>Guests</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredRooms.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        padding: "40px",
                                        textAlign: "center"
                                    }}
                                >

                                    <h2>No Rooms Added Yet</h2>

                                    <p>
                                        Click the button below to add your first room.
                                    </p>

                                    <button
                                        style={styles.addButton}
                                        onClick={() => navigate(`${basePath}/add-room?hotelId=${hotelId}`)}
                                    >

                                        + Add Room

                                    </button>

                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredRooms.map((room) => (
                            <tr key={room._id}>
                                <td>
                                    <img
                                        src={
                                            room.images?.length
                                                ? room.images[0]
                                                : "https://via.placeholder.com/80"
                                        }
                                        alt={room.roomName}
                                        style={styles.image}
                                    />
                                </td>

                                <td>{room.roomNumber}</td>

                                <td>{room.roomType}</td>

                                <td>{room.maxGuests}</td>

                                <td>₹{room.finalPrice}</td>

                                <td>
                                    <span
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            background:
                                                room.bookingStatus === "Available"
                                                    ? "#d4edda"
                                                    : room.bookingStatus === "Booked"
                                                        ? "#f8d7da"
                                                        : "#fff3cd",

                                            color:
                                                room.bookingStatus === "Available"
                                                    ? "green"
                                                    : room.bookingStatus === "Booked"
                                                        ? "red"
                                                        : "#856404",

                                            fontWeight: "bold"
                                        }}
                                    >
                                        {room.bookingStatus}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        style={styles.view}
                                        onClick={() => navigate(`${basePath}/room/${room._id}`)}
                                    >
                                        👁 View
                                    </button>

                                    <button
                                        style={styles.edit}
                                        onClick={() => navigate(`${basePath}/edit-room/${room._id}`)}
                                    >
                                        ✏ Edit
                                    </button>

                                    <button
                                        style={styles.delete}
                                        onClick={() => deleteRoom(room._id)}
                                    >
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: {
        width: "95%",
        margin: "30px auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,.1)",
    },

    filterBar: {
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "20px",
        alignItems: "center",
    },

    input: {
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        minWidth: "180px",
    },

    addButton: {
        background: "#0d6efd",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        cursor: "pointer",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    image: {
        width: "80px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "6px",
    },

    view: {
        background: "#0d6efd",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: 5,
        cursor: "pointer",
        transition: "0.3s"
    },

    edit: {
        marginRight: 5,
        background: "#198754",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: "5px",
        cursor: "pointer",
    },

    delete: {
        background: "#dc3545",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default RoomList;