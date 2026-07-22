import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";






import AdminLayout from "./Admin/AdminLayout";
import Dashboard from "./Admin/Dashboard";
import AddHotel from "./Admin/AddHotel";
import Hotels from "./Admin/Hotels";
import AdminUsersAndOwners from "./Admin/AdminUsersAndOwners";


import AddRoom from "./admin/AddRoom";
import EditRoom from "./admin/EditRoom";
import RoomDetails from "./admin/RoomDetails";






import SuperAdmin from "./SuperAdmin/SuperAdmin";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import HotelRequests from "./SuperAdmin/HotelRequests";
import AdminRequests from "./SuperAdmin/AdminRequests";
import AddHotelDirect from "./SuperAdmin/AddHotelDirect";
import ApprovedHotels from "./SuperAdmin/ApprovedHotels";
import UsersAndAdmins from "./SuperAdmin/UsersAndAdmins";
import AdminRequestForm from "./AdminRequestForm";
import AllUsers from "./SuperAdmin/AllUsers";
import AllAdmins from "./SuperAdmin/AllAdmins";
import Bookings from "./SuperAdmin/Bookings";
import EditHotel from"./SuperAdmin/EditHotel";
import Setting from "./SuperAdmin/Settings";
import Sidebar from "./SuperAdmin/Sidebar";






import HotelLayout from "./hotel/HotelLayout";
import HotelDashboard from "./hotel/HotelDashboard";
import HotelActiveBooking from "./hotel/HotelActiveBookings";
import HotelBookingHistory from "./hotel/HotelBookingHistory";
import HotelSidebar from "./hotel/HotelSidebar";



// User-facing pages
import UserLayout from "./User/UserLayout";
import UserHome from "./User/UserHome";
import HotelsListing from "./User/HotelsListing";
import HotelDetail from "./User/HotelDetail";
import EditOneHotel from"./SuperAdmin/EditHotel";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/adminpage" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-hotel" element={<AddHotel />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="hotels/edit/:id" element={<EditHotel/>}/>
          <Route path="bookings" element={<HotelActiveBooking/>}/>
          <Route path="booking-history" element={<HotelBookingHistory/>}/>
          
          {/* Room Routes */}
          <Route path="add-room" element={<AddRoom />} />
          <Route path="edit-room/:id" element={<EditRoom />} />
          <Route path="room/:id" element={<RoomDetails />} />
          <Route path="users-owners" element={<AdminUsersAndOwners />} />
        </Route>

        <Route path="/hotel" element={<HotelLayout />}>
          <Route index element={<HotelDashboard />} />
          <Route path="add-hotel" element={<AddHotel />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="edit-room/:id" element={<EditRoom />} />
          <Route path="room/:id" element={<RoomDetails />} />
          <Route path="hotelsidebar" element={<HotelSidebar />} />
          <Route path="booking" element={<HotelActiveBooking />} />
          <Route path="booking-history" element={<HotelBookingHistory />} />
          <Route path="edit/:id" from element={<EditOneHotel/>}/>
        </Route>

        {/* User routes — wrapped in UserLayout (navbar + footer) */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="hotels" element={<HotelsListing />} />
          <Route path="hotel/:id" element={<HotelDetail />} />
        </Route>

        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route path="/superadmin" element={<SuperAdmin />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="state" element={<State />} />
          <Route path="district" element={<District />} />
          <Route path="city" element={<City />} />
          <Route path="hotel-requests" element={<HotelRequests />} />
          <Route path="admin-requests" element={<AdminRequests />} />
          <Route path="approved" element={<ApprovedHotels/>}/>
          <Route path="add-hotel" element={<AddHotelDirect />} />
          <Route path="users-admins" element={<UsersAndAdmins />} />
          <Route path="all-admins" element={<AllAdmins/>}/>
          <Route path="users" element = {<AllUsers/>}/>
          <Route path="bookings" element = {<bookings/>}/>
          <Route path="edit-hotel" element={<EditHotel/>}/>
          <Route path="sidebar" element={<Sidebar/>}/>
          <Route path="setting" element={<Setting/>}/>
        </Route>

        <Route path="/become-admin" element={<AdminRequestForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

