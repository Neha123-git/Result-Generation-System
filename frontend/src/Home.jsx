import React, { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8080/api'

export default function Home() {
  const [teacher, setTeacher] = useState({ name: '', className: '', subject: '' })
  const [report, setReport] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [filters, setFilters] = useState({ grade: '', gender: '', caste: '', sort: 'desc' })

  const headers = useMemo(() => ({ Authorization: localStorage.getItem('auth') }), [])

  useEffect(() => {
    // Assume login stored in localStorage
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      setTeacher({ name: user.username, className: user.assignedClass, subject: user.subjectCode })
    }
  }, [])

  async function fetchReport() {
    const params = new URLSearchParams(filters)
    const res = await fetch(`${API}/reports/${teacher.className}?${params}`, { headers })
    setReport(await res.json())
  }

  async function previewPdf() {
    const res = await fetch(`${API}/reports/${teacher.className}/pdf`, { headers })
    const blob = await res.blob()
    setPdfUrl(URL.createObjectURL(blob))
  }

  function logout() {
    localStorage.clear()
    window.location.href = '/login'
  }

  const summaryArray = report
    ? Object.entries(report.summary || {}).map(([k, v]) => ({ grade: k, count: v }))
    : []

  return (
    <Container fluid className="p-4" style={{ background: '#eef2f7', minHeight: '100vh' }}>

      {/* HEADER */}
      <Card className="mb-4 shadow">
        <Card.Body className="d-flex justify-content-between">
          <div>
            <h3>Generate Report Card System</h3>
            <p>Welcome, {teacher.name} ({teacher.className})</p>
          </div>
          <Button variant="danger" onClick={logout}>Logout</Button>
        </Card.Body>
      </Card>

      <Row>

        {/* LEFT PROFILE */}
        <Col md={3}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h5>👨‍🏫 Teacher Info</h5>
              <p><b>Name:</b> {teacher.name}</p>
              <p><b>Subject:</b> {teacher.subject}</p>
              <p><b>Class:</b> {teacher.className}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* CENTER */}
        <Col md={6}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h5>Filters</h5>
              <Row>
                <Col><Form.Select onChange={e => setFilters({ ...filters, grade: e.target.value })}><option value="">Grade</option><option>A</option><option>B</option></Form.Select></Col>
                <Col><Form.Select onChange={e => setFilters({ ...filters, gender: e.target.value })}><option value="">Gender</option><option>Male</option><option>Female</option></Form.Select></Col>
                <Col><Form.Select onChange={e => setFilters({ ...filters, caste: e.target.value })}><option value="">Caste</option><option>OPEN</option><option>OBC</option></Form.Select></Col>
              </Row>
              <Button className="mt-2" onClick={fetchReport}>Load Report</Button>
            </Card.Body>
          </Card>

          {report && (
            <Card className="shadow-sm">
              <Card.Body>
                <h5>Students</h5>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Caste</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map(r => (
                      <tr key={r.id}>
                        <td>{r.studentName}</td>
                        <td>{r.gender}</td>
                        <td>{r.caste}</td>
                        <td>{r.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* RIGHT */}
        <Col md={3}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h5>Summary</h5>
              {summaryArray.map(s => (
                <div key={s.grade} className="d-flex justify-content-between">
                  <span>{s.grade}</span>
                  <Badge bg="primary">{s.count}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Button onClick={previewPdf}>Preview PDF</Button>
              {pdfUrl && <iframe src={pdfUrl} className="w-100 mt-2" style={{ height: 300 }} />}
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  )
}
