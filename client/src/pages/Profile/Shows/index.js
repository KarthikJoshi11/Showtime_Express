import { Col, Form, Modal, Row, Table, message } from "antd";
import React, { useEffect } from "react";
import Button from "../../../components/Button";
import { GetAllMovies } from "../../../apicalls/movies";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import {
  AddShow,
  DeleteShow,
  GetAllShowsByTheatre,
} from "../../../apicalls/theatres";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function Shows({ openShowsModal, setOpenShowsModal, theatre }) {
  const [view, setView] = React.useState("table");
  const [shows, setShows] = React.useState([]);
  const [movies, setMovies] = React.useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const moviesResponse = await GetAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message);
      }

      const showsResponse = await GetAllShowsByTheatre({
        theatreId: theatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
      } else {
        message.error(showsResponse.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const handleAddShow = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await AddShow({
        ...values,
        theatre: theatre._id,
      });
      if (response.success) {
        message.success(response.message);
        getData();
        setView("table");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteShow({ showId: id });

      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const columns = [
    {
      title: "Show Name",
      dataIndex: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => {
        return moment(text).format("MMM Do YYYY");
      },
    },
    {
      title: "Time",
      dataIndex: "time",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (text, record) => {
        return record.movie.title;
      },
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (text, record) => {
        return record.totalSeats - record.bookedSeats.length;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            {record.bookedSeats.length === 0 && (
              <i
                className="ri-delete-bin-line"
                onClick={() => {
                  handleDelete(record._id);
                }}
              ></i>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <Modal
      title=""
      open={openShowsModal}
      onCancel={() => setOpenShowsModal(false)}
      width={1400}
      footer={null}
    >
      <h1 className="text-primary text-md uppercase mb-1">
        Theatre : {theatre.name}
      </h1>
      <hr />

      <div className="flex justify-between mt-1 mb-1 items-center">
        <h1 className="text-md uppercase">
          {view === "table" ? "Shows" : "Add Show"}
        </h1>
        {view === "table" && (
          <Button
            variant="outlined"
            title="Add Show"
            onClick={() => {
              setView("form");
            }}
          />
        )}
      </div>

      {view === "table" && <Table columns={columns} dataSource={shows} />}

      {view === "form" && (
        <Form layout="vertical" onFinish={handleAddShow}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="Show Name"
                name="name"
                rules={[{ required: true, message: "Please input show name!" }]}
              >
                <input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Please input show date!" }, { validator: validateShowDate }]}
              >
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Time"
                name="time"
                rules={[{ required: true, message: "Please input show time!" }]}
              >
                <input type="time" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Movie"
                name="movie"
                rules={[{ required: true, message: "Please select movie!" }]}
              >
                <select>
                  <option value="">Select Movie</option>
                  {movies.map((movie) => (
                    <option value={movie._id}>{movie.title}</option>
                  ))}
                </select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Total Seats"
                name="totalSeats"
                rules={[{ required: true, message: "Please input total seats!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
          </Row>

          <div className="divider"></div>

          <h3 className="text-md mb-2">Tier Prices</h3>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="Economy Price"
                name={["tierPrices", "economy"]}
                rules={[{ required: true, message: "Please input economy price!" }]}
              >
                <input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Middle Price"
                name={["tierPrices", "middle"]}
                rules={[{ required: true, message: "Please input middle price!" }]}
              >
                <input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Premium Price"
                name={["tierPrices", "premium"]}
                rules={[{ required: true, message: "Please input premium price!" }]}
              >
                <input type="number" min="0" />
              </Form.Item>
            </Col>
          </Row>

          <div className="divider"></div>

          <h3 className="text-md mb-2">Seat Configuration</h3>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Economy Tier Start"
                name={["seatConfiguration", "economy", "start"]}
                rules={[{ required: true, message: "Please input start seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Economy Tier End"
                name={["seatConfiguration", "economy", "end"]}
                rules={[{ required: true, message: "Please input end seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Middle Tier Start"
                name={["seatConfiguration", "middle", "start"]}
                rules={[{ required: true, message: "Please input start seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Middle Tier End"
                name={["seatConfiguration", "middle", "end"]}
                rules={[{ required: true, message: "Please input end seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Premium Tier Start"
                name={["seatConfiguration", "premium", "start"]}
                rules={[{ required: true, message: "Please input start seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Premium Tier End"
                name={["seatConfiguration", "premium", "end"]}
                rules={[{ required: true, message: "Please input end seat!" }]}
              >
                <input type="number" min="1" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-1 mt-2">
            <Button
              variant="outlined"
              title="Cancel"
              onClick={() => setOpenShowsModal(false)}
            />
            <Button title="Add Show" type="submit" />
          </div>
        </Form>
      )}
    </Modal>
  );
}

const validateShowDate = async (rule, value) => {
  if (!value) {
    return Promise.reject("Please select a date");
  }
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return Promise.reject("Show date must be in the future");
  }
  return Promise.resolve();
};

export default Shows;
