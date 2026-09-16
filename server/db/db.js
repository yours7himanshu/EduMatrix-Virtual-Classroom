/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const mongoose = require('mongoose');

const connectDB = async (req, res) => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ Warning: MONGO_URI is not set in environment variables');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database successfully connected');
    } catch (error) {
        console.error("Error connecting to the Database:", error.message || error);
        if (res && typeof res.status === 'function') {
            res.status(500).json({
                success: false,
                error: "Error connecting to the database"
            });
        }
    }
}

module.exports = connectDB;
