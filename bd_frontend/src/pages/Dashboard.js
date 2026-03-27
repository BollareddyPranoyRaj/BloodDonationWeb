import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';

const Dashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [bloodGroupData, setBloodGroupData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const fetchDashboardData = async () => {
    try {
      const [registrationsRes, eventsRes, volunteersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/registrations`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/volunteers`)
      ]);

      const registrations = registrationsRes.data || [];
      const events = eventsRes.data || [];
      const volunteers = volunteersRes.data || [];

      const bloodGroupCounts = registrations.reduce((acc, registration) => {
        const bloodGroup = registration.bloodgroup || registration.BloodGroup || 'Unknown';
        acc[bloodGroup] = (acc[bloodGroup] || 0) + 1;
        return acc;
      }, {});

      const formattedPieData = Object.keys(bloodGroupCounts).map(key => ({
        name: key,
        value: bloodGroupCounts[key]
      }));

      setOverviewData({
        NumberOfDonors: registrations.length,
        UnitsCollected: registrations.filter((registration) => registration.donated).length,
        NumberOfBloodCamps: events.length,
        RegisteredCount: registrations.length,
        StudentsCount: registrations.length,
        StaffCount: 0,
        GuestCount: 0,
        NumberOfVolunteers: volunteers.length,
      });
      setBloodGroupData(formattedPieData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Setup Socket.IO for live updates
    const socket = io(SERVER_BASE_URL, {
      transports: ["polling", "websocket"],
    });

    socket.on('connect', () => {
      console.log('Connected to Live Dashboard Feed');
    });

    // Listen for the specific event emitted from DonorController.js
    socket.on('newRegistration', (data) => {
      console.log('Live update received:', data);
      fetchDashboardData(); // Refetch data to update charts/cards instantly
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="danger" />
        <span className="ms-3 fs-5 text-muted">Loading Live Data...</span>
      </Container>
    );
  }

  return (
    <div className="dashboard-page bg-light pb-5">
      <div className="bg-danger text-white py-4 mb-5 shadow-sm">
        <Container>
          <h2 className="fw-bold mb-0">Live Impact Dashboard</h2>
          <p className="mb-0 text-white-50">Real-time statistics of Aditya University's Blood Donation Drives</p>
        </Container>
      </div>

      <Container>
        {/* Overview Cards */}
        <Row className="g-4 mb-5">
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 text-center py-3 border-bottom border-danger border-4">
              <Card.Body>
                <h6 className="text-muted text-uppercase fw-bold mb-3">Total Donors</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{overviewData?.NumberOfDonors || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 text-center py-3 border-bottom border-danger border-4">
              <Card.Body>
                <h6 className="text-muted text-uppercase fw-bold mb-3">Units Collected</h6>
                <h2 className="display-5 fw-bold text-danger mb-0">{overviewData?.UnitsCollected || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 text-center py-3 border-bottom border-danger border-4">
              <Card.Body>
                <h6 className="text-muted text-uppercase fw-bold mb-3">Camps Organized</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{overviewData?.NumberOfBloodCamps || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 text-center py-3 border-bottom border-danger border-4">
              <Card.Body>
                <h6 className="text-muted text-uppercase fw-bold mb-3">Registrations</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{overviewData?.RegisteredCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold text-dark">Donor Demographics</h5>
              </Card.Header>
              <Card.Body style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Students', count: overviewData?.StudentsCount || 0 },
                      { name: 'Staff', count: overviewData?.StaffCount || 0 },
                      { name: 'Guests/Mgmt', count: overviewData?.GuestCount || 0 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#f8f9fa'}} />
                    <Bar dataKey="count" fill="#dc3545" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold text-dark">Blood Group Distribution</h5>
              </Card.Header>
              <Card.Body style={{ height: '350px' }}>
                {bloodGroupData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bloodGroupData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bloodGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                    No blood group data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
