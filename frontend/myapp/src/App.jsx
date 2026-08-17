import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";
import ProtectedRoute from "./ProtectedRoute";





import AdminLayout from "./Admin/AdminLayout";
import Dashboard from "./Admin/Dashboard";
import AddHotel from "./Admin/AddHotel";
import Hotels from "./Admin/Hotels";
import AdminUsersAndOwners from "./Admin/AdminUsersAndOwners";


import AddRoom from "./Admin/AddRoom";
import EditRoom from "./Admin/EditRoom";
import RoomDetails from "./Admin/RoomDetails";
import AdminCoupons from "./Admin/Coupons";






import SuperAdmin from "./SuperAdmin/SuperAdmin";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import HotelRequests from "./SuperAdmin/HotelRequests";
import AdminRequests from "./SuperAdmin/AdminRequests";
import AddHotelDirect from "./SuperAdmin/AddHotelDirect";
import ApprovedHotels from "./SuperAdmin/ApprovedHotels";
import AdminRequestForm from "./AdminRequestForm";
import AllAdmins from "./SuperAdmin/AllAdmins";
import AddAdmin from "./SuperAdmin/AddAdmin";
import EditHotel from"./SuperAdmin/EditHotel";
import Setting from "./SuperAdmin/Settings";
import Sidebar from "./SuperAdmin/Sidebar";
import Coupons from "./SuperAdmin/Coupons";
import Reviews from "./SuperAdmin/Reviews";






import HotelLayout from "./hotel/HotelLayout";
import HotelDashboard from "./hotel/HotelDashboard";
import HotelActiveBooking from "./hotel/HotelActiveBookings";
import HotelBookingHistory from "./hotel/HotelBookingHistory";
import HotelSidebar from "./hotel/HotelSidebar";
import HotelDetailFull from "./hotel/HotelDetailFull";



// User-facing pages
import UserLayout from "./User/UserLayout";
import UserHome from "./User/UserHome";
import HotelsListing from "./User/HotelsListing";
import HotelDetail from "./User/HotelDetail";
import AboutUs from "./User/AboutUs";
import UserAccountLayout from "./User/UserAccountLayout";
import UserActiveBookings from "./User/UserActiveBookings";
import UserBookingHistory from "./User/UserBookingHistory";
import RoomDetail from "./User/RoomDetail";
import EditOneHotel from"./SuperAdmin/EditHotel";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/adminpage" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-hotel" element={<AddHotel />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="hotel-detail/:id" element={<HotelDetailFull />} />
            <Route path="hotels/edit/:id" element={<EditHotel/>}/>
            <Route path="bookings" element={<HotelActiveBooking/>}/>
            <Route path="booking-history" element={<HotelBookingHistory/>}/>
            
            {/* Room Routes */}
            <Route path="add-room" element={<AddRoom />} />
            <Route path="edit-room/:id" element={<EditRoom />} />
            <Route path="room/:id" element={<RoomDetails />} />
            <Route path="users-owners" element={<AdminUsersAndOwners />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["hotelOwner"]} />}>
          <Route path="/hotel" element={<HotelLayout />}>
            <Route index element={<HotelDashboard />} />
            <Route path="add-hotel" element={<AddHotel />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="hotel-detail/:id" element={<HotelDetailFull />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="edit-room/:id" element={<EditRoom />} />
            <Route path="room/:id" element={<RoomDetails />} />
            <Route path="hotelsidebar" element={<HotelSidebar />} />
            <Route path="bookings" element={<HotelActiveBooking />} />
            <Route path="booking-history" element={<HotelBookingHistory />} />
            <Route path="edit/:id" from element={<EditOneHotel/>}/>
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
        </Route>

        {/* User routes — wrapped in UserLayout (navbar + footer) */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="hotels" element={<HotelsListing />} />
          <Route path="hotel/:id" element={<HotelDetail />} />
          <Route path="hotel/:hotelId/room/:roomId" element={<RoomDetail />} />
          
          <Route element={<ProtectedRoute allowedRoles={["user", "admin", "superadmin", "hotelOwner"]} />}>
            <Route path="account" element={<UserAccountLayout />}>
              <Route path="bookings" element={<UserActiveBookings />} />
              <Route path="history" element={<UserBookingHistory />} />
            </Route>
          </Route>
        </Route>

        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path="/superadmin" element={<SuperAdmin />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="state" element={<State />} />
            <Route path="district" element={<District />} />
            <Route path="city" element={<City />} />
            <Route path="hotel-requests" element={<HotelRequests />} />
            <Route path="admins/requests" element={<AdminRequests />} />
            <Route path="approved" element={<ApprovedHotels/>}/>
            <Route path="add-hotel" element={<AddHotelDirect />} />
            <Route path="all-admins" element={<AllAdmins/>}/>
            <Route path="admins/add" element={<AddAdmin />} />
            <Route path="admins/requests" element={<AdminRequests />} />
            <Route path="admins/all" element={<AllAdmins />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="hotels/edit/:id" element={<EditHotel/>}/>
            <Route path="sidebar" element={<Sidebar/>}/>
            <Route path="settings" element={<Setting/>}/>
          </Route>
        </Route>

        <Route path="/become-admin" element={<AdminRequestForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

