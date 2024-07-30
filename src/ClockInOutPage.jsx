import { useState, useEffect } from 'react'
import Container from '@mui/material/Container';
import { InputLabel, MenuItem, Select, Button, Paper, Box, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js'

import BiceLogo from './assets/bicelogo.png'
//Database provided by Supabase
//https://supabase.com/dashboard/project/dpqtysyebtavxvgshhpd/editor/29129





// Create a single supabase client for interacting with your database
const supabase = createClient('https://dpqtysyebtavxvgshhpd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcXR5c3llYnRhdnh2Z3NoaHBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE2OTE2OSwiZXhwIjoyMDM2NzQ1MTY5fQ.K8QhNXZwjSE4Sfd4XuqCrqq7JOdDL-qLa9585CurFbE')

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
function parseTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}



async function getEmployeeNames() {
  let { data: employeeNames, error } = await supabase
    .from('employees')
    .select('name').order('name',{ascending: true});

  if (error) {
    console.error('Error fetching employee names:', error.message);
    return [];
  } else {

    return employeeNames;
  }
}



//Returns an employee by name
async function getEmployee(name) {
  const { data: employee, error } = await supabase
    .from('employees') // Ensure 'employees' is the correct table name
    .select('*')
    .eq('name', name); // Filter by name

  if (error) {
    console.error('Error fetching employees:', error.message);
  } else {
    console.log('Fetched employee:', employee);
    if (employee && employee.length > 0) {

      //For some reason it is an array :/
      return (employee[0])


    } else {
      console.error('No Employee with that name:', error.message);
    }
  }
}



//Have a variable tracking the current employee object.
//On top of everything global so it doesn't get reset to null
let currentEmployee = null

