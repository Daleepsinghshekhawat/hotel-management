import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import Admin from "./Admin";
import User from "./User";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";
import SuperAdmin from "./SuperAdmin/SuperAdmin";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import HotelRequests from "./SuperAdmin/HotelRequests";
import HotelListingForm from "./HotelListingForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user" element={<User />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/list-hotel" element={<HotelListingForm />} />
        <Route path="/superadmin" element={<SuperAdmin />}>
          <Route path="state" element={<State />} />
          <Route path="district" element={<District />} />
          <Route path="city" element={<City />} />
          <Route path="hotel-requests" element={<HotelRequests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
