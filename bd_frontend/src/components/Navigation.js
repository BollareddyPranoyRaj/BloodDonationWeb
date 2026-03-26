import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  // Hide Navbar on Admin pages if desired (optional, but good for clean admin views)
  if (location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-danger fs-4 d-flex align-items-center">
          <span className="me-2 fs-3">🩸</span> Aditya Blood Care
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link 
              as={NavLink} 
              to="/" 
              className={({ isActive }) => `mx-2 fw-semibold ${isActive ? 'text-danger' : 'text-dark'}`}
            >
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={NavLink} 
              to="/events" 
              className={({ isActive }) => `mx-2 fw-semibold ${isActive ? 'text-danger' : 'text-dark'}`}
            >
              Camps
            </Nav.Link>
            
            <Nav.Link 
              as={NavLink} 
              to="/gallery" 
              className={({ isActive }) => `mx-2 fw-semibold ${isActive ? 'text-danger' : 'text-dark'}`}
            >
              Gallery
            </Nav.Link>
            
            <Nav.Link 
              as={NavLink} 
              to="/dashboard" 
              className={({ isActive }) => `mx-2 fw-semibold ${isActive ? 'text-danger' : 'text-dark'}`}
            >
              Live Dashboard
            </Nav.Link>
            
            <Nav.Link as={Link} to="/register" className="ms-lg-3 mt-2 mt-lg-0">
              <Button variant="danger" className="rounded-pill px-4 fw-bold shadow-sm hover-effect">
                Donate Now
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;