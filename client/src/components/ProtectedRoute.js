import { message } from "antd";
import React, { useEffect, useState } from "react";
import { GetCurrentUser } from "../apicalls/users";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice";
import { HideLoading, ShowLoading } from "../redux/loadersSlice";
import { VerifyPayment } from "../apicalls/bookings";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const getCurrentUser = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetCurrentUser();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        dispatch(SetUser(null));
        message.error(response.message);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      dispatch(HideLoading());
      dispatch(SetUser(null));
      message.error(error.message);
    }
  };

  const verifyPaymentAndSaveBooking = async (sessionId) => {
    try {
      dispatch(ShowLoading());
      const response = await VerifyPayment({ sessionId });
      dispatch(HideLoading());
      
      if (response.success) {
        message.success("Payment verified and booking saved successfully!");
        // Remove session_id from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getCurrentUser();

      // Check for session_id in URL and verify payment
      const queryParams = new URLSearchParams(location.search);
      const sessionId = queryParams.get("session_id");
      if (sessionId) {
        verifyPaymentAndSaveBooking(sessionId);
      }
    } else {
      navigate("/login");
    }
  }, [location]);

  if (!user) {
    return null;
  }

  return (
    <div className="layout p-1">
      <div className="header bg-primary flex justify-between p-2">
        <div>
          <h1 className="text-2xl text-white cursor-pointer"
            onClick={() => navigate("/")}
          >SHOWTIME EXPRESS</h1>
        </div>

        <div className="bg-white p-1 flex gap-1">
          <i className="ri-shield-user-line text-primary"></i>
          <h1
            className="text-sm underline"
            onClick={() => {
              if (user.isAdmin) {
                navigate("/admin");
              } else {
                navigate("/profile");
              }
            }}
          >
            {user.name}
          </h1>

          <i
            className="ri-logout-box-r-line ml-2"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          ></i>
        </div>
      </div>
      <div className="content mt-1 p-1">{children}</div>
    </div>
  );
}

export default ProtectedRoute;