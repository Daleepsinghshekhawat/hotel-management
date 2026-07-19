import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import AdminLayout from "./Admin/AdminLayout";
import Dashboard from "./Admin/Dashboard";
import AddHotel from "./Admin/AddHotel";
import Hotels from "./Admin/Hotels";
import AdminUsersAndOwners from "./Admin/AdminUsersAndOwners";
import User from "./User";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";
import SuperAdmin from "./SuperAdmin/SuperAdmin";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import HotelRequests from "./SuperAdmin/HotelRequests";
import AdminRequests from "./SuperAdmin/AdminRequests";
import AddHotelDirect from "./SuperAdmin/AddHotelDirect";
import UsersAndAdmins from "./SuperAdmin/UsersAndAdmins";
import AdminRequestForm from "./AdminRequestForm";

import HotelLayout from "./hotel/HotelLayout";
import HotelDashboard from "./hotel/HotelDashboard";

import AddRoom from "./admin/AddRoom";
import EditRoom from "./admin/EditRoom";
import RoomDetails from "./admin/RoomDetails";

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
        </Route>

        <Route path="/user" element={<User />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/superadmin" element={<SuperAdmin />}>
          <Route index element={<Navigate to="admin-requests" replace />} />
          <Route path="state" element={<State />} />
          <Route path="district" element={<District />} />
          <Route path="city" element={<City />} />
          <Route path="hotel-requests" element={<HotelRequests />} />
          <Route path="admin-requests" element={<AdminRequests />} />
          <Route path="add-hotel" element={<AddHotelDirect />} />
          <Route path="users-admins" element={<UsersAndAdmins />} />
        </Route>
        <Route path="/become-admin" element={<AdminRequestForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
