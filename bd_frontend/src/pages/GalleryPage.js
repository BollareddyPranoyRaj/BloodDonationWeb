import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Image Modal (Lightbox)
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/gallery`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const handleImageClick = (imgUrl) => {
    setSelectedImage(imgUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <div className="gallery-page bg-light min-vh-100 pb-5">
      {/* Header Section */}
      <div className="bg-danger text-white py-5 mb-5 shadow-sm text-center">
        <Container>
          <h1 className="fw-bold mb-3">Wall of Life Savers</h1>
          <p className="lead mb-0 text-white-75">
            Glimpses of our heroes in action during various blood donation drives.
          </p>
        </Container>
      </div>

      <Container>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-3 text-muted">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>No images found.</h4>
            <p>Check back later for updates from our recent events!</p>
          </div>
        ) : (
          <Row className="g-4">
            {images.map((img) => {
              const imageUrl = `${SERVER_BASE_URL}/Gallery/${img.filename}`;
              return (
                <Col xs={12} sm={6} md={4} lg={3} key={img._id}>
                  <div 
                    className="gallery-item shadow-sm rounded overflow-hidden" 
                    style={{ height: '250px', cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                    onClick={() => handleImageClick(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt="Blood Donation Camp" 
                      className="w-100 h-100" 
                      style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/250x250?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Fullscreen Image Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="p-0 text-center bg-dark">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Expanded view" 
              className="img-fluid" 
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GalleryPage;
