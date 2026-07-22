import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import apiurl from "../api";

const API = `${apiurl}/api`;

const EditRoom = () => {

    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    const [hotels, setHotels] = useState([]);

    const [roomData, setRoomData] = useState({
        hotel: "",

        roomName: "",
        roomNumber: "",
        floor: 1,
        roomType: "",
        description: "",

        roomSize: "",

        adults: 2,
        children: 0,
        maxGuests: 2,

        beds: 1,
        bedType: "",

        price: "",
        discount: "",
        tax: 18,
        weekendPrice: "",
        festivalPrice: "",
        extraBedPrice: "",
        wifi: false,
        ac: false,
        heater: false,
        fan: false,

        smartTV: false,
        ott: false,
        telephone: false,

        refrigerator: false,
        microwave: false,
        kettle: false,
        coffeeMachine: false,

        wardrobe: false,
        workDesk: false,
        sofa: false,
        diningTable: false,

        iron: false,
        locker: false,

        attachedBathroom: false,
        bathtub: false,
        shower: false,
        hotWater: false,
        toiletries: false,
        hairDryer: false,

        balcony: false,
        roomView: "",

        breakfast: false,
        lunch: false,
        dinner: false,

        roomService: false,
        laundry: false,
        housekeeping: false,
        wakeupCall: false,
        newspaper: false,

        parking: false,
        swimmingPool: false,
        gym: false,
        spa: false,
        restaurant: false,
        bar: false,

        wheelchair: false,
        lift: false,

        smokeDetector: false,
        fireExtinguisher: false,
        cctv: false,
        electronicLock: false,

        smoking: false,
        pets: false,
        coupleFriendly: false,
        localIdAccepted: false,
        refundable: false,
        instantBooking: false,

        bookingStatus: "Available",

    });

    const [images, setImages] = useState([]);

    useEffect(() => {
        getHotels();
          getRoom();
    }, []);

    const getHotels = async () => {
        try {
            const res = await axios.get(`${API}/getAllHotels`);

            if (res.data.result) {
                setHotels(res.data.result);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getRoom = async () => {
    try {
         const res = await axios.get(`${API}/getRoom/${id}`);

        if (res.data.success) {
            setRoomData(res.data.result);
        }
    } catch (error) {
        console.log(error);
    }
};

    const handleChange = (e) => {
        const { name, value } = e.target;

        setRoomData({
            ...roomData,
            [name]: value,
        });
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;

        setRoomData({
            ...roomData,
            [name]: checked,
        });
    };

    const handleImages = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const formData = new FormData();

            // Append all room fields
            Object.keys(roomData).forEach((key) => {
                formData.append(key, roomData[key]);
            });

            // Append images
            images.forEach((image, index) => {
                formData.append(`image${index}`, image);
            });

            const res = await axios.patch(`${API}/updateRoom/${id}`,formData);
            

            if (res.data.success) {
                alert("Room Added Successfully");

                // Reset form
                setRoomData({
                    hotel: "",
                    roomName: "",
                    roomNumber: "",
                    floor: 1,
                    roomType: "",
                    description: "",
                    roomSize: "",
                    adults: 2,
                    children: 0,
                    maxGuests: 2,
                    beds: 1,
                    bedType: "",

                    price: "",
                    discount: "",
                    tax: 18,
                    weekendPrice: "",
                    festivalPrice: "",
                    extraBedPrice: "",

                    wifi: false,
                    ac: false,
                    heater: false,
                    fan: false,
                    smartTV: false,
                    ott: false,
                    telephone: false,
                    refrigerator: false,
                    microwave: false,
                    kettle: false,
                    coffeeMachine: false,
                    wardrobe: false,
                    workDesk: false,
                    sofa: false,
                    diningTable: false,
                    iron: false,
                    locker: false,

                    attachedBathroom: false,
                    bathtub: false,
                    shower: false,
                    hotWater: false,
                    toiletries: false,
                    hairDryer: false,

                    balcony: false,
                    roomView: "",

                    breakfast: false,
                    lunch: false,
                    dinner: false,

                    roomService: false,
                    laundry: false,
                    housekeeping: false,
                    wakeupCall: false,
                    newspaper: false,

                    parking: false,
                    swimmingPool: false,
                    gym: false,
                    spa: false,
                    restaurant: false,
                    bar: false,

                    wheelchair: false,
                    lift: false,

                    smokeDetector: false,
                    fireExtinguisher: false,
                    cctv: false,
                    electronicLock: false,

                    smoking: false,
                    pets: false,
                    coupleFriendly: false,
                    localIdAccepted: false,
                    refundable: false,
                    instantBooking: false,

                    bookingStatus: "Available",
                });

                setImages([]);
                navigate(-1); 
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            style={styles.container}
            onSubmit={handleSubmit}
        >
            <h1>Add New Room</h1>

            {/* HOTEL */}

            <div style={styles.formGroup}>
                <label>Select Hotel</label>

                <select
                    name="hotel"
                    value={roomData.hotel}
                    onChange={handleChange}
                    style={styles.input}
                >
                    <option value="">Choose Hotel</option>

                    {hotels.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                            {hotel.hotelName}
                        </option>
                    ))}
                </select>
            </div>

            {/* BASIC DETAILS */}

            <h2>Basic Details</h2>

            <div style={styles.grid}>
                <div>
                    <label>Room Name</label>

                    <input
                        type="text"
                        name="roomName"
                        value={roomData.roomName}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Room Number</label>

                    <input
                        type="text"
                        name="roomNumber"
                        value={roomData.roomNumber}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Floor</label>

                    <input
                        type="number"
                        name="floor"
                        value={roomData.floor}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Room Type</label>

                    <select
                        name="roomType"
                        value={roomData.roomType}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">Select</option>

                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Twin">Twin</option>
                        <option value="Queen">Queen</option>
                        <option value="King">King</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Family">Family</option>
                        <option value="Executive">Executive</option>
                        <option value="Presidential">Presidential</option>
                    </select>
                </div>

                <div>
                    <label>Room Size (sqft)</label>

                    <input
                        type="number"
                        name="roomSize"
                        value={roomData.roomSize}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Bed Type</label>

                    <select
                        name="bedType"
                        value={roomData.bedType}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">Select</option>

                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Queen">Queen</option>
                        <option value="King">King</option>
                        <option value="Twin">Twin</option>
                        <option value="Sofa">Sofa</option>
                    </select>
                </div>

                <div>
                    <label>Total Beds</label>

                    <input
                        type="number"
                        name="beds"
                        value={roomData.beds}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <label>Description</label>

                <textarea
                    rows={5}
                    name="description"
                    value={roomData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                />
            </div>

            {/* CAPACITY */}

            <h2 style={{ marginTop: 40 }}>Guest Capacity</h2>

            <div style={styles.grid}>
                <div>
                    <label>Adults</label>

                    <input
                        type="number"
                        name="adults"
                        value={roomData.adults}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Children</label>

                    <input
                        type="number"
                        name="children"
                        value={roomData.children}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Maximum Guests</label>

                    <input
                        type="number"
                        name="maxGuests"
                        value={roomData.maxGuests}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
            </div>

            {/* PRICING */}

            <h2 style={{ marginTop: 40 }}>Pricing</h2>

            <div style={styles.grid}>
                <div>
                    <label>Room Price</label>

                    <input
                        type="number"
                        name="price"
                        value={roomData.price}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Discount (%)</label>

                    <input
                        type="number"
                        name="discount"
                        value={roomData.discount}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Tax (%)</label>

                    <input
                        type="number"
                        name="tax"
                        value={roomData.tax}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Weekend Price</label>

                    <input
                        type="number"
                        name="weekendPrice"
                        value={roomData.weekendPrice}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Festival Price</label>

                    <input
                        type="number"
                        name="festivalPrice"
                        value={roomData.festivalPrice}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div>
                    <label>Extra Bed Price</label>

                    <input
                        type="number"
                        name="extraBedPrice"
                        value={roomData.extraBedPrice}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <h2 style={{ marginTop: 40 }}>Amenities</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="wifi" checked={roomData.wifi} onChange={handleCheckbox} /> WiFi</label>

                    <label><input type="checkbox" name="ac" checked={roomData.ac} onChange={handleCheckbox} /> AC</label>

                    <label><input type="checkbox" name="heater" checked={roomData.heater} onChange={handleCheckbox} /> Heater</label>

                    <label><input type="checkbox" name="fan" checked={roomData.fan} onChange={handleCheckbox} /> Fan</label>

                    <label><input type="checkbox" name="smartTV" checked={roomData.smartTV} onChange={handleCheckbox} /> Smart TV</label>

                    <label><input type="checkbox" name="ott" checked={roomData.ott} onChange={handleCheckbox} /> OTT</label>

                    <label><input type="checkbox" name="telephone" checked={roomData.telephone} onChange={handleCheckbox} /> Telephone</label>

                    <label><input type="checkbox" name="refrigerator" checked={roomData.refrigerator} onChange={handleCheckbox} /> Refrigerator</label>

                    <label><input type="checkbox" name="microwave" checked={roomData.microwave} onChange={handleCheckbox} /> Microwave</label>

                    <label><input type="checkbox" name="kettle" checked={roomData.kettle} onChange={handleCheckbox} /> Kettle</label>

                    <label><input type="checkbox" name="coffeeMachine" checked={roomData.coffeeMachine} onChange={handleCheckbox} /> Coffee Machine</label>

                    <label><input type="checkbox" name="wardrobe" checked={roomData.wardrobe} onChange={handleCheckbox} /> Wardrobe</label>

                    <label><input type="checkbox" name="workDesk" checked={roomData.workDesk} onChange={handleCheckbox} /> Work Desk</label>

                    <label><input type="checkbox" name="sofa" checked={roomData.sofa} onChange={handleCheckbox} /> Sofa</label>

                    <label><input type="checkbox" name="diningTable" checked={roomData.diningTable} onChange={handleCheckbox} /> Dining Table</label>

                    <label><input type="checkbox" name="iron" checked={roomData.iron} onChange={handleCheckbox} /> Iron</label>

                    <label><input type="checkbox" name="locker" checked={roomData.locker} onChange={handleCheckbox} /> Locker</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Bathroom</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="attachedBathroom" checked={roomData.attachedBathroom} onChange={handleCheckbox} /> Attached Bathroom</label>

                    <label><input type="checkbox" name="bathtub" checked={roomData.bathtub} onChange={handleCheckbox} /> Bathtub</label>

                    <label><input type="checkbox" name="shower" checked={roomData.shower} onChange={handleCheckbox} /> Shower</label>

                    <label><input type="checkbox" name="hotWater" checked={roomData.hotWater} onChange={handleCheckbox} /> Hot Water</label>

                    <label><input type="checkbox" name="toiletries" checked={roomData.toiletries} onChange={handleCheckbox} /> Toiletries</label>

                    <label><input type="checkbox" name="hairDryer" checked={roomData.hairDryer} onChange={handleCheckbox} /> Hair Dryer</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Meals</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="breakfast" checked={roomData.breakfast} onChange={handleCheckbox} /> Breakfast</label>

                    <label><input type="checkbox" name="lunch" checked={roomData.lunch} onChange={handleCheckbox} /> Lunch</label>

                    <label><input type="checkbox" name="dinner" checked={roomData.dinner} onChange={handleCheckbox} /> Dinner</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Services</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="roomService" checked={roomData.roomService} onChange={handleCheckbox} /> Room Service</label>

                    <label><input type="checkbox" name="laundry" checked={roomData.laundry} onChange={handleCheckbox} /> Laundry</label>

                    <label><input type="checkbox" name="housekeeping" checked={roomData.housekeeping} onChange={handleCheckbox} /> Housekeeping</label>

                    <label><input type="checkbox" name="wakeupCall" checked={roomData.wakeupCall} onChange={handleCheckbox} /> Wakeup Call</label>

                    <label><input type="checkbox" name="newspaper" checked={roomData.newspaper} onChange={handleCheckbox} /> Newspaper</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Hotel Facilities</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="parking" checked={roomData.parking} onChange={handleCheckbox} /> Parking</label>

                    <label><input type="checkbox" name="swimmingPool" checked={roomData.swimmingPool} onChange={handleCheckbox} /> Swimming Pool</label>

                    <label><input type="checkbox" name="gym" checked={roomData.gym} onChange={handleCheckbox} /> Gym</label>

                    <label><input type="checkbox" name="spa" checked={roomData.spa} onChange={handleCheckbox} /> Spa</label>

                    <label><input type="checkbox" name="restaurant" checked={roomData.restaurant} onChange={handleCheckbox} /> Restaurant</label>

                    <label><input type="checkbox" name="bar" checked={roomData.bar} onChange={handleCheckbox} /> Bar</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Policies</h2>

                <div style={styles.checkboxGrid}>

                    <label><input type="checkbox" name="smoking" checked={roomData.smoking} onChange={handleCheckbox} /> Smoking Allowed</label>

                    <label><input type="checkbox" name="pets" checked={roomData.pets} onChange={handleCheckbox} /> Pets Allowed</label>

                    <label><input type="checkbox" name="coupleFriendly" checked={roomData.coupleFriendly} onChange={handleCheckbox} /> Couple Friendly</label>

                    <label><input type="checkbox" name="localIdAccepted" checked={roomData.localIdAccepted} onChange={handleCheckbox} /> Local ID Accepted</label>

                    <label><input type="checkbox" name="refundable" checked={roomData.refundable} onChange={handleCheckbox} /> Refundable</label>

                    <label><input type="checkbox" name="instantBooking" checked={roomData.instantBooking} onChange={handleCheckbox} /> Instant Booking</label>

                </div>

                <h2 style={{ marginTop: 40 }}>Booking Status</h2>

                <select
                    name="bookingStatus"
                    value={roomData.bookingStatus}
                    onChange={handleChange}
                    style={styles.input}
                >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                </select>

                <h2 style={{ marginTop: 40 }}>Room Images</h2>

                <input
                    type="file"
                    multiple
                    onChange={handleImages}
                />



                <div
                    style={{
                        marginTop: 40,
                        textAlign: "center",
                    }}
                >
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "12px 35px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                    >
                        {loading ? "Adding Room..." : "Add Room"}
                    </button>
                </div>
            </div>
        </form>

    )
};

const styles = {
    container: {
        width: "90%",
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "25px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    },

    checkboxGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "12px",
        marginTop: "15px",
    },

    formGroup: {
        marginBottom: "20px",
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
        gap: "20px",
    },

    input: {
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },

    textarea: {
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
};

export default EditRoom;