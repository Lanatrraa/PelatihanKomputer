const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to database.');
});

// Check users table
db.all('SELECT * FROM users', [], (err, users) => {
    if (err) {
        console.error('Error querying users:', err.message);
        return;
    }
    console.log('Users in database:', users.length);
    users.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.nama}, NPM: ${user.npm}`);
    });

    // Check payments table
    db.all('SELECT * FROM payments', [], (err, payments) => {
        if (err) {
            console.error('Error querying payments:', err.message);
            return;
        }
        console.log('Payments in database:', payments.length);
        payments.forEach(payment => {
            console.log(`- ID: ${payment.id}, User: ${payment.user_id}, Material: ${payment.material_name}, Price: ${payment.price}`);
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
});