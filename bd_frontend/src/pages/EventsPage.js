import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Determine if an event is upcoming or past
  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
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
            {events.map((event) => (
              <Col md={6} lg={4} key={event._id}>
                <Card className="h-100 border-0 shadow-sm hover-effect overflow-hidden rounded-3">
                  {/* Event Image */}
                  <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
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
                  </div>
                  
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={isUpcoming(event.Date) ? "success" : "secondary"} className="mb-2 px-3 py-2 rounded-pill">
                        {isUpcoming(event.Date) ? "Upcoming" : "Completed"}
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
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default EventsPage;
