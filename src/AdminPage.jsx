import { useState, useEffect } from 'react'
import { Paper, Box, Typography, Chip } from '@mui/material';
import { createClient } from '@supabase/supabase-js'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BiceLogo from './assets/bicelogo.png'

const supabase = createClient('https://dpqtysyebtavxvgshhpd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcXR5c3llYnRhdnh2Z3NoaHBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE2OTE2OSwiZXhwIjoyMDM2NzQ1MTY5fQ.K8QhNXZwjSE4Sfd4XuqCrqq7JOdDL-qLa9585CurFbE')

function isDateInRange(dateStr, startDateStr, endDateStr) {
  const date = new Date(dateStr);
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  return date >= startDate && date <= endDate;
}

async function fetchEmployees() {
  let { data: employees } = await supabase.from('employees').select('*')
  return employees
}

function AdminPage() {
  const [employees, setEmployees] = useState([])
  const [startDate, setStartDate] = useState(dayjs())
  const [endDate, setEndDate] = useState(dayjs())

  function getTotalHoursWorked(log) {
    let totalHours = 0
    log.forEach(entry => {
      if (isDateInRange(entry.date, startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))) {
        totalHours += entry.hoursWorked
      }
    })
    return totalHours
  }

  useEffect(() => {
    fetchEmployees().then(data => setEmployees(data))
  }, [])

  const brandBlue = '#1a4fa0'
  const brandGreen = '#2a7a30'

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #dce8f7 0%, #eef5ee 60%, #dceadc 100%)',
      marginLeft: '-24px',
      width: 'calc(100% + 48px)',
      pb: 6,
    }}>

      {/* Header */}
      <Box sx={{ background: '#fff', boxShadow: '0 2px 8px rgba(26,79,160,0.10)', mb: 4 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', px: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, pb: 1.5, borderBottom: '1px solid #eef2f8' }}>
            <img src={BiceLogo} alt="Best In Class Logo" style={{ maxHeight: 64, objectFit: 'contain' }} />
          </Box>
          <Box sx={{ background: brandBlue, mx: -4, px: 4, py: 1.2, display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ height: 4, background: brandGreen, mx: -4 }} />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3 }}>

        {/* Date range filter */}
        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, mb: 4, boxShadow: '0 4px 20px rgba(26,79,160,0.10)' }}>
          <Typography sx={{ color: brandBlue, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mb: 2 }}>
            Filter Date Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={date => setStartDate(date)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#f4f7fc' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c5d5ee' },
                    '& label.Mui-focused': { color: brandBlue },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brandBlue },
                  }
                }
              }}
            />
            <Typography sx={{ color: '#999', fontWeight: 500 }}>to</Typography>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={date => setEndDate(date)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#f4f7fc' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c5d5ee' },
                    '& label.Mui-focused': { color: brandBlue },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brandBlue },
                  }
                }
              }}
            />
          </Box>
        </Paper>

        {/* Employee list */}
        <Typography sx={{ color: brandBlue, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1.5 }}>
          Employees ({employees.length})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {employees.map((employee, i) => {
            const hours = getTotalHoursWorked(employee.workLog)
            const filteredLog = employee.workLog.filter(entry =>
              isDateInRange(entry.date, startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))
            )
            return (
              <Accordion
                key={i}
                elevation={2}
                sx={{
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(26,79,160,0.08)',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': { borderLeft: `4px solid ${brandBlue}` },
                }}
              >
                <AccordionSummary expandIcon={<ArrowDownwardIcon sx={{ color: brandBlue }} />}>
                  <Typography sx={{ flexGrow: 1, fontWeight: 600, color: '#1a1a1a' }}>
                    {employee.name}
                  </Typography>
                  <Chip
                    label={`${hours.toFixed(2)} hrs`}
                    size="small"
                    sx={{
                      background: hours > 0 ? 'rgba(42,122,48,0.1)' : '#f0f0f0',
                      color: hours > 0 ? brandGreen : '#999',
                      fontWeight: 700,
                      border: `1px solid ${hours > 0 ? 'rgba(42,122,48,0.25)' : '#ddd'}`,
                      mr: 1,
                    }}
                  />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: '#f4f7fc' }}>
                          <TableCell sx={{ fontWeight: 700, color: brandBlue, fontSize: 12, letterSpacing: 0.5 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: brandBlue, fontSize: 12, letterSpacing: 0.5 }}>Hours Worked</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLog.map((entry, j) => (
                          <TableRow key={j} sx={{ '&:hover': { background: '#f8f9ff' } }}>
                            <TableCell sx={{ color: '#333' }}>{entry.date}</TableCell>
                            <TableCell sx={{ color: '#333', fontWeight: 500 }}>{entry.hoursWorked.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        {filteredLog.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} sx={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                              No entries in this date range
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>

      </Box>
    </Box>
  )
}

export default AdminPage
