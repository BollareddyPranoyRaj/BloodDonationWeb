import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Form } from 'react-bootstrap';
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

const CollegeTooltip = ({ active, payload, campName }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const collegeData = payload[0]?.payload;

  return (
    <div className="dashboard-event-tooltip">
      <p><strong>Camp:</strong> {campName}</p>
      <p><strong>College:</strong> {collegeData.name}</p>
      <p><strong>Participation:</strong> {collegeData.value}</p>
    </div>
  );
};

const ALL_CAMPS_OPTION = 'all-camps';

const Dashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [campEvents, setCampEvents] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState(ALL_CAMPS_OPTION);
  const [eventDistributionData, setEventDistributionData] = useState([]);
  const [activeDonutIndex, setActiveDonutIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#59c3a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];
  const HOVER_COLOR = '#2563eb';
  const MEGA_BLOOD_DRIVE_COLOR = '#f59e0b';
  const MEGA_BLOOD_DRIVE_HOVER_COLOR = '#d97706';
  const totalConfirmedDonations = eventDistributionData.reduce((sum, event) => sum + event.value, 0);
  const selectedCamp = selectedCampId === ALL_CAMPS_OPTION
    ? null
    : campEvents.find((event) => event._id === selectedCampId) || null;

  const collegeParticipationData = (selectedCamp?.Colleges || [])
    .filter((college) => college && college.trim())
    .reduce((acc, college) => {
      const normalizedCollege = college.trim();
      const existingEntry = acc.find((entry) => entry.name === normalizedCollege);

      if (existingEntry) {
        existingEntry.value += 1;
      } else {
        acc.push({ name: normalizedCollege, value: 1 });
      }

      return acc;
    }, [])
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

  const collegeChartColors = ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8', '#93c5fd', '#0f172a', '#38bdf8', '#0ea5e9'];
  const totalParticipatingColleges = collegeParticipationData.reduce((sum, college) => sum + college.value, 0);
  const isAllCampsSelected = selectedCampId === ALL_CAMPS_OPTION;
  const currentDonutData = isAllCampsSelected ? eventDistributionData : collegeParticipationData;
  const donutTitle = isAllCampsSelected ? 'Confirmed Donations By Event' : 'Colleges Participated By Camp';
  const donutCenterLabel = isAllCampsSelected ? 'Confirmed' : 'Colleges';
  const donutCenterValue = isAllCampsSelected ? totalConfirmedDonations : totalParticipatingColleges;
  const donutCenterFoot = isAllCampsSelected ? 'donations' : 'participations';

  const fetchDashboardData = useCallback(async () => {
    const getDayKey = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date.toISOString().slice(0, 10);
    };

    const buildEventLookup = (eventsList) => {
      return eventsList.reduce((lookup, event) => {
        const eventKey = getDayKey(event.Date);

        if (eventKey) {
          lookup[eventKey] = event.EventName;
        }

        return lookup;
      }, {});
    };

    const getCanonicalEventName = ({ eventDateValue, eventLookup, selectedEventName = '' }) => {
      const eventKey = getDayKey(eventDateValue);

      if (!eventKey) {
        return selectedEventName || null;
      }

      return eventLookup[eventKey] || selectedEventName || null;
    };

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
      const eventLookup = buildEventLookup(events);

      const eventCounts = donatedRegistrations.reduce((acc, registration) => {
        const eventName = getCanonicalEventName({
          eventDateValue: registration.EventDate,
          eventLookup,
          selectedEventName: registration.SelectedEventName,
        });

        if (!eventName) {
          return acc;
        }

        acc[eventName] = (acc[eventName] || 0) + 1;
        return acc;
      }, {});

      staffDonors.forEach((staffDonor) => {
        const eventName = getCanonicalEventName({
          eventDateValue: staffDonor.EventDate,
          eventLookup,
        });

        if (!eventName) {
          return;
        }

        eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
      });

      guestManagementDonors.forEach((guestManagementDonor) => {
        const eventName = getCanonicalEventName({
          eventDateValue: guestManagementDonor.EventDate,
          eventLookup,
        });

        if (!eventName) {
          return;
        }

        eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
      });

      const formattedPieData = Object.keys(eventCounts)
        .map(key => ({ name: key, value: eventCounts[key] }))
        .sort((a, b) => b.value - a.value); // <-- This forces largest to smallest!

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
      setCampEvents(events);
      setEventDistributionData(formattedPieData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!campEvents.length) {
      return;
    }

    const hasSelectedCamp = campEvents.some((event) => event._id === selectedCampId);

    if (selectedCampId !== ALL_CAMPS_OPTION && !hasSelectedCamp) {
      setSelectedCampId(ALL_CAMPS_OPTION);
    }
  }, [campEvents, selectedCampId]);

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
  }, [fetchDashboardData]);

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
                <div className="d-flex flex-column gap-3">
                  <h5 className="fw-bold text-dark mb-0">{donutTitle}</h5>
                  <Form.Select
                    value={selectedCampId}
                    onChange={(event) => {
                      setSelectedCampId(event.target.value);
                      setActiveDonutIndex(null);
                    }}
                    className="dashboard-camp-select"
                    disabled={!campEvents.length}
                  >
                    <option value={ALL_CAMPS_OPTION}>All Camps Conducted</option>
                    {campEvents.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.EventName} - {new Date(event.Date).toLocaleDateString()}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="dashboard-donut-body">
                {currentDonutData.length > 0 ? (
                  <div className="dashboard-donut-layout">
                    <div className="dashboard-donut-chart-wrap">
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={currentDonutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={82}
                            outerRadius={126}
                            paddingAngle={4}
                            dataKey="value"
                            activeIndex={activeDonutIndex ?? undefined}
                            onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                            onMouseLeave={() => setActiveDonutIndex(null)}
                          >
                            {currentDonutData.map((entry, index) => {
                              if (!isAllCampsSelected) {
                                return (
                                  <Cell
                                    key={`college-cell-${entry.name}`}
                                    fill={collegeChartColors[index % collegeChartColors.length]}
                                    stroke={activeDonutIndex === index ? '#eff6ff' : '#ffffff'}
                                    strokeWidth={activeDonutIndex === index ? 6 : 3}
                                    style={{
                                      filter: activeDonutIndex === index
                                        ? 'drop-shadow(0 12px 22px rgba(37, 99, 235, 0.2))'
                                        : 'none',
                                      cursor: 'pointer',
                                      transition: 'all 0.25s ease',
                                    }}
                                  />
                                );
                              }

                              const isMegaBloodDrive = /mega blood drive/i.test(entry.name);
                              const isActive = activeDonutIndex === index;
                              const sliceFill = isMegaBloodDrive
                                ? isActive
                                  ? MEGA_BLOOD_DRIVE_HOVER_COLOR
                                  : MEGA_BLOOD_DRIVE_COLOR
                                : isActive
                                  ? HOVER_COLOR
                                  : COLORS[index % COLORS.length];
                              const sliceStroke = isMegaBloodDrive
                                ? isActive
                                  ? '#b45309'
                                  : '#d97706'
                                : isActive
                                  ? '#eff6ff'
                                  : '#e2e8f0';

                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={sliceFill}
                                  stroke={sliceStroke}
                                  strokeWidth={isMegaBloodDrive ? (isActive ? 5 : 4) : (isActive ? 6 : 3)}
                                  style={{
                                    filter: isMegaBloodDrive || isActive
                                      ? `drop-shadow(0 12px 22px ${isMegaBloodDrive ? 'rgba(245, 158, 11, 0.26)' : 'rgba(37, 99, 235, 0.2)'})`
                                      : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                  }}
                                />
                              );
                            })}
                          </Pie>
                          <RechartsTooltip
                            offset={24}
                            content={({ active, payload }) => (
                              isAllCampsSelected ? (
                                <EventTooltip
                                  active={active}
                                  payload={payload}
                                  total={totalConfirmedDonations}
                                />
                              ) : (
                                <CollegeTooltip
                                  active={active}
                                  payload={payload}
                                  campName={selectedCamp?.EventName || 'Selected Camp'}
                                />
                              )
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className={`dashboard-donut-center ${activeDonutIndex !== null ? 'is-dimmed' : ''}`}>
                        <span className="dashboard-donut-center-label">{donutCenterLabel}</span>
                        <strong className="dashboard-donut-center-value">{donutCenterValue}</strong>
                        <span className="dashboard-donut-center-foot">{donutCenterFoot}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted px-4">
                    {isAllCampsSelected
                      ? 'No confirmed event-wise donations yet. Add or confirm donors to see this breakdown.'
                      : 'This camp does not have any college entries yet.'}
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
