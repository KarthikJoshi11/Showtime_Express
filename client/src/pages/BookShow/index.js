import { message } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { BookShowTickets, MakePayment } from "../../apicalls/bookings";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetShowById } from "../../apicalls/theatres";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { loadStripe } from "@stripe/stripe-js";
import Button from "../../components/Button";
import "../../stylesheets/BookShow.css";

const stripePromise = loadStripe("pk_test_51R7VHuPB7HtSM9irEyz5AHLLCg4Y1JwkFn2x10eIrDSfJf79WCzPS1Uvb1Sm43s6kaXHxZcpCZ4FWkEVxvpQMVvf00i58paHSq");

function BookShow() {
  const { user } = useSelector((state) => state.users);
  const [show, setShow] = React.useState(null);
  const [selectedSeats, setSelectedSeats] = React.useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetShowById({ showId: params.id });
      if (response.success) {
        setShow(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const toggleSeatSelection = (seatNumber, tier) => {
    setSelectedSeats((prevSelectedSeats) => {
      const isSelected = prevSelectedSeats.some(seat => seat.number === seatNumber);
      if (isSelected) {
        return prevSelectedSeats.filter(seat => seat.number !== seatNumber);
      } else {
        return [...prevSelectedSeats, { number: seatNumber, tier }];
      }
    });
  };

  const getSeats = () => {
    const totalSeats = show.totalSeats;
    const seatConfig = show.seatConfiguration;
    
    const renderTier = (start, end, tierName, tierClass) => {
      const rows = [];
      const seatsPerRow = 12;
      const totalRows = Math.ceil((end - start + 1) / seatsPerRow);
      
      for (let i = 0; i < totalRows; i++) {
        const rowStart = start + (i * seatsPerRow);
        const rowEnd = Math.min(rowStart + seatsPerRow - 1, end);
        const seats = rowEnd - rowStart + 1;
        const centered = seats < seatsPerRow;
        
        rows.push({
          start: rowStart,
          seats,
          centered
        });
      }

      return (
        <div className={`tier ${tierClass}`}>
          <h3>{tierName} - ₹{show.tierPrices[tierName.toLowerCase()]}</h3>
          <div className="seats-container">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`seat-row ${row.centered ? "centered" : ""}`}
              >
                {Array.from({ length: row.seats }).map((_, index) => {
                  const seatNumber = row.start + index;
                  if (seatNumber > totalSeats) return null;
                  let seatClass = "seat available";
                  if (selectedSeats.some(seat => seat.number === seatNumber)) seatClass = "seat selected";
                  if (show.bookedSeats.includes(seatNumber)) seatClass = "seat booked";

                  return (
                    <div
                      key={seatNumber}
                      className={seatClass}
                      onClick={() => {
                        if (!show.bookedSeats.includes(seatNumber)) {
                          toggleSeatSelection(seatNumber, tierName.toLowerCase());
                        }
                      }}
                    >
                      <div className="seat-number">{seatNumber}</div>
                      <div className="seat-price">₹{show.tierPrices[tierName.toLowerCase()]}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="theater-layout">
        <div className="screen-container">
          <div className="screen-curved">SCREEN</div>
        </div>
        {renderTier(seatConfig.economy.start, seatConfig.economy.end, "Economy", "economy-tier")}
        {renderTier(seatConfig.middle.start, seatConfig.middle.end, "Middle", "middle-tier")}
        {renderTier(seatConfig.premium.start, seatConfig.premium.end, "Premium", "premium-tier")}
      </div>
    );
  };

  const calculateTotalPrice = () => {
    if (!show || !selectedSeats.length) return 0;
    return selectedSeats.reduce((total, seat) => {
      const price = show.tierPrices[seat.tier];
      return total + (price || 0);
    }, 0);
  };

  const handlePayment = async () => {
    try {
      dispatch(ShowLoading());
      const response = await MakePayment({
        amount: calculateTotalPrice() * 100, // Amount in paise
        seats: selectedSeats.map(seat => seat.number),
        showId: params.id,
      });
      dispatch(HideLoading());

      if (response.success) {
        const stripe = await stripePromise;
        const { sessionId } = response.data;
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          message.error(error.message);
        }
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, [params.id]);

  return (
    show && (
      <div className="bookshow-container">
        <div className="show-info card">
          <div>
            <h1 className="text-sm">{show.theatre.name}</h1>
            <h1 className="text-sm">{show.theatre.address}</h1>
          </div>
          <div>
            <h1 className="text-2xl uppercase">
              {show.movie.title} ({show.movie.language})
            </h1>
          </div>
          <div>
            <h1 className="text-sm">
              {moment(show.date).format("MMM Do YYYY")} -{" "}
              {moment(show.time, "HH:mm").format("hh:mm A")}
            </h1>
          </div>
        </div>

        <div className="seats-section">
          {getSeats()}

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="seat economy"></div>
              <span>Economy - ₹{show.tierPrices.economy}</span>
            </div>
            <div className="legend-item">
              <div className="seat middle"></div>
              <span>Middle - ₹{show.tierPrices.middle}</span>
            </div>
            <div className="legend-item">
              <div className="seat premium"></div>
              <span>Premium - ₹{show.tierPrices.premium}</span>
            </div>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="booking-section">
            <div className="selected-info">
              <h1>
                <b>Selected Seats:</b> {selectedSeats.map(seat => seat.number).join(", ")}
              </h1>
              <h1>
                <b>Total Price:</b> ₹{calculateTotalPrice()}
              </h1>
              <div className="tier-prices mt-2">
                <div className="text-sm">
                  <span className="economy-price">Economy: ₹{show.tierPrices.economy}</span>
                </div>
                <div className="text-sm">
                  <span className="middle-price">Middle: ₹{show.tierPrices.middle}</span>
                </div>
                <div className="text-sm">
                  <span className="premium-price">Premium: ₹{show.tierPrices.premium}</span>
                </div>
              </div>
            </div>

            <Button title="Book Now" onClick={handlePayment} />
          </div>
        )}
      </div>
    )
  );
}

export default BookShow;