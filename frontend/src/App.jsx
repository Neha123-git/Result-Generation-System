import React, { useMemo, useState } from 'react'

const API = 'http://localhost:8080/api'

function toAuth(username, password) {
  return 'Basic ' + btoa(`${username}:${password}`)
}

export default function App() {
  const [auth, setAuth] = useState({ username: 'teacher1', password: 'teacher123' })
  const [className, setClassName] = useState('FYBCS')
  const [grade, setGrade] = useState('')
  const [gender, setGender] = useState('')
  const [caste, setCaste] = useState('')
  const [sort, setSort] = useState('desc')
  const [report, setReport] = useState(null)
  const [message, setMessage] = useState('')

  const headers = useMemo(() => ({ Authorization: toAuth(auth.username, auth.password) }), [auth])

  async function checkLogin() {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auth)
    })
    const data = await res.json()
    setMessage(data.message || 'Login checked')
    if (data.assignedClass) setClassName(data.assignedClass)
  }

  async function uploadExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/upload/excel`, { method: 'POST', headers, body: form })
    setMessage(await res.text())
  }

  async function fetchReport() {
    const params = new URLSearchParams({ sort })
    if (grade) params.set('grade', grade)
    if (gender) params.set('gender', gender)
    if (caste) params.set('caste', caste)

    const res = await fetch(`${API}/reports/${className}?${params.toString()}`, { headers })
    setReport(await res.json())
  }

  async function downloadPdf() {
    const res = await fetch(`${API}/reports/${className}/pdf`, { headers })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${className}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ fontFamily: 'Arial', margin: 20 }}>
      <h2>Report Card System</h2>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <h3>Login</h3>
        <input placeholder="Username" value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} />
        <input placeholder="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} style={{ marginLeft: 8 }} />
        <button onClick={checkLogin} style={{ marginLeft: 8 }}>Check Login</button>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <h3>Upload Excel</h3>
        <input type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
      </section>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
        <h3>Filter & Analytics</h3>
        <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class" />
        <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade category" style={{ marginLeft: 8 }} />
        <input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" style={{ marginLeft: 8 }} />
        <input value={caste} onChange={(e) => setCaste(e.target.value)} placeholder="Caste" style={{ marginLeft: 8 }} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="desc">Best first</option>
          <option value="asc">Lowest first</option>
        </select>
        <button onClick={fetchReport} style={{ marginLeft: 8 }}>Load Report</button>
        <button onClick={downloadPdf} style={{ marginLeft: 8 }}>Download PDF</button>
      </section>

      {message && <p><b>Status:</b> {message}</p>}

      {report && (
        <section>
          <h3>Summary</h3>
          <pre>{JSON.stringify(report.summary, null, 2)}</pre>

          <h3>Top Performers</h3>
          <ul>
            {(report.topPerformers || []).map((s) => (
              <li key={`${s.id}-${s.studentName}`}>{s.studentName} - {s.marks} ({s.gradeCategory || 'computed'})</li>
            ))}
          </ul>

          <h3>Rows</h3>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th><th>Gender</th><th>Caste</th><th>Subject</th><th>Teacher</th><th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {(report.rows || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.studentName}</td>
                  <td>{r.gender}</td>
                  <td>{r.caste}</td>
                  <td>{r.subjectCode}</td>
                  <td>{r.teacherName}</td>
                  <td>{r.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
