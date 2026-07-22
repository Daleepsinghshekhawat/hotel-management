import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import URL from "../api";

const API = `${URL}/api`;

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoom();
  }, []);

  const getRoom = async () => {
    try {
      const res = await axios.get(`${API}/getRoom/${id}`);

      if (res.data.success) {
        setRoom(res.data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  if (!room) return <h2>Room Not Found</h2>;

  return (
    <div style={styles.container}>
      <h1>{room.roomName}</h1>

      {/* Images */}

      <div style={styles.gallery}>
        {room.images?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            style={styles.image}
          />
        ))}
      </div>

      {/* Room Information */}

      <div style={styles.card}>
        <h2>Room Information</h2>

        <p><b>Room Number :</b> {room.roomNumber}</p>

        <p><b>Room Type :</b> {room.roomType}</p>

        <p><b>Floor :</b> {room.floor}</p>

        <p><b>Room Size :</b> {room.roomSize} sqft</p>

        <p><b>Bed :</b> {room.beds} {room.bedType}</p>

        <p><b>Guests :</b> {room.maxGuests}</p>

        <p><b>Price :</b> ₹{room.price}</p>

        <p><b>Discount :</b> {room.discount}%</p>

        <p><b>Final Price :</b> ₹{room.finalPrice}</p>

        <p><b>Status :</b> {room.bookingStatus}</p>
      </div>

      {/* Amenities */}

      <div style={styles.card}>
        <h2>Amenities</h2>

        <div style={styles.grid}>
          {room.wifi && <span>✅ WiFi</span>}
          {room.ac && <span>✅ AC</span>}
          {room.heater && <span>✅ Heater</span>}
          {room.fan && <span>✅ Fan</span>}
          {room.smartTV && <span>✅ Smart TV</span>}
          {room.ott && <span>✅ OTT</span>}
          {room.refrigerator && <span>✅ Refrigerator</span>}
          {room.microwave && <span>✅ Microwave</span>}
          {room.kettle && <span>✅ Kettle</span>}
          {room.coffeeMachine && <span>✅ Coffee Machine</span>}
          {room.workDesk && <span>✅ Work Desk</span>}
          {room.sofa && <span>✅ Sofa</span>}
          {room.wardrobe && <span>✅ Wardrobe</span>}
          {room.balcony && <span>✅ Balcony</span>}
        </div>
      </div>

      {/* Bathroom */}

      <div style={styles.card}>
        <h2>Bathroom</h2>

        <div style={styles.grid}>
          {room.attachedBathroom && <span>✅ Attached Bathroom</span>}
          {room.bathtub && <span>✅ Bathtub</span>}
          {room.shower && <span>✅ Shower</span>}
          {room.hotWater && <span>✅ Hot Water</span>}
          {room.toiletries && <span>✅ Toiletries</span>}
          {room.hairDryer && <span>✅ Hair Dryer</span>}
        </div>
      </div>

      {/* Meals */}

      <div style={styles.card}>
        <h2>Meals</h2>

        <div style={styles.grid}>
          {room.breakfast && <span>🍽 Breakfast</span>}
          {room.lunch && <span>🍛 Lunch</span>}
          {room.dinner && <span>🍲 Dinner</span>}
        </div>
      </div>

      {/* Policies */}

      <div style={styles.card}>
        <h2>Policies</h2>

        <div style={styles.grid}>
          {room.coupleFriendly && <span>❤️ Couple Friendly</span>}
          {room.pets && <span>🐶 Pets Allowed</span>}
          {room.smoking && <span>🚬 Smoking Allowed</span>}
          {room.refundable && <span>💰 Refundable</span>}
          {room.instantBooking && <span>⚡ Instant Booking</span>}
        </div>
      </div>

      {/* Description */}

      <div style={styles.card}>
        <h2>Description</h2>

        <p>{room.description}</p>
      </div>

      {/* Buttons */}

      <div style={styles.buttonBox}>
        <button
          style={styles.edit}
          onClick={() =>
            navigate(`/admin/edit-room/${room._id}`)
          }
        >
          Edit Room
        </button>

        <button
          style={styles.back}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "90%",
    margin: "30px auto",
  },

  gallery: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  image: {
    width: "220px",
    height: "160px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "10px",
  },

  buttonBox: {
    display: "flex",
    gap: "15px",
  },

  edit: {
    padding: "12px 25px",
    background: "#198754",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  back: {
    padding: "12px 25px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default RoomDetails;