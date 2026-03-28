import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';

const EventTooltip = ({ active, payload, total }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const eventData = payload[0]?.payload;
  const share = total ? Math.round((eventData.value / total) * 100) : 0;

  return (
    <div className="dashboard-event-tooltip">
      <p><strong>Event:</strong> {eventData.name}</p>
      <p><strong>Confirmed Donors:</strong> {eventData.value}</p>
      <p><strong>Share:</strong> {share}%</p>
    </div>
  );
};

const Dashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [eventDistributionData, setEventDistributionData] = useState([]);
  const [activeEventIndex, setActiveEventIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#59c3a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];
  const HOVER_COLOR = '#2563eb';
  const totalConfirmedDonations = eventDistributionData.reduce((sum, event) => sum + event.value, 0);

  const getEventNameFromDate = (eventDateValue, events) => {
    if (!eventDateValue) {
      return null;
    }

    const donorDate = new Date(eventDateValue);
    donorDate.setHours(0, 0, 0, 0);

    const matchedEvent = events.find((event) => {
      const eventDate = new Date(event.Date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === donorDate.getTime();
    });

    return matchedEvent?.EventName || `Event ${donorDate.toLocaleDateString()}`;
  };

  const fetchDashboardData = async () => {
    try {
      const [registrationsRes, eventsRes, volunteersRes, staffRes, guestManagementRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/registrations`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/volunteers`),
        axios.get(`${API_BASE_URL}/staff`),
        axios.get(`${API_BASE_URL}/guest-management`)
      ]);

      const registrations = registrationsRes.data || [];
      const events = eventsRes.data || [];
      const volunteers = volunteersRes.data || [];
      const staffDonors = staffRes.data || [];
      const guestManagementDonors = guestManagementRes.data || [];
      const donatedRegistrations = registrations.filter((registration) => registration.donated);
      const totalConfirmedDonors =
        donatedRegistrations.length + staffDonors.length + guestManagementDonors.length;

      const eventCounts = donatedRegistrations.reduce((acc, registration) => {
        if (registration.SelectedEventName) {
          acc[registration.SelectedEventName] =
            (acc[registration.SelectedEventName] || 0) + 1;
          return acc;
        }

        const eventName = getEventNameFromDate(registration.EventDate, events);
        acc[eventName] = (acc[eventName] || 0) + 1;
        return acc;
      }, {});

      staffDonors.forEach((staffDonor) => {
        const eventName =
          staffDonor.Venue || getEventNameFromDate(staffDonor.EventDate, events);

        if (!eventName) {
          return;
        }

        eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
      });

      guestManagementDonors.forEach((guestManagementDonor) => {
        const eventName =
          guestManagementDonor.Venue ||
          getEventNameFromDate(guestManagementDonor.EventDate, events);

        if (!eventName) {
          return;
        }

        eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
      });

      const formattedPieData = Object.keys(eventCounts).map(key => ({
        name: key,
        value: eventCounts[key]
      }));

      setOverviewData({
        NumberOfDonors: totalConfirmedDonors,
        UnitsCollected: totalConfirmedDonors,
        NumberOfBloodCamps: events.length,
        RegisteredCount: registrations.length,
        StudentsCount: donatedRegistrations.length,
        StaffCount: staffDonors.length,
        GuestCount: guestManagementDonors.length,
        NumberOfVolunteers: volunteers.length,
      });
      setEventDistributionData(formattedPieData);

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

    socket.on('donationConfirmed', (data) => {
      console.log('Donation confirmation received:', data);
      fetchDashboardData();
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
                <h6 className="text-muted text-uppercase fw-bold mb-3">Actual Donors</h6>
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
                <h5 className="fw-bold text-dark">Confirmed Donor Demographics</h5>
              </Card.Header>
              <Card.Body style={{ height: '350px' }}>
                {(overviewData?.NumberOfDonors || 0) > 0 ? (
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
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted px-4">
                    No confirmed donors yet. The demographics chart will appear after donations are recorded.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 dashboard-donut-card">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold text-dark">Confirmed Donations By Event</h5>
              </Card.Header>
              <Card.Body className="dashboard-donut-body">
                {eventDistributionData.length > 0 ? (
                  <div className="dashboard-donut-layout">
                    <div className="dashboard-donut-chart-wrap">
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={eventDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={82}
                            outerRadius={126}
                            paddingAngle={4}
                            dataKey="value"
                            activeIndex={activeEventIndex ?? undefined}
                            onMouseEnter={(_, index) => setActiveEventIndex(index)}
                            onMouseLeave={() => setActiveEventIndex(null)}
                          >
                            {eventDistributionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={activeEventIndex === index ? HOVER_COLOR : COLORS[index % COLORS.length]}
                                stroke={activeEventIndex === index ? '#eff6ff' : '#ffffff'}
                                strokeWidth={activeEventIndex === index ? 6 : 3}
                                style={{
                                  filter: activeEventIndex === index ? 'drop-shadow(0 12px 22px rgba(37, 99, 235, 0.2))' : 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                }}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            offset={24}
                            content={({ active, payload }) => (
                              <EventTooltip
                                active={active}
                                payload={payload}
                                total={totalConfirmedDonations}
                              />
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className={`dashboard-donut-center ${activeEventIndex !== null ? 'is-dimmed' : ''}`}>
                        <span className="dashboard-donut-center-label">Confirmed</span>
                        <strong className="dashboard-donut-center-value">{totalConfirmedDonations}</strong>
                        <span className="dashboard-donut-center-foot">donations</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted px-4">
                    No confirmed event-wise donations yet. Add or confirm donors to see this breakdown.
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
