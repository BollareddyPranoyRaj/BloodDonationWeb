import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const statusThemes = {
  donated: {
    emoji: '🎉',
    title: 'You Donated!',
    subtitle: 'You stepped up and made a real difference.',
    chip: 'Donation Confirmed',
    chipClass: 'status-check-chip status-check-chip--success',
    shellClass: 'status-check-shell status-check-shell--success',
    confettiClass: 'status-confetti status-confetti--success',
  },
  registered: {
    emoji: '🩸',
    title: 'You Are Registered',
    subtitle: 'Your name is in the camp list, but donation is not confirmed yet.',
    chip: 'Registered, Not Donated',
    chipClass: 'status-check-chip status-check-chip--pending',
    shellClass: 'status-check-shell status-check-shell--pending',
    confettiClass: 'status-confetti status-confetti--pending',
  },
  'not-registered': {
    emoji: '🙂',
    title: 'No Registration Found',
    subtitle: 'We could not find this roll number in the blood donation records yet.',
    chip: 'Not Registered',
    chipClass: 'status-check-chip status-check-chip--neutral',
    shellClass: 'status-check-shell status-check-shell--neutral',
    confettiClass: 'status-confetti status-confetti--neutral',
  },
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Not available';
  }

  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const CheckStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedEvent = location.state?.event || null;
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const theme = useMemo(() => {
    if (!result) {
      return null;
    }

    return statusThemes[result.status] || statusThemes['not-registered'];
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rollNumber.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/registrations/status/${encodeURIComponent(rollNumber.trim())}`
      );
      setResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setResult(error.response.data);
      } else {
        setResult({
          status: 'not-registered',
          message: 'We could not check your status right now. Please try again in a moment.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-check-page py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg overflow-hidden status-check-card">
              <Card.Body className="p-0">
                <div className="status-check-hero">
                  <div className="status-check-hero-copy">
                    <p className="status-check-kicker mb-2">Check My Blood Donation Status</p>
                    <h1 className="fw-bold mb-3">Find your camp record in seconds</h1>
                    <p className="status-check-lead mb-0">
                      Enter your roll number to see whether you donated, registered, or have not been added yet.
                    </p>
                    {selectedEvent ? (
                      <Badge bg="light" text="dark" className="mt-3 px-3 py-2 rounded-pill">
                        From Camps Page: {selectedEvent.EventName}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="status-check-hero-art" aria-hidden="true">
                    <span>🩸</span>
                    <span>✨</span>
                    <span>🏥</span>
                  </div>
                </div>

                <div className="p-4 p-md-5">
                  <Form onSubmit={handleSubmit} className="status-check-form">
                    <Row className="g-3 align-items-end">
                      <Col md={8}>
                        <Form.Group controlId="rollNumber">
                          <Form.Label className="fw-semibold">Roll Number</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your college roll number"
                            value={rollNumber}
                            onChange={(event) => setRollNumber(event.target.value.toUpperCase())}
                            className="status-check-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Button
                          type="submit"
                          variant="danger"
                          className="w-100 rounded-pill fw-semibold py-2 status-check-submit"
                          disabled={loading || !rollNumber.trim()}
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Checking
                            </>
                          ) : (
                            'Check My Status'
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Form>

                  {result ? (
                    <motion.div
                      key={result.status}
                      initial={{ opacity: 0, y: 18, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className={theme.shellClass}
                    >
                      <div className={theme.confettiClass} aria-hidden="true">
                        {Array.from({ length: 18 }).map((_, index) => (
                          <span key={index} />
                        ))}
                      </div>

                      <div className="status-check-result-copy">
                        <div className="status-check-result-emoji">{theme.emoji}</div>
                        <Badge className={theme.chipClass}>{theme.chip}</Badge>
                        <h2 className="fw-bold mt-3 mb-2">{theme.title}</h2>
                        <p className="status-check-result-subtitle mb-4">{theme.subtitle}</p>

                        {result.found && result.donor ? (
                          <div className="status-check-details">
                            <div>
                              <span className="status-check-detail-label">Donor</span>
                              <strong>{result.donor.studentname}</strong>
                            </div>
                            <div>
                              <span className="status-check-detail-label">Roll Number</span>
                              <strong>{result.donor.rollno}</strong>
                            </div>
                            <div>
                              <span className="status-check-detail-label">Event</span>
                              <strong>{result.donor.eventName}</strong>
                            </div>
                            <div>
                              <span className="status-check-detail-label">Event Date</span>
                              <strong>{formatDate(result.donor.eventDate)}</strong>
                            </div>
                          </div>
                        ) : null}

                        <p className="status-check-message mt-4 mb-0">{result.message}</p>

                        <div className="d-flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline-dark"
                            className="rounded-pill px-4"
                            onClick={() => navigate('/events')}
                          >
                            Back to Camps
                          </Button>
                          {!result.found ? (
                            <Button
                              variant="danger"
                              className="rounded-pill px-4"
                              onClick={() => navigate('/register')}
                            >
                              Register Now
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CheckStatus;
