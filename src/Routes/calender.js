const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require("../models/membersModel");
const {checkAuth} =require('../middlewares/checkAuth');
const Poll = require('../models/pollModel');
const Team = require('../models/teamModels');


const {google} = require('googleapis');
const { OAuth2 } = google.auth;


const OAuth2Client = new OAuth2('1062925095810-ulo7ukmiu71e05m6sl0qho56e9sdin9s.apps.googleusercontent.com',
'MbaxwiIPxH7eouLgryF6imTV',
'http://localhost:3000/google');


// setting refresh token
OAuth2Client.setCredentials({
    refresh_token: 'L9IrgjP_nEXuKEjPDvosJ4TbVEuIelfbTKhDQP33e3XceCeXlvFimdvUcRPUFggcoucUXWo',
})

const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let calendarEvent;


router.get('/teamcalender/:teamid/polls/:pollid',async(req,res)=>{
    
const poll = await Poll.findById(req.params.pollid);

const team = await Team.findById(req.params.teamid);



let eventStartTime = new Date(poll.deadline);
eventStartTime.setHours(eventStartTime.getHours() - 1);

 calendarEvent = {
  summary: `Deadline for "${poll.title}"`,
  location: '',
  description:`Do participate in the poll '${poll.title}' from your team '${team.name}'`,
  colorId: 1,
  start: {
    dateTime: eventStartTime,
    timeZone: 'Asia/Kolkata',
  },
  end: {
    dateTime: poll.deadline,
    timeZone: 'Asia/Kolkata',
  },
};

const authUrl = OAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);


})

router.get('/google',async(req,res)=>{
    OAuth2Client.getToken(req.query.code, async (err, token) => {
        if (err) {
        req.flash('error_msg','Something went wrong while accessing calender service! Try Again!')
        res.redirect('/teams');
          return console.error("Error retrieving access token", err);
        }
        OAuth2Client.setCredentials(token);
        await start(req, res);
      });
    
})

function start(req, res) {
    calendar.events.insert(
      {
        auth: OAuth2Client,
        calendarId: "primary",
        resource: calendarEvent,
      },
      function (err, event) {
        if (err) {
          req.flash('error_msg','Something went wrong while accessing calender service! Try Again!')
          res.redirect('/teams');
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        req.flash('success_msg',"Deadline Successfully added to your Google Calender!");
        res.redirect(`/teams/${team._id}`);
      }
    );
  }


module.exports = router;