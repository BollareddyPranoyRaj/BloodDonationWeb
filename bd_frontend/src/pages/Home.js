import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="bg-danger text-white text-center py-5">
        <Container className="py-5">
          <h1 className="display-4 fw-bold mb-3">Give Blood, Save Lives</h1>
          <p className="lead mb-4">
            Join Aditya University's blood donation drive. Your single donation can save up to three lives and make a massive impact in our community.
          </p>
          <Link to="/register">
            <Button variant="light" size="lg" className="text-danger fw-bold px-5 py-3 rounded-pill shadow-sm">
              Register as a Donor Now
            </Button>
          </Link>
        </Container>
      </header>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="g-4 text-center">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm p-3 hover-effect">
                <Card.Body className="d-flex flex-column">
                  <h3 className="text-danger mb-3 fw-bold">Live Blood Camps</h3>
                  <p className="text-muted mb-4">Check out our ongoing and upcoming blood donation camps across all campuses.</p>
                  <div className="mt-auto">
                    <Link to="/events" className="btn btn-outline-danger rounded-pill px-4">View Events</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow shadow-lg p-3 bg-danger text-white transform-scale">
                <Card.Body className="d-flex flex-column">
                  <h3 className="mb-3 fw-bold">Live Dashboard</h3>
                  <p className="mb-4 text-white-50">Track our impact in real-time. See live statistics of donors, units collected, and more.</p>
                  <div className="mt-auto">
                    <Link to="/dashboard" className="btn btn-light text-danger fw-bold rounded-pill px-4">View Dashboard</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm p-3 hover-effect">
                <Card.Body className="d-flex flex-column">
                  <h3 className="text-danger mb-3 fw-bold">Memories & Gallery</h3>
                  <p className="text-muted mb-4">Browse through our gallery of heroes who stepped up to make a difference.</p>
                  <div className="mt-auto">
                    <Link to="/gallery" className="btn btn-outline-danger rounded-pill px-4">View Gallery</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;