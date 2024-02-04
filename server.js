const fs = require('fs');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


// Helper function to calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

app.post('/signup', async (req, res) => {
    console.log('Received request body:');
    console.log(JSON.stringify(req.body, null, 2));

    const { name, age, phone, address, password, volunteer } = req.body;

    const usersFile = path.join(__dirname, 'users.json');

    // Geocode the address to get latitude and longitude
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: 'AIzaSyAnDa-MRQ9oAYTmCTigfoD_qF4oI43-RgI'
            }
        });

        const result = response.data.results[0];
        if (result) {
            const { lat, lng } = result.geometry.location;

            // Load polling locations from locations.json
            const locationsData = fs.readFileSync('locations.json');
            const locations = JSON.parse(locationsData);

            // Find the nearest polling location
            let nearestLocation = locations.reduce((nearest, location) => {
                const distance = calculateDistance(lat, lng, location.latitude, location.longitude);
                return (distance < nearest.distance) ? { location, distance } : nearest;
            }, { location: null, distance: Infinity }).location;


            // Create a user object with latitude and longitude
            const user = {
                name,
                age,
                phone,
                address,
                password,
                volunteer,
                latitude: lat,
                longitude: lng,
                nearestPollingLocation: {
                    address: nearestLocation.address,
                    latitude: nearestLocation.latitude,
                    longitude: nearestLocation.longitude
                },
            };

            // Read the current users
            fs.readFile(usersFile, (err, data) => {
                if (err && err.code === 'ENOENT') {
                    // If users.json doesn't exist, create a new file with the user as the first entry
                    const users = [user];
                    fs.writeFile(usersFile, JSON.stringify(users, null, 2), (err) => {
                        if (err) throw err;
                        if (volunteer) {
                            res.redirect('/carpoll-volunteer?phone=' + encodeURIComponent(req.body.phone));
                        } else {
                            res.redirect('/carpoll?phone=' + encodeURIComponent(req.body.phone));
                        }
                    });
                } else if (err) {
                    console.error(err);
                    res.status(500).send('Server error');
                } else {
                    // If users.json exists, check if user already exists and append if not
                    const users = JSON.parse(data);
                    if (users.some(user => user.phone === phone)) {
                        res.status(400).send('User already exists');
                    } else {
                        users.push(user);
                        fs.writeFile(usersFile, JSON.stringify(users, null, 2), (err) => {
                            if (err) throw err;
                            if (volunteer) {
                                res.redirect('/carpoll-volunteer?phone=' + encodeURIComponent(req.body.phone));
                            } else {
                                res.redirect('/carpoll?phone=' + encodeURIComponent(req.body.phone));
                            }
                        });
                    }
                }
            });
        } else {
            res.status(400).send('Invalid address');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    fs.readFile('users.json', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const user = users.find(u => u.phone === phone && u.password === password);
        if (user) {
            if (user.volunteer) {
                res.redirect('/carpoll-volunteer?phone=' + encodeURIComponent(req.body.phone));
            } else {
                res.redirect('/carpoll?phone=' + encodeURIComponent(req.body.phone));
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});


app.get('/carpoll', (req, res) => {
    // Serve the carpool page
    res.sendFile(path.join(__dirname, 'public', 'carpoll.html'));
});

app.get('/carpoll-volunteer', (req, res) => {
    // Serve the carpool page
    res.sendFile(path.join(__dirname, 'public', 'carpoll-volunteer.html'));
});

app.get('/getLatLng', function(req, res) {
    const phone = req.query.phone;
    console.log("phone: " + phone);
    fs.readFile('users.json', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const user = users.find(u => u.phone === phone);
        if (user) {
            console.log("User found: " + user.name + " at " + user.latitude + ", " + user.longitude);
            // Include nearestPollingLocation in the response
            res.json({
                lat: user.latitude, 
                lng: user.longitude,
                nearestPollingLocation: user.nearestPollingLocation
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.get('/getUserName', function(req, res) {
    const phone = req.query.phone;
    fs.readFile('users.json', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const user = users.find(u => u.phone === phone);
        if (user) {
            res.json({ name: user.name });
        } else {
            res.status(404).send('User not found');
        }
    });
});


app.get('/getLocations', (req, res) => {
    // Serve the locations data from locations.json
    fs.readFile('locations.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        const locations = JSON.parse(data);
        res.json(locations);
    });
});

app.post('/saveVoteDetails', (req, res) => {
    const { phone, voteDate, voteTime } = req.body;

    fs.readFile('users.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        let users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.phone === phone);

        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }

        // Update user with the selected date and time
        users[userIndex].voteDate = voteDate;
        users[userIndex].voteTime = voteTime;

        fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }

            // Redirect to match.html with query parameters
            res.redirect(`/match?date=${voteDate}&time=${voteTime}&location=${encodeURIComponent(users[userIndex].nearestPollingLocation.address)}`);
        });
    });
});

app.get('/match', (req, res) => {
    const { date, time, location } = req.query;

    fs.readFile('users.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const users = JSON.parse(data);
        const matchingUsers = users.filter(user => 
            user.voteDate === date && 
            user.voteTime === time && 
            user.nearestPollingLocation.address === location
        );

        // You might need to serve match.html differently, depending on your setup.
        // Here, we're sending matchingUsers data to be handled on the client side.
        // This could be done via server-side rendering or by embedding the data into the page.
        res.sendFile(path.join(__dirname, 'public', 'match.html'));
    });
});

app.get('/getMatches', (req, res) => {
    const { date, time, location } = req.query;

    fs.readFile('users.json', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send('Internal Server Error');
        }

        const users = JSON.parse(data);
        const matchingUsers = users.filter(user => 
            user.voteDate === date && 
            user.voteTime === time && 
            decodeURIComponent(user.nearestPollingLocation.address) === decodeURIComponent(location)
        );

        // Assuming you have a method to get the polling location details
        const pollingLocation = {
            address: location,
            // You might have latitude and longitude stored differently
            // This is just an example
            latitude: matchingUsers[0]?.nearestPollingLocation.latitude,
            longitude: matchingUsers[0]?.nearestPollingLocation.longitude
        };

        res.json({
            matches: matchingUsers,
            pollingLocation: pollingLocation
        });
    });
});

app.get('/logout', (req, res) => {
    // Here you would handle your actual logout logic, like clearing session data

    // Redirect to the index page after logout
    res.redirect('/index.html');
});

app.get('/getPollingLocations', (req, res) => {
    // Read the polling locations data from the locations.json file
    fs.readFile('locations.json', (err, data) => {
        if (err) {
            console.error('Error reading locations.json:', err);
            return res.status(500).send('Internal Server Error');
        }

        const pollingLocations = JSON.parse(data);
        res.json(pollingLocations);
    });
});




app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