function ClockInOutPage() {








  //const employeeNames = ["alice", "bob", "charlie", "david", "doe", "eve", "frank","grace", "john", "nyle", "salar" ]




  const [employee, setEmployee] = useState('')
  const [buttonType, setButtonType] = useState('clockIn') // clockIn or clockOut
  const [employeeNames, setEmployeeNames] = useState([])


  //This is going to be the text saying the most recent message from the employee
  const [displayText, setDisplayText] = useState('')


  //Blank array only runs on start, this will fetch the employee names
  useEffect(() => {

    async function fetchEmployeeNames() {
      let employeeNames = await getEmployeeNames()

      //Returns it as seperate objects with a name property, so you need to map it to get the names
      setEmployeeNames(employeeNames.map((employee) => employee.name))

    }
    fetchEmployeeNames().then(() => {

    }).catch((error) => {
      console.log(error)
    })



  }, [])


  useEffect(() => {

    let employeeData = null;
    //The correct syntax
    async function fetchSelectedEmployeeData() {
      employeeData = await getEmployee(employee)
      currentEmployee = employeeData
    }
    fetchSelectedEmployeeData().then(() => {


      //Set the Appropriate button type
      if (employeeData.isWorking === true) {
        setButtonType('clockOut')
      }
      else {
        setButtonType('clockIn')
      }





      //Only display previous actions if they have an existing action
      if (employeeData.workLog.length > 0) {
        //Display the last message
        const timeOfLastAction = employeeData.workLog[employeeData.workLog.length - 1].actions[employeeData.workLog[employeeData.workLog.length - 1].actions.length - 1].time
        const actionOfLastAction = employeeData.workLog[employeeData.workLog.length - 1].actions[employeeData.workLog[employeeData.workLog.length - 1].actions.length - 1].action
        setDisplayText("Hello, " + employee + '. You performed: "' + actionOfLastAction + '" at ' + timeOfLastAction)
      }

      //If no exising actions, just say hello
      else {
        setDisplayText("Hello, " + employee + '. Welcome to Best In Class!')
      }

    }).catch((error) => {
      console.log(error)
    })





  }, [employee]);






  function handleEmployeeChange(event) {
    setEmployee(event.target.value)



  }




  function handleButtonPress() {

    if (employee === '') {

      return
    }

    //Have a confirmation dialog
    const result = confirm('Are you sure you want to peform this action for ' + employee.toUpperCase() + '?')
    if (!result) {
      return
    }

    //Switch the button
    if (buttonType === 'clockIn') {
      setButtonType('clockOut')
    }
    else {
      setButtonType('clockIn')
    }

    // Update the database
    async function updateEmployeeIsWorking() {
      const { data, error } = await supabase
        .from('employees')
        .update({ isWorking: buttonType === 'clockIn' })
        .eq('name', employee);

      if (error) {
        console.error('Error updating employee:', error.message);
      } else {
        console.log('Employee updated:', data);
      }
    }


    //Get the work log from the current employee stored in a variable
    let workLog = currentEmployee.workLog





    //Check if any logs
    if (workLog.length > 0) {

      //if the action is being done on the same day as the last entry
      if (workLog[workLog.length - 1].date === formatDate(new Date())) {


        //Add this action to the list of actions for that day
        workLog[workLog.length - 1].actions.push({

          time: formatTime(new Date()),

          action: buttonType // buttonType is the correct one because state hasn't updated yet
        })

        //If adding a clock out, update hoursWorked for that days entry, so that this won't need to be constantly recalculated front end
        if (buttonType === 'clockOut') {



          let totalMinutesWorked = 0;
          let clockInTime = null;

          workLog[workLog.length - 1].actions.forEach((action) => {
            if (action.action === 'clockIn') {
              clockInTime = parseTime(action.time);
            } else if (action.action === 'clockOut' && clockInTime !== null) {
              const clockOutTime = parseTime(action.time);
              totalMinutesWorked += (clockOutTime - clockInTime) / (1000 * 60); // convert milliseconds to minutes
              clockInTime = null;
            }
          });

          const totalHoursWorked = totalMinutesWorked / 60; // convert minutes to hours
          workLog[workLog.length - 1].hoursWorked = totalHoursWorked;



        }



      }

      //If no previous logs for the day, add a new day log. Can only be a clock in
      else {
        workLog.push({

          date: formatDate(new Date()),
          hoursWorked: 0,
          actions: [{
            time: formatTime(new Date()),

            action: "clockIn"

          }]
        })

      }
    }
    //If nothing exists in the logs, create a new log. Can only be a clock in
    else {
      workLog.push({

        date: formatDate(new Date()),
        actions: [{
          time: formatTime(new Date()),

          action: "clockIn"

        }]
      })
    }



    async function updateEmployeeWorkLog() {
      const { data, error } = await supabase
        .from('employees')
        .update({ workLog: workLog })
        .eq('name', employee);

      if (error) {
        console.error('Error updating employee:', error.message);
      } else {
        console.log('Employee updated:', data);
      }
    }




    updateEmployeeIsWorking().catch(console.error);
    updateEmployeeWorkLog().catch(console.error);


  }

  return (
    <>
      <Container>



        <Paper elevation={2} sx={{
          padding: 2,
          height: '50vh',
          marginTop: '20vh',
        }}>
          <Box sx={{
            display: 'flex',
            width: '50%',
            justifyContent: 'center', // Centers the image horizontally
            alignItems: 'center', // Centers the image vertically
          }}>
            <img src={BiceLogo} alt="Bice Logo" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
          <Box sx={
            {
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }
          }>

            {/* <Typography variant='h4'>Best In Class Hours Tracker</Typography> */}
            <InputLabel id="employee-selector-label">Name</InputLabel>
            <Select labelId='employee-selector-label'
              value={employee}
              label='Name'
              onChange={handleEmployeeChange}

            >

              {employeeNames.map((name, key) => (


                <MenuItem value={name} key={key}>{name}</MenuItem>




              ))}



            </Select>

            {buttonType === 'clockIn' && <Button color='success' onClick={handleButtonPress} variant="contained">Clock In</Button>}
            {buttonType === 'clockOut' && <Button color='error' onClick={handleButtonPress} variant="contained">Clock Out</Button>}

            <h1>{displayText}</h1>

          </Box>

        </Paper>

      </Container>
    </>
  )
}

export default ClockInOutPage
