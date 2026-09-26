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
require('dotenv').config({ path: '.env' });
const { resolveStudentFinancialSummary } = require('../services/studentFeeLedgerService');

async function alignTenant() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const inst10Id = new mongoose.Types.ObjectId('6aaadbc1409e39bdb4966780');
  const inst11Id = new mongoose.Types.ObjectId('6aaae7f5409e39bdb49667d2');

  // 1. Move/Upsert fee structures from nishu11 to nishu10
  const fsUpdate = await db.collection('feestructures').updateMany(
    { institutionId: inst11Id },
    { $set: { institutionId: inst10Id } }
  );
  console.log('Updated FeeStructures count to nishu10:', fsUpdate.modifiedCount);

  // 2. Update nishu13 admin to belong to nishu10
  const adminUpdate = await db.collection('admins').updateOne(
    { email: 'nishu13@gmail.com' },
    { $set: { institutionId: inst10Id, collegeName: 'nishu10' } }
  );
  console.log('Updated Admin nishu13 institution to nishu10:', adminUpdate.modifiedCount);

  // 3. Test resolveStudentFinancialSummary for student Himanshu Dinkar
  const student = await db.collection('students').findOne({ email: 'dinkarhimanshu78@gmail.com' });
  console.log('Testing financial summary for student:', student.email);

  const summary = await resolveStudentFinancialSummary(student._id);
  console.log('Financial Summary Status:', summary.status);
  console.log('Total Assessed:', summary.financialSummary.totalAssessed);
  console.log('Outstanding Balance:', summary.financialSummary.outstandingBalance);
  console.log('Configured Fee Structures Count:', summary.financialSummary.feeStructuresConfiguredCount);
  console.log('Years Breakdown:');
  for (const y of summary.years) {
    console.log(` - Year ${y.academicYear} (${y.academicSession}): assessed=${y.assessedAmount}, due=${y.dueAmount}, status=${y.status}, configured=${y.feeStructureConfigured}`);
  }

  await mongoose.disconnect();
}

alignTenant().catch(console.error);
