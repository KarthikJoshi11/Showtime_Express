import React, { useEffect } from "react";
import { Col, message, Row } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetAllMovies, GetMovieById } from "../../apicalls/movies";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { GetAllTheatresByMovie } from "../../apicalls/theatres";
import "../../stylesheets/common.css";

function TheatresForMovie() {
  // get date from query string or use today's date
  const tempDate = new URLSearchParams(window.location.search).get("date");
  const [date, setDate] = React.useState(
    tempDate || moment().format("YYYY-MM-DD")
  );

  const [movie, setMovie] = React.useState(null);
  const [theatres, setTheatres] = React.useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetMovieById(params.id);
      if (response.success) {
        setMovie(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getTheatres = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllTheatresByMovie({ date, movie: params.id });
      if (response.success) {
        setTheatres(response.data);
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

  useEffect(() => {
    getTheatres();
  }, [date]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    navigate(`/movie/${params.id}?date=${newDate}`);
  };

  if (!movie) {
    return null;
  }

  return (
    <div className="content">
      {/* movie information */}
      <div className="card mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl uppercase">
              {movie.title} ({movie.language})
            </h1>
            <div className="mt-2">
              <div className="text-md">
                <i className="ri-time-line mr-2"></i>
                Duration: {movie.duration} mins
              </div>
              <div className="text-md">
                <i className="ri-calendar-line mr-2"></i>
                Release Date: {moment(movie.releaseDate).format("MMM Do YYYY")}
              </div>
              <div className="text-md">
                <i className="ri-movie-line mr-2"></i>
                Genre: {movie.genre}
              </div>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-md mb-2">Select Date</h1>
            <input
              type="date"
              min={moment().format("YYYY-MM-DD")}
              value={date}
              onChange={handleDateChange}
              className="ant-input"
            />
          </div>
        </div>
      </div>

      {/* movie theatres */}
      <div className="mt-2">
        <h1 className="text-xl uppercase mb-2">Available Theatres</h1>
        {theatres.length === 0 ? (
          <div className="card text-center">
            <p className="text-md">No shows available for this date</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {theatres.map((theatre) => (
              <div className="card" key={theatre._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl uppercase">{theatre.name}</h1>
                    <div className="text-sm mt-1">
                      <i className="ri-map-pin-line mr-2"></i>
                      {theatre.address}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {theatre.shows.map((show) => (
                      <div
                        key={show._id}
                        className="card p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          navigate(`/book-show/${show._id}`);
                        }}
                      >
                        <h1 className="text-md">
                          {moment(show.time, "HH:mm").format("hh:mm A")}
                        </h1>
                        <div className="text-sm text-primary">
                          ₹{show.ticketPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TheatresForMovie;
