import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { clearStoredSelectedEvent, getStoredSelectedEvent, storeSelectedEvent } from '../utils/selectedEvent';

const Register = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(() => getStoredSelectedEvent()?._id || '');
  const [formData, setFormData] = useState({
    RollNumber: '',
    PhoneNumber: '',
    EventDate: getStoredSelectedEvent()?.EventDate || '',
    SelectedEventId: getStoredSelectedEvent()?._id || '',
    SelectedEventName: getStoredSelectedEvent()?.EventName || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        const eventList = response.data || [];
        setEvents(eventList);

        const storedSelection = getStoredSelectedEvent();
        if (storedSelection?._id) {
          const matchingEvent = eventList.find((event) => event._id === storedSelection._id);
          if (matchingEvent) {
            setSelectedEventId(matchingEvent._id);
            setFormData((prev) => ({
              ...prev,
              EventDate: new Date(matchingEvent.Date).toISOString().split('T')[0],
              SelectedEventId: matchingEvent._id,
              SelectedEventName: matchingEvent.EventName,
            }));
          } else {
            clearStoredSelectedEvent();
            setSelectedEventId('');
          }
        }
      } catch (error) {
        console.error('Error fetching events for registration:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'SelectedEvent') {
      const selectedEvent = events.find((event) => event._id === value);
      setSelectedEventId(value);

      if (selectedEvent) {
        const eventSelection = {
          _id: selectedEvent._id,
          EventName: selectedEvent.EventName,
          EventDate: new Date(selectedEvent.Date).toISOString().split('T')[0],
        };

        storeSelectedEvent(eventSelection);
        setFormData({
          ...formData,
          EventDate: eventSelection.EventDate,
          SelectedEventId: eventSelection._id,
          SelectedEventName: eventSelection.EventName,
        });
      } else {
        clearStoredSelectedEvent();
        setFormData({
          ...formData,
          EventDate: '',
          SelectedEventId: '',
          SelectedEventName: '',
        });
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.RollNumber || !formData.PhoneNumber || !formData.EventDate) {
      toast.warning('Please fill in all fields.');
      return;
    }

    if (formData.PhoneNumber.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        RollNumber: formData.RollNumber,
        PhoneNumber: formData.PhoneNumber,
        EventDate: formData.EventDate,
        SelectedEventId: formData.SelectedEventId,
        SelectedEventName: formData.SelectedEventName,
      };

      const response = await axios.post(`${API_BASE_URL}/register`, payload);
      
      if (response.status === 200 || response.status === 201) {
        if (response.data.message === 'Student already exists' || response.data === 'Student is already registered for this event date') {
          toast.info('You are already registered for this event!');
        } else {
          toast.success('Registration successful! Thank you for volunteering to save lives.');
          // Reset form after successful registration
          setFormData({
            RollNumber: '',
            PhoneNumber: '',
            EventDate: getStoredSelectedEvent()?.EventDate || '',
            SelectedEventId: getStoredSelectedEvent()?._id || '',
            SelectedEventName: getStoredSelectedEvent()?.EventName || '',
          });
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (error) {
      console.error('Registration Error:', error);
      toast.error('Registration failed. Please try again or check your Roll Number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-lg mt-5">
            <Card.Header className="bg-danger text-white text-center py-4 rounded-top">
              <h3 className="mb-0 fw-bold">Donor Registration</h3>
              <p className="mb-0 mt-2 text-white-50">Join the life-saving mission today.</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formRollNumber">
                  <Form.Label className="fw-semibold">Roll Number</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter your university roll number" 
                    name="RollNumber"
                    value={formData.RollNumber}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPhoneNumber">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    placeholder="Enter your 10-digit mobile number" 
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={handleChange}
                    className="py-2"
                    maxLength="10"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-5" controlId="formEventDate">
                  <Form.Label className="fw-semibold">Select Event</Form.Label>
                  <Form.Select
                    name="SelectedEvent"
                    value={selectedEventId}
                    onChange={handleChange}
                    className="py-2 mb-3"
                    disabled={eventsLoading}
                  >
                    <option value="">Choose an event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.EventName} - {new Date(event.Date).toLocaleDateString()}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Label className="fw-semibold">Select Event Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="EventDate"
                    value={formData.EventDate}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                  <Form.Text className="text-muted">
                    The selected event stays as the default for the next registration until you change it.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="danger" 
                    type="submit" 
                    size="lg" 
                    className="fw-bold py-2 rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Now'}
                  </Button>
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/')} 
                    className="fw-semibold py-2 rounded-pill mt-2 text-muted"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
