import { useState, useEffect } from 'react'
import Container from '@mui/material/Container';
import { InputLabel, MenuItem, Select, Button, Paper, Box, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';



// Create a single supabase client for interacting with your database
const supabase = createClient('https://dpqtysyebtavxvgshhpd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcXR5c3llYnRhdnh2Z3NoaHBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE2OTE2OSwiZXhwIjoyMDM2NzQ1MTY5fQ.K8QhNXZwjSE4Sfd4XuqCrqq7JOdDL-qLa9585CurFbE')

function calculateTotalTime(log) {
  let totalTime = 0;
  let lastClockInTime = null;

  log.forEach(entry => {
    const entryTime = new Date(entry.time.replace(/-/g, '/'));

    if (entry.action === "clockIn") {
      lastClockInTime = entryTime;
    } else if (entry.action === "clockOut" && lastClockInTime) {
      totalTime += (entryTime - lastClockInTime) / 1000; // Difference in seconds
      lastClockInTime = null;
    }
  });

  return totalTime / 3600; // Convert seconds to hours
}

/*
Example Usage
calculateTotalTimeBetweenRange(employee.workLog, 7, 7) gives the total hours worked in July
calculateTotalTimeBetweenRange(employee.workLog, 7, 8) gives the total hours worked between July and August
calculateTotalTimeBetweenRange(employee.workLog, 7, 9) gives the total hours worked between July and September

*/
function calculateTotalTimeBetweenRange(log, startMonth, endMonth) {
  let totalTime = 0;
  let lastClockInTime = null;

  log.forEach(entry => {
    const entryTime = new Date(entry.time.replace(/-/g, '/'));

    const entryMonth = entryTime.getMonth() + 1; // getMonth() returns month index starting from 0

    // Check if the entry month is within the specified range
    if (entryMonth >= startMonth && entryMonth <= endMonth) {
      if (entry.action === "clockIn") {
        lastClockInTime = entryTime;
      } else if (entry.action === "clockOut" && lastClockInTime) {
        totalTime += (entryTime - lastClockInTime) / 1000; // Difference in seconds
        lastClockInTime = null;
      }
    }
  });

  return totalTime / 3600; // Convert seconds to hours
}
function calculateTotalTimeBetweenRangeWithYear(log) {
  let totalTime = 0;
  let lastClockInTime = null;

  log.forEach(entry => {
    const entryTime = new Date(entry.time.replace(/-/g, '/'));
    const entryYear = entryTime.getFullYear();
    const entryMonth = entryTime.getMonth() + 1; // getMonth() returns month index starting from 0

    // Check if the entry year and month are within the specified range
    if (
      (entryYear > startYear || (entryYear === startYear && entryMonth >= startMonth)) &&
      (entryYear < endYear || (entryYear === endYear && entryMonth <= endMonth))
    ) {
      if (entry.action === "clockIn") {
        lastClockInTime = entryTime;
      } else if (entry.action === "clockOut" && lastClockInTime) {
        totalTime += (entryTime - lastClockInTime) / 1000; // Difference in seconds
        lastClockInTime = null;
      }
    }
  });

  return totalTime / 3600; // Convert seconds to hours
}
function isDateInRange(dateStr, startDateStr, endDateStr) {
  // Convert the input date strings to Date objects
  const date = new Date(dateStr);
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Check if the date is within the range, inclusive
  return date >= startDate && date <= endDate;
}








async function fetchEmployees() {

  let { data: employees, error } = await supabase
    .from('employees')
    .select('*')
  return (employees)
}



function AdminPage() {

  const [employees, setEmployees] = useState([])

  const [startDate, setStartDate] = useState(dayjs()) // THIS is seperate to Date() function
  const [endDate, setEndDate] = useState(dayjs())

//The total hours worked between the startDate and endDate
  function getTotalHoursWorked(log) {

    let totalHours = 0
    log.forEach(entry => {
      if (isDateInRange(entry.date, startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))) {
        totalHours += entry.hoursWorked
      }
    }

    )

    return totalHours

  }








  function handleStartDateChange(date) {
    setStartDate(date)
  }





  function handleEndDateChange(date) {

    setEndDate(date)
  }











  useEffect(() => {

    fetchEmployees().then((data) => {

      //Update the employees state
      setEmployees(data)
      data.forEach((employee) => {





      })


    })

  }, [])


  return (


    <>
      <Typography variant='h2'>Admin Page</Typography>

      <Typography variant="h6">Select the start and end month and year to calculate the total hours worked between the range</Typography>

      <DatePicker label="Start" value={startDate} onChange={handleStartDateChange} />
      <DatePicker label="End" value={endDate} onChange={handleEndDateChange} />





      {/* <TableContainer component={Paper}>


        <Table sx={{ minWidth: 650 }} aria-label="simple table">



          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell >Hours Worked</TableCell></TableRow>
          </TableHead>

          <TableBody>
            {employees.map((employee) => {

              return (<TableRow>

                <TableCell>{employee.name}</TableCell>
                <TableCell>{getTotalHoursWorked(employee.workLog)}</TableCell>
              </TableRow>)


            })}


          </TableBody>
        </Table>
      </TableContainer> */}



{employees.map((employee) => {
return(
<Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        
        >

          
          <Typography sx={{
            flexGrow: .8
          }}>{employee.name}</Typography>

          <Typography>Hours Worked: {getTotalHoursWorked(employee.workLog).toFixed(2)}</Typography>
          
          
        </AccordionSummary>
        <AccordionDetails>
          

          <TableContainer component={Paper}>

            <Table sx={{ minWidth: 650 }} aria-label="simple table">

              <TableHead>
<TableRow>

  <TableCell>Date</TableCell>
  <TableCell>Hours Worked</TableCell>
</TableRow>
                </TableHead>
                <TableBody>
                  {employee.workLog.map((entry) => {


                    if(isDateInRange(entry.date, startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))){
                      return (
                        <TableRow>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.hoursWorked.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    
                    }
                    
                  })}
                  </TableBody>
              </Table>
            </TableContainer>
        </AccordionDetails>
      </Accordion>

)
})}
      
      


    </>
  )
}

export default AdminPage