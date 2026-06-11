import {forwardRef, useState, useEffect } from 'react'
import Container from '@mui/material/Container';
import { MenuItem, Select, Button, Paper, Box, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
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
    .select('name').order('name', { ascending: true });

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


//Transition for Dialogue
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});



function ClockInOutPage() {








  //const employeeNames = ["alice", "bob", "charlie", "david", "doe", "eve", "frank","grace", "john", "nyle", "salar" ]




  const [employee, setEmployee] = useState('')
  const [buttonType, setButtonType] = useState('clockIn') // clockIn or clockOut
  const [employeeNames, setEmployeeNames] = useState([])

  const [confirmationDialogueOpen, setConfirmationDialogueOpen] = useState(false)

  function handleConfirmationDialogueClose() {
    setConfirmationDialogueOpen(false)
  }
  
  
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




  //This will refresh the page every 5 minutes so that no one is stuck with an old client
  useEffect(() => {


    setInterval(() => {
      window.location.reload()

    }, 1000 * 60 * 5)
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
        const dateOfLastAction = employeeData.workLog[employeeData.workLog.length - 1].date
        
       
        actionOfLastAction === 'clockIn' ? setDisplayText("Hello, " + employee + ". On " + dateOfLastAction + ' you clocked in at ' + timeOfLastAction) : setDisplayText("Hello, " + employee + ". On " + dateOfLastAction + ' you clocked out at ' + timeOfLastAction)

       



      }

      //If no exising actions, just say hello
      else {
        setDisplayText("Hello, " + employee + '. Welcome to Best In Class!')
      }

    }).catch((error) => {
      console.log(error)
    })

    
   


  }, [employee, buttonType]); //Also check for button type so that it can update the text when the button is pressed






  function handleEmployeeChange(event) {
    setEmployee(event.target.value)



  }




  //When the dialogue to confirm the action is pressed, this will handle the action
  function handleAgreeToButtonPress() {


    //Close the Dialogue
    setConfirmationDialogueOpen(false)

    if (employee === '') {
      alert("Invalid Selection")
    
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

  const isClockIn = buttonType === 'clockIn'

  // Brand colors from the BICE logo
  const brandBlue = '#1a4fa0'
  const brandGreen = '#2a7a30'
  const clockOutRed = '#c0392b'

  return (
    <>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #dce8f7 0%, #eef5ee 60%, #dceadc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        marginLeft: '-24px',
        width: 'calc(100% + 48px)',
      }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>

          <Paper elevation={4} sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 8px 40px rgba(26,79,160,0.13)',
          }}>

            {/* Logo section */}
            <Box sx={{
              background: '#fff',
              px: 4,
              pt: 3,
              pb: 2,
              display: 'flex',
              justifyContent: 'center',
              borderBottom: `1px solid #eef2f8`,
            }}>
              <img src={BiceLogo} alt="Best In Class Logo" style={{ maxHeight: 72, objectFit: 'contain' }} />
            </Box>

            {/* Blue header band */}
            <Box sx={{
              background: brandBlue,
              px: 4,
              py: 1.5,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Typography sx={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
              }}>
                Employee Time Tracker
              </Typography>
            </Box>

            {/* Green accent stripe */}
            <Box sx={{ height: 4, background: brandGreen }} />

            <Box sx={{ px: 4, py: 4 }}>

              {/* Status badge — shown after selecting an employee */}
              {employee ? (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.6,
                    borderRadius: 10,
                    background: isClockIn ? 'rgba(42,122,48,0.08)' : 'rgba(192,57,43,0.08)',
                    border: `1.5px solid ${isClockIn ? 'rgba(42,122,48,0.3)' : 'rgba(192,57,43,0.3)'}`,
                  }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isClockIn ? brandGreen : clockOutRed,
                    }} />
                    <Typography sx={{
                      color: isClockIn ? brandGreen : clockOutRed,
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {isClockIn ? 'Not clocked in' : 'Currently clocked in'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography sx={{
                  textAlign: 'center',
                  color: '#888',
                  fontSize: 15,
                  mb: 3,
                  fontWeight: 500,
                }}>
                  Welcome! Please select your name below.
                </Typography>
              )}

              {/* Employee selector */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{
                  color: brandBlue,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  mb: 1,
                  textTransform: 'uppercase',
                }}>
                  Your Name
                </Typography>
                <Select
                  value={employee}
                  onChange={handleEmployeeChange}
                  displayEmpty
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    background: '#f4f7fc',
                    color: employee ? '#111' : '#999',
                    fontWeight: employee ? 600 : 400,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c5d5ee' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brandBlue },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brandBlue },
                    '& .MuiSvgIcon-root': { color: brandBlue },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>Choose your name...</Typography>
                  </MenuItem>
                  {employeeNames.map((name, key) => (
                    <MenuItem value={name} key={key}>{name}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Clock In / Out button */}
              <Button
                fullWidth
                variant="contained"
                disabled={!employee}
                onClick={() => setConfirmationDialogueOpen(true)}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  background: isClockIn
                    ? `linear-gradient(90deg, ${brandGreen}, #3a9a40)`
                    : `linear-gradient(90deg, ${clockOutRed}, #e74c3c)`,
                  boxShadow: isClockIn
                    ? '0 4px 16px rgba(42,122,48,0.35)'
                    : '0 4px 16px rgba(192,57,43,0.35)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: isClockIn
                      ? '0 6px 20px rgba(42,122,48,0.45)'
                      : '0 6px 20px rgba(192,57,43,0.45)',
                    background: isClockIn
                      ? `linear-gradient(90deg, ${brandGreen}, #3a9a40)`
                      : `linear-gradient(90deg, ${clockOutRed}, #e74c3c)`,
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#aaa',
                    boxShadow: 'none',
                  },
                }}
              >
                {isClockIn ? 'Clock In' : 'Clock Out'}
              </Button>

              {/* Last action message */}
              {displayText && (
                <Box sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  background: '#f4f7fc',
                  border: `1px solid #c5d5ee`,
                  textAlign: 'center',
                }}>
                  <Typography sx={{ color: '#444', fontSize: 14 }}>
                    {displayText}
                  </Typography>
                </Box>
              )}

            </Box>
          </Paper>

          {/* Footer */}
          <Typography sx={{ textAlign: 'center', color: '#aaa', fontSize: 12, mt: 2 }}>
            © Best In Class Education Center
          </Typography>

        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogueOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleConfirmationDialogueClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
            overflow: 'hidden',
          }
        }}
      >
        {/* Dialog header stripe */}
        <Box sx={{
          background: isClockIn ? brandGreen : clockOutRed,
          px: 3, py: 2,
        }}>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            {isClockIn ? 'Clock In' : 'Clock Out'}
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText>
            Confirm {isClockIn ? 'clock in' : 'clock out'} for{' '}
            <strong style={{ color: brandBlue }}>{employee}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleConfirmationDialogueClose}
            sx={{ color: '#666', borderRadius: 2, px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgreeToButtonPress}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: isClockIn ? brandGreen : clockOutRed,
              '&:hover': {
                background: isClockIn ? '#236528' : '#a93226',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ClockInOutPage
