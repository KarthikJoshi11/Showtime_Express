import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message, Row, Col, Empty } from "antd";
import { GetBookingsOfUser } from "../../apicalls/bookings";
import moment from "moment";
import "../../stylesheets/common.css";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookingsOfUser();
      if (response.success) {
        setBookings(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const calculateTotalPrice = (booking) => {
    if (!booking.show || !booking.seats || !booking.show.tierPrices) return 0;
    
    return booking.seats.reduce((total, seatNumber) => {
      const seatConfig = booking.show.seatConfiguration;
      let tier = 'economy';
      
      if (seatNumber >= seatConfig.premium.start && seatNumber <= seatConfig.premium.end) {
        tier = 'premium';
      } else if (seatNumber >= seatConfig.middle.start && seatNumber <= seatConfig.middle.end) {
        tier = 'middle';
      }
      
      return total + (booking.show.tierPrices[tier] || 0);
    }, 0);
  };

  if (bookings.length === 0) {
    return (
      <div className="content">
        <div className="card">
          <Empty
            description="No bookings found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "48px 0" }}
          >
            <Button
              title="Book Tickets"
              onClick={() => navigate("/")}
            />
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <h1 className="text-2xl mb-2">My Bookings</h1>
      <Row gutter={[16, 16]}>
        {bookings.map((booking) => (
          <Col xs={24} sm={12} lg={8} key={booking._id}>
            <div className="card booking-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-xl mb-2">
                    {booking.show.movie.title}
                    <span className="text-sm ml-2">({booking.show.movie.language})</span>
                  </h1>
                  <div className="divider"></div>
                  <div className="text-sm mb-2">
                    <i className="ri-building-line mr-2"></i>
                    {booking.show.theatre.name}
                  </div>
                  <div className="text-sm mb-2">
                    <i className="ri-map-pin-line mr-2"></i>
                    {booking.show.theatre.address}
                  </div>
                  <div className="text-sm mb-2">
                    <i className="ri-calendar-line mr-2"></i>
                    {moment(booking.show.date).format("MMM Do YYYY")} -{" "}
                    {moment(booking.show.time, "HH:mm").format("hh:mm A")}
                  </div>
                  <div className="text-sm mb-2">
                    <i className="ri-money-dollar-circle-line mr-2"></i>
                    Amount: ₹{calculateTotalPrice(booking)}
                  </div>
                  <div className="text-sm">
                    <i className="ri-ticket-line mr-2"></i>
                    Booking ID: {booking._id}
                  </div>
                </div>
                <div className="text-right">
                  <img
                    src={booking.show.movie.poster}
                    alt={booking.show.movie.title}
                    className="booking-poster"
                  />
                  <div className="text-sm mt-2">
                    <i className="ri-seat-line mr-2"></i>
                    Seats: {booking.seats.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Bookings;
