import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";


export default function Admindash() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    teacherName: "",
    assignedClass: "",
    subjectCode: "",
    canGenerateReport: false,
  });

  const authHeader = {
    Authorization: "Basic " + btoa("admin:admin123"),
    "Content-Type": "application/json",
  };

  const fetchTeachers = async () => {
    const res = await fetch("http://localhost:8080/api/admin/teachers", {
      headers: authHeader,
    });
    const data = await res.json();
    setTeachers(data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async () => {
    if (!form.teacherName || !form.username || !form.password) return;

    await fetch("http://localhost:8080/api/admin/teachers", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify(form),
    });

    setForm({
      username: "",
      password: "",
      teacherName: "",
      assignedClass: "",
      subjectCode: "",
      canGenerateReport: false,
    });

    fetchTeachers();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8080/api/admin/teachers/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });

    fetchTeachers();
  };

  const handleLogout = () => {
    // clear auth (if stored later)
    window.location.href = "/login";
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Admin Dashboard</h3>
        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="admin-content w-100">
        <Card className="mb-4">
          <Card.Body>
            <h2>Add Teacher</h2>

            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Form.Group><br></br>

            <Form.Group className="mb-2">
              <Form.Control
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Form.Group><br></br>

            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Teacher Name"
                value={form.teacherName}
                onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
              />
            </Form.Group><br></br>

            <Row className="mb-2">
              <Col>
                <Form.Control
                  placeholder="Class"
                  value={form.assignedClass}
                  onChange={(e) => setForm({ ...form, assignedClass: e.target.value })}
                />
              </Col><br></br>
              <Col>
                <Form.Control
                  placeholder="Subject"
                  value={form.subjectCode}
                  onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                />
              </Col><br></br>
            </Row>

            <Form.Check
              type="checkbox"
              label="Can Generate Report"
              className="mb-3"
              checked={form.canGenerateReport}
              onChange={(e) => setForm({ ...form, canGenerateReport: e.target.checked })}
            /><br></br>

            <Button onClick={handleAddTeacher}>Add Teacher</Button>
          </Card.Body>
        </Card>
      </div>
        <Card>
          <Card.Body>
            <h5>Teacher List</h5>

            {teachers.length === 0 ? (
              <p>No teachers added.</p>
            ) : (
              <ListGroup>
                {teachers.map((teacher) => (
                  <ListGroup.Item
                    key={teacher.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-bold">{teacher.teacherName}</div>
                      <div className="text-muted small">
                        {teacher.assignedClass} | {teacher.subjectCode}
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      Delete
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      
    </Container>
  );
}
