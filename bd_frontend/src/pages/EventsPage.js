import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';
import { getStoredSelectedEvent, storeSelectedEvent } from '../utils/selectedEvent';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(() => getStoredSelectedEvent()?._id || '');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine whether an event is upcoming, today, or completed
  const getEventStatus = (dateString) => {
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return { label: 'Today', badge: 'warning' };
    }

    if (eventDate > today) {
      return { label: 'Upcoming', badge: 'success' };
    }

    return { label: 'Completed', badge: 'secondary' };
  };

  const handleSelectEvent = (event) => {
    const selectedEvent = {
      _id: event._id,
      EventName: event.EventName,
      EventDate: new Date(event.Date).toISOString().split('T')[0],
    };

    setSelectedEventId(event._id);
    storeSelectedEvent(selectedEvent);
  };

  const handleCheckStatus = (event) => {
    handleSelectEvent(event);
    navigate('/check-status', {
      state: {
        event: {
          _id: event._id,
          EventName: event.EventName,
          EventDate: new Date(event.Date).toISOString().split('T')[0],
        },
      },
    });
  };

  return (
    <div className="events-page bg-light min-vh-100 pb-5">
      <div className="bg-danger text-white py-5 mb-5 shadow-sm text-center">
        <Container>
          <h1 className="fw-bold mb-3">Blood Donation Camps</h1>
          <p className="lead mb-0 text-white-75">
            Discover our upcoming and past blood donation drives across all campuses.
          </p>
        </Container>
      </div>

      <Container>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-3 text-muted">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>No events found.</h4>
            <p>Please check back later for upcoming blood donation drives.</p>
          </div>
        ) : (
          <Row className="g-4">
            {events.map((event) => {
              const status = getEventStatus(event.Date);
              const isSelected = selectedEventId === event._id;

              return (
              <Col md={6} lg={4} key={event._id}>
                <Card className={`h-100 border-0 shadow-sm hover-effect overflow-hidden rounded-3 event-select-card ${isSelected ? 'event-select-card--selected' : ''}`}>
                  {/* Event Image */}
                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                    {event.filename ? (
                      <Card.Img
                        variant="top" 
                        src={`${SERVER_BASE_URL}/Events/${event.filename}`} 
                        alt={event.EventName}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        No Image Available
                      </div>
                    )}

                    {isSelected ? (
                      <div className="event-selected-overlay">
                        Selected
                      </div>
                    ) : null}
                  </div>
                  
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={status.badge} className="mb-2 px-3 py-2 rounded-pill">
                        {status.label}
                      </Badge>
                      <small className="text-danger fw-bold">{formatDate(event.Date)}</small>
                    </div>
                    
                    <Card.Title className="fw-bold fs-4 mb-3">{event.EventName}</Card.Title>
                    
                    <div className="mt-auto">
                      <h6 className="text-muted fw-bold mb-2">Participating Colleges/Venues:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {event.Colleges && event.Colleges.length > 0 ? (
                          event.Colleges.map((college, idx) => (
                            <Badge bg="light" text="dark" className="border" key={idx}>
                              {typeof college === 'string' ? college : college.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted small">Venues to be announced</span>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-4">
                        <Button
                          variant={isSelected ? 'danger' : 'outline-danger'}
                          className="rounded-pill px-4 fw-semibold"
                          onClick={() => handleSelectEvent(event)}
                        >
                          {isSelected ? 'Selected' : 'Select Event'}
                        </Button>
                        <Button
                          variant="light"
                          className="rounded-pill px-4 border"
                          onClick={() => {
                            handleSelectEvent(event);
                            navigate('/register');
                          }}
                        >
                          Register Here
                        </Button>
                        <Button
                          variant="outline-primary"
                          className="rounded-pill px-4 fw-semibold"
                          onClick={() => handleCheckStatus(event)}
                        >
                          Check My Status
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )})}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default EventsPage;
