import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="text-danger fw-bold mb-3">🩸 Blood Care</h5>
            <p className="text-white-50 pe-md-4">
              Dedicated to saving lives through voluntary blood donation across Aditya University campuses. Every drop counts.
            </p>
          </Col>
          
          <Col md={4}>
            <h5 className="text-white fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white-50 text-decoration-none hover-white transition-colors">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/events" className="text-white-50 text-decoration-none hover-white transition-colors">Donation Camps</Link>
              </li>
              <li className="mb-2">
                <Link to="/gallery" className="text-white-50 text-decoration-none hover-white transition-colors">Gallery</Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-white-50 text-decoration-none hover-white transition-colors">Live Dashboard</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="text-white fw-bold mb-3">Contact Info</h5>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2">📍 Aditya University, Surampalem</li>
              <li className="mb-2">📧 bloodcare@adityauniversity.in</li>
              <li className="mb-2">📞 +91 99999 00000</li>
              <li className="mt-4">
                <Link to="/admin" className="text-muted text-decoration-none border-bottom border-secondary pb-1" style={{ fontSize: '0.85rem' }}>
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="border-secondary my-4" />
        
        <div className="text-center text-white-50">
          <small>&copy; {new Date().getFullYear()} Aditya University Blood Donation Drive. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;