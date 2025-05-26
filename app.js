// // Inside app.js
// const bcrypt = require('bcryptjs');
// const SuperAdmin = require('./models/adminModel');

// async function createSuperAdmin() {
//   const email = 'test@example.com';
//   const plainPassword = 'password123';

//   try {
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);
//     const superAdmin = new SuperAdmin({ email, password: hashedPassword });
//     await superAdmin.save();
//     console.log('Super Admin created successfully!');
//   } catch (error) {
//     console.error('Error creating Super Admin:', error);
//   }
// }

// createSuperAdmin();
